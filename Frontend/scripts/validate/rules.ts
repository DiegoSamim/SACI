// ─── Regras de validação de conteúdo ─────────────────────────────────────────
// O preço de "conteúdo é dado, não código" é que erro de autoria deixa de ser
// erro de compilação e vira bug silencioso. Estas regras são a rede.
//
// Funções **puras**: não imprimem, não leem arquivo, não saem do processo. A CLI
// em scripts/validate-content.ts faz tudo isso e não conhece regra nenhuma.
//
// `onde` aponta o **id**, não a linha: id é o que o autor procura no arquivo, e
// número de linha exigiria parsear TypeScript e envelheceria a cada edição.

import type { Condition, Predicate } from '@/types/conditions';
import type { Effect } from '@/types/effects';
import type { QualityDef } from '@/types/qualities';
import type { RegionContent, RegionRegistry } from '@/types/region';
import type { Choice, DialogueScene, Scene, TextVariant } from '@/types/scene';

export type Severidade = 'erro' | 'aviso';

export type Problema = {
  codigo: string;
  severidade: Severidade;
  onde: string;
  mensagem: string;
};

/** Todos os códigos que estas regras sabem emitir. O teste confere contra os fixtures. */
export const CODIGOS = [
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C9',
  'C10',
  'C11',
  'C12',
  'C13',
  'C14',
  'C15',
  'C16',
  'C21',
  'C22',
  'C23',
  'C24',
  'A17',
  'A18',
  'A19',
  'A20',
] as const;

const PREFIXOS_DERIVADOS = ['visita.', 'meta.'];
const derivada = (key: string) => PREFIXOS_DERIVADOS.some((p) => key.startsWith(p));

/** Forma mínima de todo id: minúsculo, snake_case, sem acento e sem hífen. */
const FORMA_ID = /^[a-z][a-z0-9_]*$/;

// ─── Coleta ──────────────────────────────────────────────────────────────────
// Percorrer o conteúdo é metade do trabalho; várias regras usam o mesmo varrido.

type Uso<T> = { valor: T; onde: string };

type Coleta = {
  efeitos: Uso<Effect>[];
  condicoes: Uso<Predicate>[];
  escolhas: Uso<Choice>[];
  variantes: Uso<TextVariant[]>[];
};

function predicados(condicao: Condition | undefined): Predicate[] {
  if (!condicao) return [];
  return [...(condicao.all ?? []), ...(condicao.anyOf ?? []).flat()];
}

function coletar(regiao: RegionContent): Coleta {
  const coleta: Coleta = { efeitos: [], condicoes: [], escolhas: [], variantes: [] };

  const cond = (c: Condition | undefined, onde: string) => {
    for (const valor of predicados(c)) coleta.condicoes.push({ valor, onde });
  };
  const efeitos = (es: Effect[] | undefined, onde: string) => {
    for (const valor of es ?? []) coleta.efeitos.push({ valor, onde });
  };
  const bloco = (vs: TextVariant[], onde: string) => {
    coleta.variantes.push({ valor: vs, onde });
    for (const v of vs) {
      cond(v.when, onde);
      efeitos(v.effects, onde);
    }
  };
  const opcoes = (cs: Choice[], onde: string) => {
    for (const valor of cs) {
      coleta.escolhas.push({ valor, onde: `${onde}/${valor.id}` });
      cond(valor.when, `${onde}/${valor.id}`);
      cond(valor.hiddenWhen, `${onde}/${valor.id}`);
      cond(valor.lockedWhen, `${onde}/${valor.id}`);
      efeitos(valor.effects, `${onde}/${valor.id}`);
    }
  };

  for (const scene of Object.values(regiao.scenes)) {
    if (scene.type === 'local') {
      bloco(scene.textos, scene.id);
      opcoes(scene.escolhas, scene.id);
    } else {
      for (const linha of Object.values(scene.linhas)) {
        const onde = `${scene.id}#${linha.id}`;
        bloco(linha.variantes, onde);
        opcoes(linha.escolhas, onde);
      }
    }
  }

  for (const ending of regiao.endings) cond(ending.when, `final:${ending.id}`);
  for (const frag of regiao.epilogue) cond(frag.when, `epilogo:${frag.id}`);
  for (const moral of regiao.dex.morais) cond(moral.when, `moral:${moral.id}`);

  return coleta;
}

/** Cenas alcançáveis a partir da entrada, seguindo `navigate`. */
function alcancaveis(regiao: RegionContent): Set<string> {
  const destinos = (sceneId: string): string[] => {
    const scene = regiao.scenes[sceneId];
    if (!scene) return [];
    const efeitos =
      scene.type === 'local'
        ? [
            ...scene.textos.flatMap((t) => t.effects ?? []),
            ...scene.escolhas.flatMap((c) => c.effects),
          ]
        : Object.values(scene.linhas).flatMap((l) => [
            ...l.variantes.flatMap((t) => t.effects ?? []),
            ...l.escolhas.flatMap((c) => c.effects),
          ]);
    return efeitos.filter((e) => e.type === 'navigate').map((e) => e.to.split('#')[0]);
  };

  const vistos = new Set([regiao.meta.entrySceneId]);
  const fila = [regiao.meta.entrySceneId];
  while (fila.length > 0) {
    for (const destino of destinos(fila.pop()!)) {
      if (!vistos.has(destino)) {
        vistos.add(destino);
        fila.push(destino);
      }
    }
  }
  return vistos;
}

/** Linhas de um diálogo alcançáveis: a inicial, mais toda que alguém navega para. */
function linhasAlcancaveis(scene: DialogueScene): Set<string> {
  const alvos = new Set([scene.linhaInicial]);
  for (const linha of Object.values(scene.linhas)) {
    for (const escolha of linha.escolhas) {
      for (const efeito of escolha.effects) {
        if (efeito.type === 'navigate' && efeito.to.startsWith(`${scene.id}#`)) {
          alvos.add(efeito.to.split('#')[1]);
        }
      }
    }
  }
  return alvos;
}

// ─── Regras por região ───────────────────────────────────────────────────────

export function validarRegiao(regiao: RegionContent): Problema[] {
  const problemas: Problema[] = [];
  const erro = (codigo: string, onde: string, mensagem: string) =>
    problemas.push({ codigo, severidade: 'erro', onde, mensagem });
  const aviso = (codigo: string, onde: string, mensagem: string) =>
    problemas.push({ codigo, severidade: 'aviso', onde, mensagem });

  const coleta = coletar(regiao);
  const { regionId } = regiao.meta;
  const cenas = Object.values(regiao.scenes);

  const escritas = new Map<string, Effect[]>();
  for (const { valor } of coleta.efeitos) {
    if (valor.type !== 'set' && valor.type !== 'adjust') continue;
    escritas.set(valor.key, [...(escritas.get(valor.key) ?? []), valor]);
  }
  const lidas = new Set(coleta.condicoes.map((c) => c.valor.key));
  // `string` e não `AuthoredQualityKey`: aqui a chave é dado a inspecionar, não
  // dado a escrever — a graça do validador é justamente olhar chaves erradas.
  const declaradas = new Map<string, QualityDef>(regiao.qualities.map((q) => [q.key, q]));

  // C1 — todo navigate aponta para algo que existe
  for (const { valor, onde } of coleta.efeitos) {
    if (valor.type !== 'navigate') continue;
    const [sceneId, lineId] = valor.to.split('#');
    const destino = regiao.scenes[sceneId];
    if (!destino) {
      erro('C1', onde, `navigate para cena inexistente: "${valor.to}"`);
    } else if (lineId && (destino.type !== 'dialogo' || !destino.linhas[lineId])) {
      erro('C1', onde, `navigate para linha inexistente: "${valor.to}"`);
    }
  }

  // C2 — toda cena é alcançável a partir da entrada
  const vivas = alcancaveis(regiao);
  for (const scene of cenas) {
    if (!vivas.has(scene.id)) {
      erro('C2', scene.id, `cena inalcançável a partir de "${regiao.meta.entrySceneId}"`);
    }
  }

  // C3 — toda cena local tem saída garantida.
  // `once` também desqualifica: uma saída que some depois de usada não é saída.
  for (const scene of cenas) {
    if (scene.type !== 'local') continue;
    const incondicional = scene.escolhas.some(
      (c) => !c.when && !c.hiddenWhen && !c.lockedWhen && !c.once
    );
    if (!incondicional) {
      erro('C3', scene.id, 'nenhuma escolha incondicional — o jogador pode ficar sem saída');
    }
  }

  // C4 — a despedida existe, é alcançável, e tem saída autorada própria.
  // Sem a última parte, a rede de segurança da engine aponta para ela mesma e o
  // jogador gira — caso degenerado documentado em engine/scenes.ts.
  for (const scene of cenas) {
    if (scene.type !== 'dialogo') continue;
    const despedida = scene.linhas[scene.linhaDeDespedida];
    if (!despedida) {
      erro('C4', scene.id, `linhaDeDespedida "${scene.linhaDeDespedida}" não existe`);
      continue;
    }
    if (!linhasAlcancaveis(scene).has(scene.linhaDeDespedida)) {
      erro('C4', scene.id, `linhaDeDespedida "${scene.linhaDeDespedida}" é inalcançável`);
    }
    if (despedida.escolhas.length === 0) {
      erro(
        'C4',
        `${scene.id}#${scene.linhaDeDespedida}`,
        'despedida sem saída autorada — a injeção da engine viraria um laço'
      );
    }
  }

  // C5 — toda chave lida é escrita em algum lugar
  for (const { valor, onde } of coleta.condicoes) {
    if (derivada(valor.key) || escritas.has(valor.key)) continue;
    erro('C5', onde, `condição lê "${valor.key}", que nenhum efeito escreve`);
  }

  // C6 — toda chave usada está declarada
  const usadas = new Set([...lidas, ...escritas.keys()]);
  for (const key of usadas) {
    if (derivada(key) || declaradas.has(key)) continue;
    erro('C6', regionId, `chave "${key}" não está declarada no registro de qualidades`);
  }
  if (!declaradas.has(regiao.meta.atoKey)) {
    erro('C6', regionId, `meta.atoKey "${regiao.meta.atoKey}" não está declarada`);
  }

  // C7 — terminal só na última posição
  const listas = new Map<string, Effect[]>();
  for (const { valor, onde } of coleta.efeitos) {
    listas.set(onde, [...(listas.get(onde) ?? []), valor]);
  }
  for (const [onde, efeitos] of listas) {
    efeitos.forEach((efeito, i) => {
      const terminal = efeito.type === 'navigate' || efeito.type === 'end_region';
      if (terminal && i !== efeitos.length - 1) {
        erro(
          'C7',
          onde,
          `"${efeito.type}" na posição ${i + 1} de ${efeitos.length} — deixa efeitos órfãos`
        );
      }
    });
  }

  // C8 — convenções de id (SYSTEM_DESIGN.md §4.1)
  if (!FORMA_ID.test(regionId)) erro('C8', regionId, 'regionId fora da forma snake_case');
  if (!FORMA_ID.test(regiao.dex.creatureId)) {
    erro('C8', regiao.dex.creatureId, 'creatureId fora da forma snake_case');
  }
  for (const scene of cenas) {
    if (!scene.id.startsWith(`${regionId}_`)) {
      erro('C8', scene.id, `sceneId deve começar com "${regionId}_"`);
    }
    if (scene.type === 'dialogo' && scene.id !== `${regionId}_dialogo_${scene.npcId}`) {
      erro('C8', scene.id, `dialogueId deve ser "${regionId}_dialogo_${scene.npcId}"`);
    }
    if (scene.type === 'dialogo') {
      for (const lineId of Object.keys(scene.linhas)) {
        if (!FORMA_ID.test(lineId)) erro('C8', `${scene.id}#${lineId}`, 'lineId fora da forma');
      }
    }
  }
  for (const npcId of Object.keys(regiao.npcs)) {
    if (!FORMA_ID.test(npcId)) erro('C8', npcId, 'npcId fora da forma');
  }
  // Fechado na etapa 8: o SYSTEM_DESIGN.md §4.1 foi corrigido para descrever a
  // prática (slug único no projeto, por convenção prefixado por um apelido
  // curto da criatura) em vez de uma regra derivável que o próprio exemplo do
  // documento violava. Não há prefixo de criatura como dado — só a forma é
  // verificável, e é isto que fica checado.
  for (const clueId of Object.keys(regiao.clues)) {
    if (!FORMA_ID.test(clueId)) erro('C8', clueId, 'clueId fora da forma');
  }

  // C9 — toda pista declarada tem origem
  for (const clueId of Object.keys(regiao.clues)) {
    if (!escritas.has(`pista.${clueId}`)) {
      erro('C9', clueId, 'pista declarada que nenhum efeito concede');
    }
  }

  // C10 — finais
  if (!regiao.endings.some((e) => e.tags.includes('bom'))) {
    erro('C10', regionId, 'nenhum final com a tag "bom"');
  }
  const fallbacks = regiao.endings.filter((e) => !e.when);
  if (fallbacks.length !== 1) {
    erro('C10', regionId, `${fallbacks.length} finais sem "when" — precisa ser exatamente 1`);
  }

  // C11 — slots de epílogo
  for (const ending of regiao.endings) {
    for (const slot of ending.epilogo ?? []) {
      if (!regiao.meta.epilogueSlots.includes(slot)) {
        erro('C11', `final:${ending.id}`, `slot "${slot}" não está em meta.epilogueSlots`);
      }
      if (!regiao.epilogue.some((f) => f.slot === slot && !f.when)) {
        erro('C11', `final:${ending.id}`, `slot "${slot}" não tem fragmento sem "when"`);
      }
    }
  }

  // C12 — a ficha do FolcloreDex
  if (!regiao.dex.lenda.trim()) {
    erro('C12', regiao.dex.creatureId, 'ficha sem "lenda" — a seção factual nunca é parcial');
  }
  if (!regiao.dex.morais.some((m) => !m.tags && !m.when)) {
    erro('C12', regiao.dex.creatureId, 'nenhuma moral sem "tags" e sem "when" (fallback)');
  }

  // C13 / C24 — prefixo de região em mundo.* e feito.*
  const chavesDeclaradasEUsadas = new Set([...usadas, ...declaradas.keys()]);
  for (const key of chavesDeclaradasEUsadas) {
    const prefixo = /^(mundo|feito)\./.exec(key);
    if (!prefixo) continue;
    const partes = key.split('.');
    if (partes.length < 3) {
      erro('C13', regionId, `"${key}" precisa do prefixo de região: "${partes[0]}.${regionId}.…"`);
    } else if (partes[1] !== regionId) {
      erro(
        'C24',
        regionId,
        `"${key}" usa a região "${partes[1]}" dentro do conteúdo de "${regionId}"`
      );
    }
  }

  // C15 — conteúdo escrevendo em chave derivada
  for (const { valor, onde } of coleta.efeitos) {
    if (valor.type !== 'set' && valor.type !== 'adjust') continue;
    if (derivada(valor.key)) {
      erro('C15', onde, `conteúdo escreve em "${valor.key}", que só a engine escreve`);
    }
  }

  // C16 — toda lista de variantes tem uma sem `when`.
  // Sem ela, pickVariant devolve undefined e a cena aparece com texto vazio.
  for (const { valor, onde } of coleta.variantes) {
    if (!valor.some((v) => !v.when)) {
      erro('C16', onde, 'nenhuma variante sem "when" — o texto pode sair vazio');
    }
  }

  // C21 — final inalcançável
  for (const ending of regiao.endings) {
    if (!ending.when) continue;
    const impossiveis = predicadosImpossiveis(ending.when, escritas, declaradas);
    if (impossiveis.length > 0) {
      erro(
        'C21',
        `final:${ending.id}`,
        `nenhum caminho satisfaz: ${impossiveis.map((p) => `${p.key} ${p.op} ${p.value}`).join(', ')}`
      );
    }
  }

  // C22 — de toda cena alcançável há caminho até um end_region
  const encerra = cenasQueEncerram(regiao);
  for (const scene of cenas) {
    if (vivas.has(scene.id) && !encerra.has(scene.id)) {
      erro('C22', scene.id, 'nenhum caminho daqui leva a um final — o jogador fica preso');
    }
  }

  // C23 — as faixas cobrem min..max sem buraco nem sobreposição
  for (const def of regiao.qualities) {
    for (const problema of buracosDeFaixa(def)) erro('C23', def.key, problema);
  }

  // ── Avisos ────────────────────────────────────────────────────────────────

  for (const def of regiao.qualities) {
    if (!lidas.has(def.key)) {
      aviso('A17', def.key, 'qualidade declarada que nenhuma condição lê');
    }
    if (!escritas.has(def.key)) {
      aviso('A18', def.key, 'qualidade declarada que nenhum efeito escreve');
    }
  }

  for (const scene of cenas) {
    if (scene.type !== 'dialogo') continue;
    const vivasAqui = linhasAlcancaveis(scene);
    for (const lineId of Object.keys(scene.linhas)) {
      if (!vivasAqui.has(lineId)) {
        aviso('A19', `${scene.id}#${lineId}`, 'linha de diálogo inalcançável');
      }
    }
  }

  for (const { valor, onde } of coleta.escolhas) {
    if (valor.lockedWhen && !valor.lockedText) {
      aviso('A20', onde, 'lockedWhen sem lockedText — trava sem dizer o que falta');
    }
  }

  return problemas;
}

// ─── Auxiliares das regras mais pesadas ──────────────────────────────────────

/**
 * Análise estática **grosseira** de alcançabilidade de valor.
 *
 * Calcula o teto e o piso que uma chave pode atingir a partir dos efeitos que a
 * escrevem, e compara com o operador. `all` exige todos os predicados viáveis;
 * `anyOf` exige ao menos um grupo inteiro viável.
 *
 * O que ela **não** faz, de propósito: não é solver. Ignora a ordem dos
 * caminhos, exclusão mútua entre ramos e interação com `clamp`. Um final pode
 * passar aqui e ainda ser inalcançável por um motivo mais sutil. Ela existe para
 * pegar o caso óbvio — chave nunca escrita, ou nunca escrita alto o bastante —
 * que é o erro provável, porque finais são escritos por último.
 */
function predicadosImpossiveis(
  condicao: Condition,
  escritas: Map<string, Effect[]>,
  declaradas: Map<string, QualityDef>
): Predicate[] {
  const viavel = (p: Predicate): boolean => {
    if (derivada(p.key)) return true; // a engine escreve; não dá para inferir daqui
    const efeitos = escritas.get(p.key) ?? [];
    if (efeitos.length === 0) return false;

    const def = declaradas.get(p.key);
    const sets = efeitos.flatMap((e) => (e.type === 'set' ? [e.value] : []));
    const ajustes = efeitos.flatMap((e) => (e.type === 'adjust' ? [e.by] : []));
    const somaPositiva = ajustes.filter((b) => b > 0).reduce((a, b) => a + b, 0);
    const somaNegativa = ajustes.filter((b) => b < 0).reduce((a, b) => a + b, 0);

    const candidatosTeto = [...sets, somaPositiva, def?.default ?? 0];
    const candidatosPiso = [...sets, somaNegativa, def?.default ?? 0];
    let teto = Math.max(...candidatosTeto);
    let piso = Math.min(...candidatosPiso);
    if (def?.max !== undefined) teto = Math.min(teto, def.max);
    if (def?.min !== undefined) piso = Math.max(piso, def.min);

    switch (p.op) {
      case 'gte':
        return teto >= p.value;
      case 'lte':
        return piso <= p.value;
      case 'eq':
        return piso <= p.value && p.value <= teto;
      case 'neq':
        return piso !== p.value || teto !== p.value;
    }
  };

  const doAll = (condicao.all ?? []).filter((p) => !viavel(p));
  if (doAll.length > 0) return doAll;

  const grupos = condicao.anyOf ?? [];
  if (grupos.length > 0 && !grupos.some((grupo) => grupo.every(viavel))) {
    // Nenhum grupo inteiro é viável: reporta o primeiro, que é o caminho mais
    // curto para o autor entender o que faltou.
    return grupos[0].filter((p) => !viavel(p));
  }

  return [];
}

/** Cenas de onde existe algum caminho até um `end_region`. */
function cenasQueEncerram(regiao: RegionContent): Set<string> {
  const saidasDe = (scene: Scene) => {
    const efeitos =
      scene.type === 'local'
        ? [
            ...scene.textos.flatMap((t) => t.effects ?? []),
            ...scene.escolhas.flatMap((c) => c.effects),
          ]
        : Object.values(scene.linhas).flatMap((l) => [
            ...l.variantes.flatMap((t) => t.effects ?? []),
            ...l.escolhas.flatMap((c) => c.effects),
          ]);
    return {
      navega: efeitos.flatMap((e) => (e.type === 'navigate' ? [e.to.split('#')[0]] : [])),
      encerra: efeitos.some((e) => e.type === 'end_region'),
    };
  };

  const mapa = new Map(Object.values(regiao.scenes).map((s) => [s.id, saidasDe(s)]));
  const encerra = new Set([...mapa].flatMap(([id, s]) => (s.encerra ? [id] : [])));

  // Ponto fixo: uma cena encerra se navega para alguma que encerra.
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const [id, saidas] of mapa) {
      if (encerra.has(id)) continue;
      if (saidas.navega.some((destino) => encerra.has(destino))) {
        encerra.add(id);
        mudou = true;
      }
    }
  }
  return encerra;
}

/** Buracos e sobreposições nas faixas de uma qualidade. */
function buracosDeFaixa(def: QualityDef): string[] {
  if (!def.faixas) return [];
  const min = def.min ?? 0;
  const max = def.max ?? 0;
  if (def.min === undefined || def.max === undefined) {
    return ['tem faixas mas não declara min/max — não há intervalo para cobrir'];
  }

  const ordenadas = Object.entries(def.faixas).sort((a, b) => a[1][0] - b[1][0]);
  const problemas: string[] = [];
  let esperado = min;

  for (const [nome, [lo, hi]] of ordenadas) {
    if (lo > esperado) problemas.push(`buraco em ${esperado}..${lo - 1} (antes de "${nome}")`);
    if (lo < esperado) problemas.push(`"${nome}" sobrepõe a faixa anterior em ${lo}`);
    if (hi < lo) problemas.push(`"${nome}" tem intervalo invertido [${lo}, ${hi}]`);
    esperado = Math.max(esperado, hi + 1);
  }

  if (esperado <= max) problemas.push(`descoberto em ${esperado}..${max}`);
  return problemas;
}

// ─── Regras globais, entre regiões ───────────────────────────────────────────

export function validarRegistry(registry: RegionRegistry): Problema[] {
  const problemas: Problema[] = [];
  const regioes = Object.values(registry).filter((r): r is RegionContent => r !== undefined);

  for (const regiao of regioes) problemas.push(...validarRegiao(regiao));

  // C14 — unicidade global. `humor.<npcId>` e `pista.<clueId>` não são
  // prefixados por região, então dois ids iguais em regiões diferentes
  // compartilhariam estado no mesmo save.
  const conferirUnicidade = (nome: string, porRegiao: { regionId: string; ids: string[] }[]) => {
    const dono = new Map<string, string>();
    for (const { regionId, ids } of porRegiao) {
      for (const id of ids) {
        const anterior = dono.get(id);
        if (anterior && anterior !== regionId) {
          problemas.push({
            codigo: 'C14',
            severidade: 'erro',
            onde: id,
            mensagem: `${nome} "${id}" aparece em "${anterior}" e em "${regionId}"`,
          });
        } else {
          dono.set(id, regionId);
        }
      }
    }
  };

  conferirUnicidade(
    'npcId',
    regioes.map((r) => ({ regionId: r.meta.regionId, ids: Object.keys(r.npcs) }))
  );
  conferirUnicidade(
    'clueId',
    regioes.map((r) => ({ regionId: r.meta.regionId, ids: Object.keys(r.clues) }))
  );
  conferirUnicidade(
    'sceneId',
    regioes.map((r) => ({ regionId: r.meta.regionId, ids: Object.keys(r.scenes) }))
  );

  return problemas;
}
