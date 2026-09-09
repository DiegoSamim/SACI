// ─── Finais, epílogos e a moral ──────────────────────────────────────────────
// Uma região não termina num `GameOverReason` de quatro valores: termina num
// final **nomeado**, com tags, resolvido por condição e prioridade.

import type { Condition } from './conditions';

export type EndingTag = 'bom' | 'neutro' | 'ruim' | 'fuga';

export type Ending = {
  /** `{regionId}_{slug}` — ex.: `nordeste_criancas_levadas`. */
  id: string;
  /** Nome exibido — ex.: "O silêncio que ficou". */
  nome: string;
  /** Pode acumular: `["neutro", "ruim"]`. */
  tags: EndingTag[];
  /** Ausente = fallback. Toda região tem **exatamente um** final sem `when`. */
  when?: Condition;
  priority: number;
  texto: string;
  /** Slots a resolver, na ordem de exibição. Slots são livres, declarados no meta. */
  epilogo?: string[];
};

export type EpilogueFragment = {
  id: string;
  /** Slot livre, declarado em `RegionMeta.epilogueSlots`. */
  slot: string;
  when?: Condition;
  priority: number;
  texto: string;
};

/**
 * "O que ficou" — a seção moral da ficha do FolcloreDex. Deriva das tags do final
 * e, opcionalmente, do estado.
 *
 * Resolvido como os fragmentos de epílogo: maior `priority` entre os que casam.
 * Um fragmento **sem `tags` e sem `when`** é obrigatório como fallback.
 */
export type MoralFragment = {
  id: string;
  /** Casa se o final carrega **todas** estas tags. Ausente = casa com qualquer final. */
  tags?: EndingTag[];
  when?: Condition;
  priority: number;
  texto: string;
};

// ─── Regra de liberação de catálogo ──────────────────────────────────────────

/**
 * `fuga` é a **única** tag que não cataloga: o investigador foi embora antes de
 * entender, e a ficha fica marcada como não registrada com explicação diegética.
 * `ruim` e `neutro` catalogam com relato incompleto — a completude cai sozinha
 * porque menos pistas foram descobertas.
 *
 * Regra **global**, não por região: uma região não escolhe punir diferente.
 *
 * O valor e a função que o consome (`podeCatalogar`) vivem na engine —
 * `types/` não tem runtime.
 */
export type TagSemCatalogo = 'fuga';
