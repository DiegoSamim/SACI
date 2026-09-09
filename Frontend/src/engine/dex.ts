// ─── Ficha do FolcloreDex ────────────────────────────────────────────────────
// O registro do que o **investigador concluiu**, não uma verdade objetiva.

import type { DexRecord, SaveSlotId } from '@/types/dex';
import type { Ending } from '@/types/ending';
import type { Qualities } from '@/types/qualities';
import type { RegionContent } from '@/types/region';
import { PISTA_PREFIX } from './constants';
import { readQuality } from './qualities';
import { resolveMoral } from './endings';

/**
 * `pistas descobertas ÷ pistas declaradas na região`, em `0..1`.
 *
 * O denominador é `RegionContent.clues` — toda pista declarada conta, sem
 * opt-out. Arredondada a duas casas para o número ficar estável no save entre
 * versões (um float longo mudaria de representação e sujaria o diff).
 *
 * Região sem pista declarada devolve 0, não `NaN`.
 */
export function computeCompletude(region: RegionContent, state: Qualities): number {
  const declaradas = Object.keys(region.clues);
  if (declaradas.length === 0) return 0;

  const descobertas = declaradas.filter(
    (clueId) => readQuality(state, `${PISTA_PREFIX}${clueId}`) !== 0
  ).length;

  return Math.round((descobertas / declaradas.length) * 100) / 100;
}

export type DexRecordParams = {
  region: RegionContent;
  ending: Ending;
  state: Qualities;
  /** Ordem de descoberta, do save — não a ordem de declaração. */
  clueOrder: string[];
  slot: SaveSlotId;
  savedAt: number;
};

/**
 * `slot` e `savedAt` vêm do store: a engine é pura e não conhece relógio nem
 * qual save está ativo.
 */
export function buildDexRecord({
  region,
  ending,
  state,
  clueOrder,
  slot,
  savedAt,
}: DexRecordParams): DexRecord {
  const daRegiao = new Set(Object.keys(region.clues));
  const moral = resolveMoral(region.dex, ending.tags, state);

  return {
    savedAt,
    slot,
    endingId: ending.id,
    tags: ending.tags,
    // Só as pistas desta região, preservando a ordem em que foram descobertas.
    pistas: clueOrder.filter((clueId) => daRegiao.has(clueId)),
    completude: computeCompletude(region, state),
    moral: moral?.texto ?? '',
  };
}
