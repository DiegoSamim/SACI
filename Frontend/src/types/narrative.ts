import type { RegionId } from './ids';

// ─── Consequências de uma escolha ────────────────────────────────────────────
export type ChoiceConsequence =
  | { type: 'navigate'; sceneId: string } // navega para outra cena
  | { type: 'game_over'; reason: GameOverReason } // termina o cenário com um motivo específico
  | { type: 'add_clue'; clueId: string } // adiciona uma pista ao progresso do jogador
  | { type: 'add_condition'; condition: string } // adiciona uma condição customizada (ex: "falou_com_x") para desbloquear escolhas futuras
  | { type: 'remove_condition'; condition: string } // remove uma condição customizada (ex: resetar bloqueio de opção)
  | { type: 'go_back' }; // volta para a cena anterior

export type GameOverReason =
  | 'fled' // jogador foi embora
  | 'caught' // criatura capturou o jogador
  | 'failed' // jogador falhou em alguma ação
  | 'catalogued'; // jogador catalogou a criatura (final bom)

// ─── Escolha do jogador ───────────────────────────────────────────────────────
export type ChoiceOption = {
  id: string;
  text: string; // texto da escolha
  consequences: ChoiceConsequence[]; // pode ter múltiplas consequências
  // ex: adicionar pista E navegar para próxima cena
  requiresClues?: string[]; // só aparece se o jogador tiver essas pistas
  requiresConditions?: string[]; // condições customizadas para mostrar a escolha (ex: ter falado com um NPC)
  blockConditions?: string[]; // se alguma existir, a escolha fica bloqueada/escondida
};

// ─── Cena de narrativa ────────────────────────────────────────────────────────
export type ScenarioScene = {
  type: 'scenario_scene';
  id: string;
  regionId: RegionId;
  imageSource?: any;
  narrativeText: string;
  question?: string;
  choices: ChoiceOption[];
};

// ─── Humor do NPC (impacta respostas da IA futuramente) ──────────────────────
export type NPCMood = 'neutral' | 'friendly' | 'suspicious' | 'angry' | 'scared' | 'sad';

// ─── Linha de diálogo de NPC ──────────────────────────────────────────────────
export type NPCLine = {
  id: string;
  text: string;
  mood: NPCMood; // humor do NPC nessa fala
  choices: ChoiceOption[];
};

// ─── Cena de diálogo com NPC ─────────────────────────────────────────────────
export type ScenarioDialogue = {
  type: 'scenario_dialogue';
  id: string;
  regionId: RegionId;
  npcId: string;
  npcName: string;
  npcRole: string;
  npcImageSource?: any;
  backgroundImageSource?: any;
  lines: Record<string, NPCLine>; // mapa por id para ramificação
  initialLineId: string; // linha inicial
};

// ─── União dos dois tipos de cena ────────────────────────────────────────────
export type Scene = ScenarioScene | ScenarioDialogue;

// ─── Regiões ──────────────────────────────────────────────────────────────────
// Fonte única em types/ids.ts. Reexportado aqui para não quebrar os importadores
// existentes — duas uniões de cinco strings que precisam ficar em sincronia é a
// dívida C4 acontecendo de novo.
export type { RegionId } from './ids';

// ─── Pista descoberta ─────────────────────────────────────────────────────────
export type Clue = {
  id: string;
  regionId: RegionId;
  title: string;
  description: string;
  icon: string;
};

// ─── Estado do jogador numa região ────────────────────────────────────────────
export type RegionProgress = {
  regionId: RegionId;
  currentSceneId: string;
  discoveredClues: string[]; // ids das pistas
  npcMoods: Record<string, NPCMood>; // humor atual de cada NPC
  outcome?: 'catalogued' | 'fled' | 'failed' | 'caught';
};
