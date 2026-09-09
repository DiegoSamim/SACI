// ─── Leitura e escrita de qualidades ─────────────────────────────────────────
// Funções puras. Chave ausente vale 0 — nunca existe `undefined` no estado.

import type { QualityDef, QualityIndex, QualityRegistry, Qualities } from '@/types/qualities';

/** Índice por chave, o formato que a engine e o validador consomem. */
export function indexQualities(registry: QualityRegistry): QualityIndex {
  const indice: Record<string, QualityDef> = {};
  for (const def of registry) indice[def.key] = def;
  return indice;
}

/** Chave ausente vale 0. É a regra que dispensa conteúdo de testar existência. */
export function readQuality(state: Qualities, key: string): number {
  return state[key] ?? 0;
}

/**
 * Aplica `min`/`max` da definição. Vale para `set` **e** para `adjust`: um `set`
 * fora da faixa seria uma forma silenciosa de furar o limite declarado.
 */
export function clamp(value: number, def?: QualityDef): number {
  let saida = value;
  if (def?.min !== undefined) saida = Math.max(def.min, saida);
  if (def?.max !== undefined) saida = Math.min(def.max, saida);
  return saida;
}

/**
 * Converte número em palavra. Intervalos são inclusivos nas duas pontas.
 * Devolve `undefined` se a definição não tem faixas ou se o valor não cai em
 * nenhuma — o segundo caso é buraco de autoria, e devolver `undefined` deixa o
 * inspetor de dev mostrá-lo em vez de inventar uma faixa.
 */
export function bandOf(def: QualityDef | undefined, value: number): string | undefined {
  if (!def?.faixas) return undefined;
  for (const [nome, [min, max]] of Object.entries(def.faixas)) {
    if (value >= min && value <= max) return nome;
  }
  return undefined;
}

/** A faixa atual de uma qualidade, lendo o estado. É como o humor chega na UI. */
export function moodBand(def: QualityDef, state: Qualities): string | undefined {
  return bandOf(def, readQuality(state, def.key));
}
