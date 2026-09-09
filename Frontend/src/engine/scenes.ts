// ─── Entrada e resolução de cena ─────────────────────────────────────────────
// `enterScene` muda estado; `resolveScene`/`resolveLine` só leem. Separadas de
// propósito: incrementar `visita.` é escrita, e uma função que devolve
// `ResolvedScene` não tem onde carregar estado novo sem deixar de ser pura.

import type { EngineEvent } from '@/types/events';
import type { Qualities } from '@/types/qualities';
import type {
  DialogueLine,
  DialogueScene,
  ResolvedChoice,
  ResolvedLine,
  ResolvedScene,
  Scene,
} from '@/types/scene';
import { availableChoices, choiceKey, type ChoiceContext } from './choices';
import { VISITA_PREFIX } from './constants';
import { readQuality } from './qualities';
import { pickVariant } from './variants';

export function visitKey(sceneId: string): string {
  return `${VISITA_PREFIX}${sceneId}`;
}

/**
 * Incrementa `visita.<sceneId>` e emite `sceneEnter`. É o que permite variantes
 * de "primeira vez" e "você já esteve aqui" sem duplicar cenas. A chave é gerada
 * pela engine e nunca declarada no registro de qualidades.
 */
export function enterScene(
  state: Qualities,
  sceneId: string
): { qualities: Qualities; events: EngineEvent[] } {
  const chave = visitKey(sceneId);
  const visitas = readQuality(state, chave) + 1;
  return {
    qualities: { ...state, [chave]: visitas },
    events: [{ type: 'sceneEnter', sceneId, primeiraVez: visitas === 1 }],
  };
}

/** Espera o estado **já incrementado** por `enterScene`. */
export function resolveScene(scene: Scene, state: Qualities, taken: string[]): ResolvedScene {
  const ctx: ChoiceContext = { sceneId: scene.id };

  if (scene.type === 'dialogo') {
    const linha = scene.linhas[scene.linhaInicial];
    const resolvida = resolveLine(scene, linha, state, taken);
    return {
      scene,
      texto: resolvida.texto,
      visitas: readQuality(state, visitKey(scene.id)),
      escolhas: resolvida.escolhas,
      pendingEffects: resolvida.pendingEffects,
    };
  }

  const variante = pickVariant(scene.textos, state);
  return {
    scene,
    texto: variante?.texto ?? '',
    visitas: readQuality(state, visitKey(scene.id)),
    escolhas: availableChoices(scene.escolhas, state, taken, ctx),
    pendingEffects: variante?.effects ?? [],
  };
}

/**
 * Se nenhuma escolha sobrar, injeta a despedida — rede de segurança do §6, para
 * que o jogador nunca fique preso numa linha sem saída.
 *
 * A escolha injetada **não** é `once` e não consulta `takenChoices`: ela precisa
 * funcionar sempre, inclusive numa linha já visitada. O id `__despedida` usa
 * prefixo reservado para não colidir com escolha autorada.
 *
 * O contrato aqui é "nunca zero escolhas", não "nunca um laço": se a própria
 * `linhaDeDespedida` for escrita sem saída, a injeção aponta para ela mesma e o
 * jogador fica girando. Isso é buraco de autoria, e é exatamente o que a
 * checagem 4 do validador existe para pegar — a engine não tem como inventar uma
 * saída que o autor não escreveu.
 */
export function resolveLine(
  scene: DialogueScene,
  line: DialogueLine,
  state: Qualities,
  taken: string[]
): ResolvedLine {
  const ctx: ChoiceContext = { sceneId: scene.id, lineId: line.id };
  const variante = pickVariant(line.variantes, state);
  let escolhas: ResolvedChoice[] = availableChoices(line.escolhas, state, taken, ctx);

  if (escolhas.length === 0) {
    escolhas = [despedidaInjetada(scene, line)];
  }

  return {
    line,
    texto: variante?.texto ?? '',
    escolhas,
    pendingEffects: variante?.effects ?? [],
  };
}

/** Prefixo reservado: nenhum id autorado pode começar assim. */
export const ID_DESPEDIDA = '__despedida';

function despedidaInjetada(scene: DialogueScene, line: DialogueLine): ResolvedChoice {
  return {
    key: choiceKey({ sceneId: scene.id, lineId: line.id }, ID_DESPEDIDA),
    choice: {
      id: ID_DESPEDIDA,
      texto: 'Encerrar a conversa',
      effects: [{ type: 'navigate', to: `${scene.id}#${scene.linhaDeDespedida}` }],
    },
    estado: 'disponivel',
  };
}
