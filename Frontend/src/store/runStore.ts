// ─── Partida ativa ───────────────────────────────────────────────────────────
// Um `SaveSlot` em curso. É aqui que o driver de playthrough da etapa 2 vira
// produção: cena → escolha → efeitos → navegação, agora com persistência.
//
// **Zero lógica de progressão nas telas.** A tela desenha o que `current()`
// devolve e chama `choose(id)`. Quem decide o que uma escolha faz é a engine.

import { create } from 'zustand';
import {
  applyEffects,
  buildRegionCompletion,
  enterScene,
  indexQualities,
  resolveEnding,
  resolveEpilogue,
  resolveLine,
  resolveScene,
} from '@/engine';
import { REGION_REGISTRY } from '@/data/regions';
import { asyncStorageBackend } from '@/services/asyncStorageBackend';
import { eventBus } from '@/services/eventBus';
import { deleteSlot, loadSlot, novoSlot, saveSlot, type StorageBackend } from '@/services/storage';
import { useProgressStore } from './progressStore';
import type { SaveSlotId } from '@/types/dex';
import type { Condition } from '@/types/conditions';
import type { Effect } from '@/types/effects';
import type { EngineEvent } from '@/types/events';
import type { Qualities } from '@/types/qualities';
import type { RegionContent } from '@/types/region';
import type { RegionId } from '@/types/ids';
import type { PermissaoRegiao, SaveSlot } from '@/types/save';
import type { ResolvedLine, ResolvedScene, Scene } from '@/types/scene';

type RunStore = {
  run: SaveSlot | null;
  backend: StorageBackend;
  /** Última resolução com desfecho — a tela de final lê daqui. */
  desfecho: Desfecho | null;
  /** Alimenta o painel "tocadas neste percurso" do inspetor. */
  percurso: Percurso;

  setBackend: (backend: StorageBackend) => void;
  createRun: (slot: SaveSlotId) => Promise<void>;
  loadRun: (slot: SaveSlotId) => Promise<boolean>;
  closeRun: () => void;
  deleteRun: (slot: SaveSlotId) => Promise<void>;

  canEnterRegion: (regionId: RegionId) => PermissaoRegiao;
  enterRegion: (regionId: RegionId) => Promise<void>;
  choose: (choiceId: string) => Promise<void>;
  current: () => ResolvedScene | ResolvedLine | null;
  regiaoAtual: () => RegionContent | null;
  flush: () => Promise<void>;

  /** Ferramenta de autoria — ver a nota na implementação. */
  jumpToScene: (sceneId: string) => void;
};

/**
 * O que a partida **de fato tocou**, acumulado durante o percurso. É o par em
 * runtime dos avisos 17 e 18 do validador: o validador vê o conteúdo estático,
 * isto mostra o que um jogador real moveu — revelando, por exemplo, humor
 * autorado que nenhum caminho alcança.
 *
 * `lidas` tem uma definição específica e que não deve ser lida como "avaliadas":
 * são as chaves que aparecem em condição de conteúdo que **o jogador viu**. A
 * engine não registra leituras, e instrumentá-la sujaria funções puras.
 */
export type Percurso = { escritas: string[]; lidas: string[] };

export type Desfecho = {
  endingId: string;
  nome: string;
  texto: string;
  epilogo: string[];
  podeCatalogar: boolean;
};

const agora = () => Date.now();

const PERCURSO_VAZIO: Percurso = { escritas: [], lidas: [] };

const unir = (atual: string[], novas: string[]) =>
  novas.every((chave) => atual.includes(chave)) ? atual : [...new Set([...atual, ...novas])];

/** Chaves que uma condição lê, achatando `all` e `anyOf`. */
function chavesDe(condicao: Condition | undefined): string[] {
  if (!condicao) return [];
  return [...(condicao.all ?? []), ...(condicao.anyOf ?? []).flat()].map((p) => p.key);
}

/**
 * As chaves lidas pelo conteúdo de uma cena — ou de uma linha, quando é diálogo.
 * Percorre só o que o jogador tem diante de si, que é exatamente a definição de
 * `Percurso.lidas`.
 */
function chavesLidasEm(scene: Scene, lineId?: string): string[] {
  const blocos =
    scene.type === 'local'
      ? [{ variantes: scene.textos, escolhas: scene.escolhas }]
      : [scene.linhas[lineId ?? scene.linhaInicial]].filter(Boolean).map((linha) => ({
          variantes: linha.variantes,
          escolhas: linha.escolhas,
        }));

  return blocos.flatMap((bloco) => [
    ...bloco.variantes.flatMap((v) => chavesDe(v.when)),
    ...bloco.escolhas.flatMap((c) => [
      ...chavesDe(c.when),
      ...chavesDe(c.hiddenWhen),
      ...chavesDe(c.lockedWhen),
    ]),
  ]);
}

/**
 * Uma qualidade mudou? Comparação rasa: `applyEffects` sempre devolve um objeto
 * novo, então identidade não serve. É o que decide o marco de autosave dentro de
 * um diálogo (ver `choose`).
 */
function qualidadesMudaram(antes: Qualities, depois: Qualities): boolean {
  const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)]);
  for (const chave of chaves) {
    if ((antes[chave] ?? 0) !== (depois[chave] ?? 0)) return true;
  }
  return false;
}

export const useRunStore = create<RunStore>((set, get) => {
  /** Publica no barramento sem que a engine saiba quem escuta. */
  const publicar = (events: EngineEvent[]) => eventBus.emitAll(events);

  /** Grava agora. Erro é avisado, não propagado: o jogo continua jogável. */
  const gravar = async (run: SaveSlot) => {
    try {
      await saveSlot(get().backend, run);
    } catch (erro) {
      console.warn('[SACI] falha ao gravar o save; o progresso segue em memória.', erro);
    }
  };

  const regiaoDe = (run: SaveSlot | null): RegionContent | null =>
    run?.currentRegionId ? (REGION_REGISTRY[run.currentRegionId] ?? null) : null;

  /** Aplica efeitos sobre um slot, acumulando pistas, eventos e percurso. */
  const aplicarNoSlot = (regiao: RegionContent, base: SaveSlot, effects: Effect[]): SaveSlot => {
    if (effects.length === 0) return base;

    const resultado = applyEffects(base.qualities, effects, {
      qualities: indexQualities(regiao.qualities),
      atoKey: regiao.meta.atoKey,
      sceneId: base.currentSceneId,
    });

    publicar(resultado.events);
    for (const aviso of resultado.warnings) console.warn('[SACI] conteúdo:', aviso);

    const escritas = effects.flatMap((e) =>
      e.type === 'set' || e.type === 'adjust' ? [e.key] : []
    );
    const percurso = get().percurso;
    set({ percurso: { ...percurso, escritas: unir(percurso.escritas, escritas) } });

    return {
      ...base,
      qualities: resultado.qualities,
      clueOrder: [...base.clueOrder, ...resultado.newClues],
    };
  };

  /**
   * Entrar numa cena ou linha: contar a visita, resolver a variante e aplicar os
   * efeitos dela.
   *
   * Os efeitos da variante têm de valer **na entrada**, não na escolha seguinte:
   * a pista obtida por exploração precisa estar no caderno enquanto o jogador lê
   * o texto que a concede. Aplicá-la só na saída deixava a lupa marcando zero
   * enquanto a tela dizia que rastros haviam sido encontrados.
   *
   * `contarVisita` distingue trocar de cena de andar entre linhas do mesmo
   * diálogo — só a primeira é uma visita.
   */
  const entrarEm = (
    regiao: RegionContent,
    base: SaveSlot,
    sceneId: string,
    lineId: string | undefined,
    contarVisita: boolean
  ): SaveSlot => {
    const scene = regiao.scenes[sceneId];
    if (!scene) return base;

    let atualizado: SaveSlot = { ...base, currentSceneId: sceneId, currentLineId: lineId };

    if (contarVisita) {
      const entrada = enterScene(atualizado.qualities, sceneId);
      publicar(entrada.events);
      atualizado = { ...atualizado, qualities: entrada.qualities };
    }

    const resolvida =
      scene.type === 'dialogo'
        ? resolveLine(
            scene,
            scene.linhas[lineId ?? scene.linhaInicial],
            atualizado.qualities,
            atualizado.takenChoices
          )
        : resolveScene(scene, atualizado.qualities, atualizado.takenChoices);

    atualizado = aplicarNoSlot(regiao, atualizado, resolvida.pendingEffects);
    registrarLeituras(regiao, sceneId, lineId);
    return atualizado;
  };

  /** Registra o que o conteúdo diante do jogador lê. */
  const registrarLeituras = (regiao: RegionContent, sceneId: string, lineId?: string) => {
    const scene = regiao.scenes[sceneId];
    if (!scene) return;
    const atual = get().percurso;
    set({ percurso: { ...atual, lidas: unir(atual.lidas, chavesLidasEm(scene, lineId)) } });
  };

  return {
    run: null,
    backend: asyncStorageBackend,
    desfecho: null,
    percurso: { escritas: [], lidas: [] },

    setBackend: (backend) => set({ backend }),

    createRun: async (slot) => {
      const run = novoSlot(slot, agora());
      set({ run, desfecho: null, percurso: PERCURSO_VAZIO });
      await gravar(run);
      await useProgressStore.getState().marcarSlotJogado(slot);
      await useProgressStore.getState().refreshSlots();
    },

    loadRun: async (slot) => {
      const run = await loadSlot(get().backend, slot, REGION_REGISTRY);
      if (!run) return false;
      set({ run, desfecho: null, percurso: PERCURSO_VAZIO });
      await useProgressStore.getState().marcarSlotJogado(slot);
      return true;
    },

    closeRun: () => set({ run: null, desfecho: null, percurso: PERCURSO_VAZIO }),

    deleteRun: async (slot) => {
      await deleteSlot(get().backend, slot);
      if (get().run?.slot === slot) set({ run: null, desfecho: null });
      await useProgressStore.getState().refreshSlots();
    },

    /**
     * Motivos são união fechada, não string livre: a tela da etapa 6 renderiza
     * cada caso, e um motivo novo tem de quebrar a compilação dela.
     */
    canEnterRegion: (regionId) => {
      const { run } = get();
      if (!run) return { permitido: false, motivo: 'save_inexistente' };
      if (!REGION_REGISTRY[regionId]) return { permitido: false, motivo: 'regiao_desconhecida' };
      // Não é permitido rejogar uma região no mesmo save (§9).
      if (run.regioesConcluidas[regionId]) return { permitido: false, motivo: 'ja_concluida' };
      return { permitido: true };
    },

    /**
     * Uma escrita só. O slot novo sai pronto — região, cena de entrada e o
     * incremento de `visita.` no mesmo objeto — então não existe estado
     * intermediário em disco: a gravação aterrissa inteira ou não aterrissa, e
     * nesse caso o disco mantém o estado anterior, que é coerente.
     */
    enterRegion: async (regionId) => {
      const { run } = get();
      if (!run) return;
      if (!get().canEnterRegion(regionId).permitido) return;

      const regiao = REGION_REGISTRY[regionId];
      if (!regiao) return;

      const atualizado: SaveSlot = {
        ...entrarEm(
          regiao,
          { ...run, currentRegionId: regionId },
          regiao.meta.entrySceneId,
          undefined,
          true
        ),
        atualizadoEm: agora(),
      };

      set({ run: atualizado, desfecho: null });
      await gravar(atualizado);
    },

    choose: async (choiceId) => {
      const { run } = get();
      const regiao = regiaoDe(run);
      if (!run || !regiao) return;

      const scene = regiao.scenes[run.currentSceneId];
      if (!scene) return;

      const resolvida =
        scene.type === 'dialogo'
          ? resolveLine(
              scene,
              scene.linhas[run.currentLineId ?? scene.linhaInicial],
              run.qualities,
              run.takenChoices
            )
          : resolveScene(scene, run.qualities, run.takenChoices);

      const alvo = resolvida.escolhas.find((candidata) => candidata.choice.id === choiceId);
      // Travada não altera estado nenhum — é o que ensina o sistema ao jogador.
      if (!alvo || alvo.estado !== 'disponivel') return;

      // Os efeitos da variante já foram aplicados na entrada — aqui só a escolha.
      publicar([{ type: 'choiceTaken', choiceId, sceneId: run.currentSceneId }]);
      const resultado = applyEffects(run.qualities, alvo.choice.effects, {
        qualities: indexQualities(regiao.qualities),
        atoKey: regiao.meta.atoKey,
        sceneId: run.currentSceneId,
      });
      publicar(resultado.events);
      for (const aviso of resultado.warnings) console.warn('[SACI] conteúdo:', aviso);
      const escritasDaEscolha = alvo.choice.effects.flatMap((e) =>
        e.type === 'set' || e.type === 'adjust' ? [e.key] : []
      );
      const percursoAtual = get().percurso;
      set({
        percurso: { ...percursoAtual, escritas: unir(percursoAtual.escritas, escritasDaEscolha) },
      });

      // A chave vem resolvida da engine e **nunca** é remontada aqui: foi
      // exatamente esse recálculo que quebrou o `once` na etapa 2.
      const takenChoices = run.takenChoices.includes(alvo.key)
        ? run.takenChoices
        : [...run.takenChoices, alvo.key];

      let atualizado: SaveSlot = {
        ...run,
        qualities: resultado.qualities,
        clueOrder: [...run.clueOrder, ...resultado.newClues],
        takenChoices,
        atualizadoEm: agora(),
      };

      if (resultado.endRegion) {
        set({ run: atualizado });
        await encerrarRegiao(regiao, resultado.endRegion.endingId);
        return;
      }

      // ── Marcos de autosave ──────────────────────────────────────────────
      // 1. troca de cena  2. fim de região  3. app em background (App.tsx)
      // 4. linha de diálogo que produziu efeito
      let trocouDeCena = false;

      if (resultado.navigation) {
        const { sceneId, lineId } = resultado.navigation;
        trocouDeCena = sceneId !== run.currentSceneId;
        atualizado = entrarEm(regiao, atualizado, sceneId, lineId, trocouDeCena);
      }

      set({ run: atualizado });

      // Sem o marco 4, um diálogo inteiro ficaria sem gravar — e é justamente
      // onde moram duas das três pistas e todo o humor do Raimundo.
      const produziuEfeito = qualidadesMudaram(run.qualities, atualizado.qualities);
      if (trocouDeCena || produziuEfeito) await gravar(atualizado);
    },

    current: () => {
      const { run } = get();
      const regiao = regiaoDe(run);
      if (!run || !regiao) return null;

      const scene = regiao.scenes[run.currentSceneId];
      if (!scene) return null;

      return scene.type === 'dialogo'
        ? resolveLine(
            scene,
            scene.linhas[run.currentLineId ?? scene.linhaInicial],
            run.qualities,
            run.takenChoices
          )
        : resolveScene(scene, run.qualities, run.takenChoices);
    },

    regiaoAtual: () => regiaoDe(get().run),

    flush: async () => {
      const { run } = get();
      if (run) await gravar(run);
    },

    /**
     * **Ferramenta de autoria.** Salta para uma cena por id, para conferir uma
     * variante sem jogar o caminho inteiro.
     *
     * Quem restringe a `__DEV__` é o **único chamador**, `DevInspector`, que só
     * é montado sob a flag. O store não conhece flag de build: assim esta função
     * — e o incremento de visita que ela faz — continuam testáveis em node.
     *
     * Passa por `enterScene` de propósito: sem o incremento de `visita.` e o
     * evento `sceneEnter`, variantes de primeira visita não disparariam ao pular
     * e o autor depuraria um bug de conteúdo que não existe.
     *
     * **Não grava.** O salto monta um estado que nenhum caminho real produziria
     * — deixá-lo chegar ao disco contaminaria o save de verdade.
     */
    jumpToScene: (sceneId) => {
      const { run } = get();
      const regiao = regiaoDe(run);
      if (!run || !regiao || !regiao.scenes[sceneId]) return;

      set({ run: entrarEm(regiao, run, sceneId, undefined, true) });
    },
  };

  /**
   * Encerrar região escreve em dois lugares. A ordem é deliberada:
   * **global primeiro, slot depois.**
   *
   * Uma falha entre as duas escritas deixa um registro órfão no caderno — o
   * jogador rejoga a região e o registro melhor empilha por cima, recuperável.
   * Na ordem inversa, a região ficaria marcada como concluída sem ficha, e isso
   * é irrecuperável: `canEnterRegion` bloqueia a rejogada para sempre.
   */
  async function encerrarRegiao(regiao: RegionContent, endingId?: string) {
    const { run } = get();
    if (!run || !run.currentRegionId) return;

    const resolucao = resolveEnding(regiao, run.qualities, endingId);
    if (!resolucao) return;
    const { ending, podeCatalogar } = resolucao;

    const conclusao = buildRegionCompletion(ending, run.qualities);
    publicar(conclusao.events);

    // ── 1. global ───────────────────────────────────────────────────────────
    await useProgressStore.getState().registrarFinal({
      region: regiao,
      ending,
      podeCatalogar,
      state: conclusao.qualities,
      clueOrder: run.clueOrder,
      slot: run.slot,
      savedAt: agora(),
    });

    // ── 2. slot ─────────────────────────────────────────────────────────────
    const atualizado: SaveSlot = {
      ...run,
      qualities: conclusao.qualities,
      currentRegionId: null,
      currentSceneId: '',
      currentLineId: undefined,
      regioesConcluidas: {
        ...run.regioesConcluidas,
        [run.currentRegionId]: { endingId: ending.id, tags: ending.tags },
      },
      atualizadoEm: agora(),
    };

    set({
      run: atualizado,
      desfecho: {
        endingId: ending.id,
        nome: ending.nome,
        texto: ending.texto,
        epilogo: resolveEpilogue(regiao, ending, conclusao.qualities).map((f) => f.texto),
        podeCatalogar,
      },
    });

    await gravar(atualizado);
    await useProgressStore.getState().refreshSlots();
  }
});
