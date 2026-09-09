// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
import type { RegionContent } from '@/types/region';
import type { Scene } from '@/types/scene';
import { NORDESTE_CLUES } from './clues';
import { NORDESTE_DEX } from './dex';
import { NORDESTE_DIALOGUE_SCENES } from './dialogues';
import { NORDESTE_ENDINGS, NORDESTE_EPILOGUE } from './endings';
import { NORDESTE_META } from './meta';
import { NORDESTE_NPCS } from './npcs';
import { NORDESTE_QUALITIES } from './qualities';
import { NORDESTE_LOCAL_SCENES } from './scenes';

const byId = (scenes: Scene[]): Record<string, Scene> =>
  Object.fromEntries(scenes.map((scene) => [scene.id, scene]));

export const NORDESTE_V2: RegionContent = {
  meta: NORDESTE_META,
  qualities: NORDESTE_QUALITIES,
  scenes: byId([...NORDESTE_LOCAL_SCENES, ...NORDESTE_DIALOGUE_SCENES]),
  npcs: NORDESTE_NPCS,
  clues: NORDESTE_CLUES,
  endings: NORDESTE_ENDINGS,
  epilogue: NORDESTE_EPILOGUE,
  dex: NORDESTE_DEX,
};
