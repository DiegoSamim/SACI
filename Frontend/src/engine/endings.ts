// ─── Finais, epílogos e moral ────────────────────────────────────────────────
// Uma região não termina num motivo de quatro valores: termina num final
// nomeado, com tags, resolvido por condição e prioridade.

import type { Ending, EndingTag, EpilogueFragment, MoralFragment } from '@/types/ending';
import type { Qualities } from '@/types/qualities';
import type { DexSheet } from '@/types/dex';
import type { RegionContent } from '@/types/region';
import { evaluateCondition } from './conditions';
import { TAG_SEM_CATALOGO } from './constants';

/**
 * Maior prioridade entre os que casam. Empate resolve pela ordem de declaração,
 * como no desempate de variantes.
 */
function melhorPorPrioridade<T extends { priority: number }>(
  candidatos: T[],
  casa: (candidato: T) => boolean
): T | undefined {
  let vencedor: T | undefined;
  for (const candidato of candidatos) {
    if (!casa(candidato)) continue;
    if (!vencedor || candidato.priority > vencedor.priority) vencedor = candidato;
  }
  return vencedor;
}

/**
 * O final resolvido **junto com** o veredito de catalogação. A engine é dona da
 * regra (`TAG_SEM_CATALOGO` vive aqui); o store obedece em vez de precisar
 * lembrar de perguntar.
 */
export type EndingResolution = { ending: Ending; podeCatalogar: boolean };

/**
 * `endingId` explícito força aquele final; sem ele, resolve por condição.
 * O fallback — o único final sem `when` — sempre casa, então esta função nunca
 * devolve `undefined` numa região que passou pelo validador.
 */
export function resolveEnding(
  region: RegionContent,
  state: Qualities,
  endingId?: string
): EndingResolution | undefined {
  const ending = endingId
    ? region.endings.find((candidato) => candidato.id === endingId)
    : melhorPorPrioridade(region.endings, (candidato) => evaluateCondition(candidato.when, state));

  return ending ? { ending, podeCatalogar: podeCatalogar(ending.tags) } : undefined;
}

/** Um fragmento por slot listado no final, na ordem em que o final os declara. */
export function resolveEpilogue(
  region: RegionContent,
  ending: Ending,
  state: Qualities
): EpilogueFragment[] {
  const fragmentos: EpilogueFragment[] = [];
  for (const slot of ending.epilogo ?? []) {
    const candidatos = region.epilogue.filter((fragmento) => fragmento.slot === slot);
    const vencedor = melhorPorPrioridade(candidatos, (fragmento) =>
      evaluateCondition(fragmento.when, state)
    );
    if (vencedor) fragmentos.push(vencedor);
  }
  return fragmentos;
}

/**
 * "O que ficou" — a seção moral da ficha. Um fragmento casa se o final carrega
 * **todas** as tags que ele exige e a condição passa.
 */
export function resolveMoral(
  sheet: DexSheet,
  tags: EndingTag[],
  state: Qualities
): MoralFragment | undefined {
  return melhorPorPrioridade(
    sheet.morais,
    (fragmento) =>
      (fragmento.tags ?? []).every((tag) => tags.includes(tag)) &&
      evaluateCondition(fragmento.when, state)
  );
}

/**
 * `fuga` é a única tag que não cataloga. `ruim` e `neutro` catalogam com relato
 * incompleto — a completude cai sozinha porque menos pistas foram descobertas.
 */
export function podeCatalogar(tags: EndingTag[]): boolean {
  return !tags.includes(TAG_SEM_CATALOGO);
}
