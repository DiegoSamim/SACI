// ─── FolcloreDex ─────────────────────────────────────────────────────────────
// A ficha registra o que o **investigador concluiu**, não uma verdade objetiva.
//
// Três seções com regras diferentes:
//
// | Seção                     | Origem                      | Varia por save |
// | ------------------------- | --------------------------- | -------------- |
// | Relato do investigador    | pistas descobertas, em ordem | sim           |
// | O que ficou (moral)       | tags do final               | sim            |
// | A lenda (factual)         | conteúdo autoral fixo       | não            |
//
// A seção factual **nunca é parcial**. Ela é a carga educativa do jogo; punir o
// jogador com meia lição de folclore inverteria o objetivo.

import type { EndingTag, MoralFragment } from './ending';
import type { ClueId, CreatureId, RegionId } from './ids';

/** Slot de save. Três por instalação. */
export type SaveSlotId = 1 | 2 | 3;

export type DexRecord = {
  savedAt: number;
  slot: SaveSlotId;
  endingId: string;
  tags: EndingTag[];
  /** Ordem de descoberta, preservada — não a ordem de declaração. */
  pistas: ClueId[];
  /**
   * Domínio `0..1`, **derivado**, nunca autorado:
   *
   * ```
   * completude = pistas descobertas ÷ RegionContent.clues.length
   * ```
   *
   * O denominador é o número de `ClueDef` declarados na região; toda pista
   * declarada conta, sem opt-out. O numerador são as chaves `pista.*` da região
   * com valor `≠ 0` no fim da partida.
   */
  completude: number;
  /** Texto do `MoralFragment` vencedor, já resolvido. */
  moral: string;
};

export type DexEntry = {
  creatureId: CreatureId;
  regionId: RegionId;
  /** Seção factual. Fixa, autoral, idêntica em todos os saves. */
  lenda: string;
  /**
   * Caderno de campo passado adiante: registros **empilham**, não sobrescrevem.
   * Ordenados por `completude` descendente — a UI destaca o mais completo e
   * mostra os anteriores como registros passados, assinados. Duas investigações
   * da mesma criatura com finais diferentes viram duas vozes discordando na
   * mesma página.
   */
  registros: DexRecord[];
};

/**
 * A ficha como o conteúdo a declara. `registros` não aparece aqui: é produzido
 * pelo jogo, não escrito pelo autor.
 */
export type DexSheet = {
  creatureId: CreatureId;
  regionId: RegionId;
  lenda: string;
  /** Precisa conter ao menos um fragmento sem `tags` e sem `when`. */
  morais: MoralFragment[];
  /** Explicação diegética exibida quando o final tem a tag `TAG_SEM_CATALOGO`. */
  textoNaoRegistrado: string;
};
