// ─── Linguagem de condição ───────────────────────────────────────────────────
// Deliberadamente rasa: um nível de AND, um nível de OR de grupos AND, e nada
// além disso. Se um caso de roteiro exigir mais aninhamento, o problema é de
// roteiro — não estenda esta linguagem sem atualizar engine, validador e docs.

import type { QualityKey } from './qualities';

export type CompareOp = 'gte' | 'lte' | 'eq' | 'neq';

/**
 * Compara uma chave de qualidade com um número.
 * Chave ausente vale `0` — nunca existe `undefined` no estado.
 */
export type Predicate = {
  /** Pode ler qualquer namespace, inclusive os derivados `visita.` e `meta.`. */
  key: QualityKey;
  op: CompareOp;
  value: number;
};

/**
 * `undefined` ou objeto vazio = sempre verdadeiro.
 * `all` e `anyOf` juntos: ambos precisam passar.
 */
export type Condition = {
  /** Todos os predicados precisam passar. */
  all?: Predicate[];
  /** Ao menos um grupo precisa passar por inteiro (OR de grupos AND). */
  anyOf?: Predicate[][];
};
