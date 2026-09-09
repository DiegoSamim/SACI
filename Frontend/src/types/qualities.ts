// ─── Estado do jogo: qualidades ──────────────────────────────────────────────
// Todo estado narrativo é numérico e unificado. Substitui `discoveredClues`,
// `flags` e `npcMoods` do modelo v1. Ver SYSTEM_DESIGN.md §4.

import type { ClueId, NpcId, RegionId, SceneId } from './ids';

/**
 * O estado inteiro da partida numa região. **Chave ausente vale `0`** — a engine
 * nunca lê `undefined`, e conteúdo nunca precisa testar existência.
 */
export type Qualities = Record<string, number>;

// ─── Namespaces ──────────────────────────────────────────────────────────────
// Toda chave pertence a um namespace. Chave fora deles, ou não declarada no
// registro da região, é **erro do validador** — nunca bug silencioso.

/** Conhecimento do investigador. Global entre regiões: `ClueId` é único no projeto. */
export type ClueKey = `pista.${ClueId}`;

/** Humor de um NPC, tipicamente -3..+3. `NpcId` é único no projeto. */
export type MoodKey = `humor.${NpcId}`;

/** Relação com um NPC — distinta de humor: laço é acumulado, humor é volátil. */
export type BondKey = `laco.${NpcId}`;

/**
 * Estado da região. **Prefixado por região**, porque um save atravessa as cinco
 * e `mundo.ato` colidiria entre elas: `mundo.nordeste.ato`.
 */
export type WorldKey = `mundo.${RegionId}.${string}`;

/** Histórico de ações. Prefixado por região, pelo mesmo motivo que `mundo.`. */
export type DeedKey = `feito.${RegionId}.${string}`;

/**
 * Contador de visitas a uma cena. **Gerado pela engine** ao entrar na cena, nunca
 * declarado no registro e nunca escrito por conteúdo. Permite variantes de
 * "primeira vez" e "você já esteve aqui" sem duplicar cenas.
 */
export type VisitKey = `visita.${SceneId}`;

/**
 * Progresso entre regiões, no save. Também **derivado**: escrito exclusivamente
 * pela engine ao concluir uma região. Ver `META_MIRROR_KEYS`.
 */
export type MetaKey = `meta.${string}`;

/**
 * União das chaves que o **autor de conteúdo** pode declarar e escrever.
 * `visita.` e `meta.` ficam de fora de propósito.
 */
export type AuthoredQualityKey = ClueKey | MoodKey | BondKey | WorldKey | DeedKey;

// ─── Chaves derivadas, proibidas para conteúdo ───────────────────────────────

/**
 * Espelhos numéricos de `SaveSlot.regioesConcluidas`, para que `Condition` —
 * que só lê números — consiga consultar o histórico de finais. É o que o
 * capítulo final do Saci vai avaliar.
 *
 * A verdade estruturada (endingId + tags) vive em `SaveSlot.regioesConcluidas`;
 * estes contadores são **derivados dela**, incrementados pela engine no
 * `end_region`. Conteúdo que escreva aqui é rejeitado pelo tipo `Effect`.
 *
 * Os valores em si vivem em `engine/constants.ts` — `types/` não tem runtime.
 */
export type MetaMirrorKey =
  | 'meta.regioes_concluidas'
  | 'meta.tag_bom'
  | 'meta.tag_neutro'
  | 'meta.tag_ruim'
  | 'meta.tag_fuga';

// ─── Registro de qualidades ──────────────────────────────────────────────────

/**
 * Converte número em palavra. É como o humor chega na UI sem espalhar `if`.
 * Intervalos são **inclusivos nas duas pontas** e não devem se sobrepor.
 *
 * ```ts
 * { hostil: [-3, -2], fechado: [-1, -1], neutro: [0, 0], receptivo: [1, 2] }
 * ```
 */
export type QualityBands = Record<string, readonly [number, number]>;

export type QualityDef = {
  /**
   * Só namespaces autoráveis. `visita.` e `meta.` são derivados e não se declaram
   * — e `mundo.`/`feito.` exigem o prefixo de região, o que o tipo já impõe.
   */
  key: AuthoredQualityKey;
  /** Valor antes de qualquer efeito. Redundante com "ausente vale 0", mas explícito. */
  default: number;
  /** A engine aplica clamp em `min`/`max` a cada `adjust` e a cada `set`. */
  min?: number;
  max?: number;
  /** Rótulo humano — usado no inspetor de dev e como título curto na UI. */
  label?: string;
  faixas?: QualityBands;
};

/**
 * Todas as qualidades que uma região declara. Meta de autoria: ~15 chaves,
 * fora `visita.` e `meta.`, que não se declaram.
 */
export type QualityRegistry = readonly QualityDef[];

/** Índice por chave, o formato que a engine e o validador consomem. */
export type QualityIndex = Readonly<Record<string, QualityDef>>;

/**
 * Toda chave que uma `Condition` pode **ler** — inclui as derivadas, que
 * conteúdo lê mas não escreve. Compare com `AuthoredQualityKey`, que é o que
 * um `Effect` pode escrever.
 */
export type QualityKey = AuthoredQualityKey | VisitKey | MetaKey;
