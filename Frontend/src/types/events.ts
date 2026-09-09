// ─── Barramento de eventos ───────────────────────────────────────────────────
// A engine emite sem saber quem escuta. É o gancho para o Saci, que será
// construído depois e vive numa área separada da tela.
//
// Nesta versão existe apenas emissão e um subscriber vazio. **Nenhuma lógica do
// Saci** — ver docs/FUTURE.md.

import type { EndingTag } from './ending';
import type { NpcId, SceneId } from './ids';

export type EngineEvent =
  | { type: 'sceneEnter'; sceneId: SceneId; primeiraVez: boolean }
  | { type: 'choiceTaken'; choiceId: string; sceneId: SceneId }
  /** `ordem` é a posição em `clueOrder`, base 1. */
  | { type: 'clueFound'; clueKey: string; ordem: number }
  /** `de`/`para` são nomes de faixa, não números — ver `QualityDef.faixas`. */
  | { type: 'moodChanged'; npcId: NpcId; de: string; para: string }
  /** Emitido quando `RegionMeta.atoKey` muda de valor. */
  | { type: 'actAdvanced'; ato: number }
  | { type: 'endingReached'; endingId: string; tags: EndingTag[] }
  /** Produzido pelo efeito `emit`. */
  | { type: 'custom'; event: string; tag?: string };

export type EngineEventListener = (event: EngineEvent) => void;
