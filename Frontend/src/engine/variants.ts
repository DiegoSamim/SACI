// ─── Desempate de variantes ──────────────────────────────────────────────────
// Determinístico, sem aleatoriedade. É o que faz uma pista mudar o que o NPC diz
// em vez de apenas destravar uma opção.

import type { Qualities } from '@/types/qualities';
import type { TextVariant } from '@/types/scene';
import { countPredicates, evaluateCondition } from './conditions';

/**
 * Escolhe uma variante entre as que casam com o estado, nesta ordem:
 *   1. maior `priority`
 *   2. maior número de predicados na condição (mais específica ganha)
 *   3. ordem de declaração no array
 *
 * Devolve `undefined` só se nenhuma variante casar — buraco de autoria que o
 * validador pega na etapa 5 exigindo uma variante sem `when`.
 */
export function pickVariant(variants: TextVariant[], state: Qualities): TextVariant | undefined {
  let vencedora: TextVariant | undefined;
  let melhorPrioridade = -Infinity;
  let melhorEspecificidade = -1;

  for (const variante of variants) {
    if (!evaluateCondition(variante.when, state)) continue;

    const prioridade = variante.priority ?? 0;
    const especificidade = countPredicates(variante.when);

    // `>` em vez de `>=` preserva a ordem de declaração como terceiro critério:
    // uma empatada mais adiante no array não desbanca a que já venceu.
    const ganha =
      prioridade > melhorPrioridade ||
      (prioridade === melhorPrioridade && especificidade > melhorEspecificidade);

    if (ganha) {
      vencedora = variante;
      melhorPrioridade = prioridade;
      melhorEspecificidade = especificidade;
    }
  }

  return vencedora;
}
