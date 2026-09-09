// ─── Avaliação de condições ──────────────────────────────────────────────────
// Deliberadamente rasa: um nível de AND, um de OR de grupos AND. Sem aninhamento.

import type { Condition, Predicate } from '@/types/conditions';
import type { Qualities } from '@/types/qualities';
import { readQuality } from './qualities';

function testPredicate(predicate: Predicate, state: Qualities): boolean {
  const atual = readQuality(state, predicate.key);
  switch (predicate.op) {
    case 'gte':
      return atual >= predicate.value;
    case 'lte':
      return atual <= predicate.value;
    case 'eq':
      return atual === predicate.value;
    case 'neq':
      return atual !== predicate.value;
  }
}

/** `undefined` ou objeto vazio = sempre verdadeiro. `all` e `anyOf` juntos: ambos passam. */
export function evaluateCondition(condition: Condition | undefined, state: Qualities): boolean {
  return failedPredicate(condition, state) === undefined;
}

/**
 * O primeiro predicado que reprovou, ou `undefined` se a condição passa. É o que
 * permite ao inspetor de dev (etapa 7) responder *por que* uma escolha travou —
 * estado numérico esconde bugs que árvore não escondia.
 *
 * Num `anyOf` reprovado, devolve o primeiro predicado do primeiro grupo: é o
 * caminho mais curto para o autor entender o que faltou.
 */
export function failedPredicate(
  condition: Condition | undefined,
  state: Qualities
): Predicate | undefined {
  if (!condition) return undefined;

  if (condition.all) {
    const reprovado = condition.all.find((predicate) => !testPredicate(predicate, state));
    if (reprovado) return reprovado;
  }

  if (condition.anyOf && condition.anyOf.length > 0) {
    const algumGrupoPassa = condition.anyOf.some((grupo) =>
      grupo.every((predicate) => testPredicate(predicate, state))
    );
    if (!algumGrupoPassa) return condition.anyOf[0]?.[0];
  }

  return undefined;
}

/** Quantos predicados a condição tem. É o segundo critério de desempate de variante. */
export function countPredicates(condition: Condition | undefined): number {
  if (!condition) return 0;
  const daLista = condition.all?.length ?? 0;
  const dosGrupos = condition.anyOf?.reduce((total, grupo) => total + grupo.length, 0) ?? 0;
  return daLista + dosGrupos;
}
