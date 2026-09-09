// ─── Persistência ────────────────────────────────────────────────────────────
// Dois níveis: o que é do save, e o que atravessa saves.
//
// - Não é permitido rejogar uma região no mesmo save.
// - `dex` e `finaisVistos` são globais: apagar um save **não** apaga a galeria
//   nem o caderno de campo.

import type { DexEntry, SaveSlotId } from './dex';
import type { EndingTag } from './ending';
import type { ClueId, LineId, RegionId, SceneId } from './ids';
import type { Qualities } from './qualities';

export type RegionOutcome = {
  endingId: string;
  tags: EndingTag[];
};

export type SaveSlot = {
  version: number;
  slot: SaveSlotId;
  criadoEm: number;
  atualizadoEm: number;
  qualities: Qualities;
  /**
   * Em que região o save está. Explícito porque derivar do prefixo de
   * `currentSceneId` violaria SYSTEM_DESIGN.md §4.1 — id não se deriva de string.
   */
  currentRegionId: RegionId | null;
  currentSceneId: SceneId;
  currentLineId?: LineId;
  /** Fora das qualidades: alimenta `Choice.once`. */
  takenChoices: string[];
  /** Ordem de descoberta, preservada. */
  clueOrder: ClueId[];
  /**
   * A verdade estruturada sobre finais. Os contadores `meta.tag_*` em `qualities`
   * são **espelhos derivados daqui**, existindo só porque `Condition` lê números.
   *
   * O capítulo final do Saci é avaliado por save, consultando isto: não é portão
   * binário — a composição de tags decide o conteúdo (só bons / misto / só ruins
   * / só fugas).
   */
  regioesConcluidas: Partial<Record<RegionId, RegionOutcome>>;
};

export type GlobalProgress = {
  version: number;
  dex: Record<string, DexEntry>;
  /** `endingId`s, para a galeria. */
  finaisVistos: string[];
  /**
   * Qual slot o jogador tocou por último. Existe para o "Continuar" do menu não
   * precisar adivinhar — o boot não ativa partida nenhuma sozinho.
   */
  ultimoSlotJogado?: SaveSlotId;
};

/**
 * O que o menu precisa para desenhar a lista de saves sem carregar os três
 * inteiros. Derivado de um `SaveSlot`, nunca persistido em separado.
 */
export type SlotSummary = {
  slot: SaveSlotId;
  vazio: boolean;
  regionId?: RegionId;
  atualizadoEm?: number;
  /** Quantas regiões este save já concluiu. */
  regioesConcluidas?: number;
};

/** Por que uma região não pode ser entrada. União fechada: a tela renderiza cada caso. */
export type MotivoBloqueio = 'ja_concluida' | 'save_inexistente' | 'regiao_desconhecida';

export type PermissaoRegiao = { permitido: true } | { permitido: false; motivo: MotivoBloqueio };
