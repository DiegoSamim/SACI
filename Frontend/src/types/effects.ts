// ─── Efeitos ─────────────────────────────────────────────────────────────────
// A engine conhece exatamente estes cinco. Adicionar um tipo novo é **mudança de
// engine** e exige atualizar, no mesmo commit: este arquivo, `applyEffects`, o
// validador e SYSTEM_DESIGN.md §4.
//
// `go_back` foi **extinto**. Voltar é uma escolha autorada, com `navigate`
// explícito e efeitos próprios.

import type { AuthoredQualityKey, Qualities } from './qualities';
import type { ClueId, LineId, NavigateTarget, SceneId } from './ids';
import type { EngineEvent } from './events';

export type Effect =
  /** Grava um valor absoluto. Sofre clamp em `min`/`max` do registro. */
  | { type: 'set'; key: AuthoredQualityKey; value: number }
  /** Soma (ou subtrai) do valor atual. Sofre clamp em `min`/`max` do registro. */
  | { type: 'adjust'; key: AuthoredQualityKey; by: number }
  /** `"sceneId"` ou `"sceneId#lineId"`. Só pode ser o **último** efeito. */
  | { type: 'navigate'; to: NavigateTarget }
  /** Sem `endingId`, a engine resolve por condição. Só pode ser o **último** efeito. */
  | { type: 'end_region'; endingId?: string }
  /** Gancho narrativo — chega no barramento como `EngineEvent` de tipo `custom`. */
  | { type: 'emit'; event: string; tag?: string };

/**
 * Efeitos que encerram o array. O validador rejeita qualquer efeito depois de um
 * destes: navegar no meio de uma lista deixaria efeitos órfãos. Os valores vivem
 * em `engine/constants.ts` — `types/` não tem runtime.
 */
export type TerminalEffectType = 'navigate' | 'end_region';

/**
 * Navegação **descrita**, não executada. A engine parte o `#`; a tela recebe as
 * duas metades prontas e nunca chama `split("#")`.
 */
export type NavigationIntent = { sceneId: SceneId; lineId?: LineId };

/** Encerramento **descrito**. Quem grava o save e navega é o store. */
export type EndRegionIntent = { endingId?: string };

/**
 * O que `applyEffects` devolve. Função pura: nada aqui foi executado — são
 * intenções que o store cumpre.
 */
export type EffectResult = {
  qualities: Qualities;
  events: EngineEvent[];
  navigation?: NavigationIntent;
  endRegion?: EndRegionIntent;
  /**
   * Chaves `pista.*` que foram de `0` para `≠ 0` nesta aplicação, na ordem em que
   * mudaram. O store as anexa a `SaveSlot.clueOrder`. Vale para `set` **e** para
   * `adjust` — é o que preserva a ordem de descoberta sem um efeito dedicado.
   */
  newClues: ClueId[];
  /**
   * Diagnóstico de autoria — hoje, efeito depois de um terminal. Em produção o
   * comportamento certo é ignorar o resto e não quebrar, mas o validador só
   * chega na etapa 5 e um bug de autoria não pode atravessar mudo até lá.
   * Os testes de playthrough falham se isto vier preenchido.
   */
  warnings: string[];
};
