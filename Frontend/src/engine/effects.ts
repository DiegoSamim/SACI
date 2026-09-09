// ─── Aplicação de efeitos ────────────────────────────────────────────────────
// O coração determinístico. Função pura: devolve um estado novo e **descreve** a
// navegação e o encerramento — não executa nem um nem outro.

import type { Effect, EffectResult, NavigationIntent } from '@/types/effects';
import type { EngineEvent } from '@/types/events';
import type { Qualities, QualityIndex, WorldKey } from '@/types/qualities';
import { HUMOR_PREFIX, PISTA_PREFIX, TERMINAL_EFFECT_TYPES } from './constants';
import { bandOf, clamp, readQuality } from './qualities';

export type EffectContext = {
  qualities: QualityIndex;
  /**
   * Qual chave é "o ato" desta região. Declarada em `RegionMeta.atoKey` porque
   * `mundo.` é prefixado por região e a engine não pode adivinhar.
   */
  atoKey: WorldKey;
  sceneId?: string;
};

/** `"cena#linha"` → `{ sceneId: "cena", lineId: "linha" }`. A tela nunca faz isto. */
export function parseNavigateTarget(target: string): NavigationIntent {
  const [sceneId, lineId] = target.split('#');
  return lineId ? { sceneId, lineId } : { sceneId };
}

export function applyEffects(
  state: Qualities,
  effects: Effect[],
  ctx: EffectContext
): EffectResult {
  const qualities: Qualities = { ...state };
  const events: EngineEvent[] = [];
  const newClues: string[] = [];
  const warnings: string[] = [];

  let navigation: NavigationIntent | undefined;
  let endRegion: EffectResult['endRegion'];
  let terminou = false;

  for (const effect of effects) {
    if (terminou) {
      // Comportamento de produção: ignorar e não quebrar. Mas o validador só
      // chega na etapa 5, e um bug de autoria não pode atravessar mudo até lá.
      warnings.push(
        `efeito "${effect.type}" depois de um terminal${ctx.sceneId ? ` em ${ctx.sceneId}` : ''} — ignorado`
      );
      continue;
    }

    switch (effect.type) {
      case 'set':
      case 'adjust': {
        const def = ctx.qualities[effect.key];
        const antes = readQuality(qualities, effect.key);
        const bruto = effect.type === 'set' ? effect.value : antes + effect.by;
        const depois = clamp(bruto, def);
        if (depois === antes) break;

        qualities[effect.key] = depois;

        // Ordem de descoberta preservada sem um efeito dedicado: qualquer pista
        // que saia de zero entra em `clueOrder`, por `set` ou por `adjust`.
        if (effect.key.startsWith(PISTA_PREFIX) && antes === 0) {
          const clueId = effect.key.slice(PISTA_PREFIX.length);
          newClues.push(clueId);
          events.push({ type: 'clueFound', clueKey: effect.key, ordem: newClues.length });
        }

        if (effect.key.startsWith(HUMOR_PREFIX) && def?.faixas) {
          const de = bandOf(def, antes);
          const para = bandOf(def, depois);
          if (de !== para && de !== undefined && para !== undefined) {
            events.push({
              type: 'moodChanged',
              npcId: effect.key.slice(HUMOR_PREFIX.length),
              de,
              para,
            });
          }
        }

        if (effect.key === ctx.atoKey) {
          events.push({ type: 'actAdvanced', ato: depois });
        }
        break;
      }

      case 'emit':
        events.push({ type: 'custom', event: effect.event, tag: effect.tag });
        break;

      case 'navigate':
        navigation = parseNavigateTarget(effect.to);
        terminou = true;
        break;

      case 'end_region':
        endRegion = { endingId: effect.endingId };
        terminou = true;
        break;
    }
  }

  return { qualities, events, navigation, endRegion, newClues, warnings };
}

/** Um efeito encerra o array? Usado pelo validador na etapa 5. */
export function isTerminal(effect: Effect): boolean {
  return (TERMINAL_EFFECT_TYPES as readonly string[]).includes(effect.type);
}
