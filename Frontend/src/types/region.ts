// ─── Uma região como dado ────────────────────────────────────────────────────
// `RegionContent` é o objeto único que o `REGION_REGISTRY` guarda e que o
// validador percorre. Escrever uma região nova é preencher isto — nunca um `if`.

import type { DexSheet } from './dex';
import type { Ending, EpilogueFragment } from './ending';
import type { ClueId, CreatureId, NpcId, RegionId, SceneId } from './ids';
import type { MoodKey, QualityRegistry, WorldKey } from './qualities';
import type { Scene } from './scene';

/**
 * Apresentação do NPC. Separado da cena para não duplicar em cada diálogo, e com
 * `retrato` como **chave de asset**, não `require()` — ver `LocalScene.imagem`.
 */
export type NpcDef = {
  /** Único entre **todas** as regiões: `humor.<npcId>` não é prefixado por região. */
  id: NpcId;
  nome: string;
  papel: string;
  retrato?: string;
  /** `humor.<id>`, redundante mas explícito: é por aqui que a UI acha a faixa. */
  humorKey?: MoodKey;
};

/**
 * Apresentação de uma pista. O que a `QualityDef.label` não comporta: descrição e
 * ícone, que o modal de pistas e o "Relato do investigador" do Dex consomem.
 */
export type ClueDef = {
  /** Único entre **todas** as regiões. A chave de estado é `pista.<id>`. */
  id: ClueId;
  titulo: string;
  descricao: string;
  icone: string;
};

export type RegionMeta = {
  regionId: RegionId;
  /** Nome de exibição. Nunca derive o `regionId` daqui. */
  label: string;
  creatureId: CreatureId;
  entrySceneId: SceneId;
  /**
   * Qual chave é "o ato" desta região — ex.: `mundo.nordeste.ato`. Declarado
   * porque `mundo.` é prefixado por região e a engine não pode adivinhar. É o que
   * dispara o evento `actAdvanced`.
   */
  atoKey: WorldKey;
  /** Slots de epílogo que os finais desta região podem referenciar. */
  epilogueSlots: string[];
};

export type RegionContent = {
  meta: RegionMeta;
  qualities: QualityRegistry;
  scenes: Record<SceneId, Scene>;
  npcs: Record<NpcId, NpcDef>;
  clues: Record<ClueId, ClueDef>;
  /** Ao menos um final com tag `bom` e **exatamente um** sem `when`. */
  endings: Ending[];
  /** Todo slot referenciado precisa de ao menos um fragmento sem `when`. */
  epilogue: EpilogueFragment[];
  dex: DexSheet;
};

/** Fonte única de conteúdo do app. Store, engine e telas leem daqui. */
export type RegionRegistry = Partial<Record<RegionId, RegionContent>>;
