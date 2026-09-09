// ─── Constantes de runtime da engine ─────────────────────────────────────────
// Moradia legítima do que a etapa 1 tinha deixado em `types/`: SYSTEM_DESIGN.md §3
// diz que `types/` não contém implementação, e uma const é runtime.

import type { TerminalEffectType } from '@/types/effects';
import type { EndingTag, TagSemCatalogo } from '@/types/ending';
import type { MetaMirrorKey } from '@/types/qualities';

/** Encerram o array de efeitos: o que vier depois é ignorado, com `warning`. */
export const TERMINAL_EFFECT_TYPES: readonly TerminalEffectType[] = ['navigate', 'end_region'];

/**
 * Espelhos numéricos de `SaveSlot.regioesConcluidas`, para que `Condition` — que
 * só lê números — consiga consultar o histórico de finais. Escritos
 * exclusivamente por `buildRegionCompletion`.
 */
export const META_REGIOES_CONCLUIDAS: MetaMirrorKey = 'meta.regioes_concluidas';

export const META_TAG_KEYS: Readonly<Record<EndingTag, MetaMirrorKey>> = {
  bom: 'meta.tag_bom',
  neutro: 'meta.tag_neutro',
  ruim: 'meta.tag_ruim',
  fuga: 'meta.tag_fuga',
};

/** Prefixos que só a engine escreve. O tipo `Effect` já barra conteúdo aqui. */
export const ENGINE_OWNED_PREFIXES: readonly string[] = ['visita.', 'meta.'];

/**
 * `fuga` é a única tag que não cataloga: o investigador foi embora antes de
 * entender. `ruim` e `neutro` catalogam com relato incompleto — a completude cai
 * sozinha porque menos pistas foram descobertas. Regra global, não por região.
 */
export const TAG_SEM_CATALOGO: TagSemCatalogo = 'fuga';

/** Namespace das pistas. `pista.cabra_voz` ↔ id nu `cabra_voz`. */
export const PISTA_PREFIX = 'pista.';
export const HUMOR_PREFIX = 'humor.';
export const VISITA_PREFIX = 'visita.';
