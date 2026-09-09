// ─── Conclusão de região ─────────────────────────────────────────────────────
// A engine é dona dos espelhos `meta.*` — nunca o conteúdo (o tipo `Effect` já o
// proíbe) e nunca o store. Sem esta função, `meta.tag_*` fica sempre em zero e o
// capítulo final do Saci não tem o que ler.

import type { Ending } from '@/types/ending';
import type { EngineEvent } from '@/types/events';
import type { Qualities } from '@/types/qualities';
import { META_REGIOES_CONCLUIDAS, META_TAG_KEYS } from './constants';
import { readQuality } from './qualities';

/**
 * Incrementa um contador por tag do final, incrementa o total de regiões
 * concluídas e emite `endingReached`.
 *
 * Tags repetidas no mesmo final contam uma vez só: `["ruim", "ruim"]` seria erro
 * de autoria, e contar duas vezes distorceria a composição que o Saci avalia.
 */
export function buildRegionCompletion(
  ending: Ending,
  state: Qualities
): { qualities: Qualities; events: EngineEvent[] } {
  const qualities: Qualities = { ...state };

  for (const tag of new Set(ending.tags)) {
    const chave = META_TAG_KEYS[tag];
    qualities[chave] = readQuality(qualities, chave) + 1;
  }

  qualities[META_REGIOES_CONCLUIDAS] = readQuality(qualities, META_REGIOES_CONCLUIDAS) + 1;

  return {
    qualities,
    events: [{ type: 'endingReached', endingId: ending.id, tags: ending.tags }],
  };
}
