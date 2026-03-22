import { create } from "zustand"
import { RegionId, NPCMood, Scene } from "../types/narrative"
import { NORDESTE_SCENES, NORDESTE_CLUES } from "../data/region/nordeste"
import { Clue } from "../types/narrative"
import { ConversationMessage } from "../types/api"

type RegionOutcome = "catalogued" | "fled" | "failed" | "caught"

type RegionResumeState = {
  outcome: RegionOutcome
  reason: RegionOutcome
}

// ─── Registro global de cenas por região ─────────────────────────────────────
const ALL_SCENES: Partial<Record<RegionId, Record<string, Scene>>> = {
  nordeste: NORDESTE_SCENES,
  // norte: NORTE_SCENES,
}

// ─── Registro global de pistas por região ────────────────────────────────────
const ALL_CLUES: Record<string, Clue> = {
  ...NORDESTE_CLUES,
}

// ─── Estado de uma região ativa ───────────────────────────────────────────────
export type RegionState = {
  regionId: RegionId
  currentSceneId: string
  previousSceneId: string | null       // para poder voltar
  discoveredClues: string[]
  npcMoods: Record<string, NPCMood>
  visitedScenes: string[]              // histórico de cenas visitadas
  flags: Record<string, boolean>       // flags livres: "fled_once", "visited_caatinga_twice"
  outcome: "playing" | "catalogued" | "fled" | "failed" | "caught" | "fled_and_returned"
  lastOutcomeReason?: RegionOutcome
}

// ─── Estado global do app ─────────────────────────────────────────────────────
type GameStore = {
  // Região ativa
  activeRegion: RegionState | null

  // Progresso persistente entre regiões
  cataloguedCreatures: RegionId[]
  globalClues: string[]
  regionResumeState: Partial<Record<RegionId, RegionResumeState>>
  lastGameOver: { regionId: RegionId; reason: RegionOutcome } | null

  // ── Ações ──────────────────────────────────────────────────────────────────
  startRegion: (regionId: RegionId) => void
  navigateTo: (sceneId: string) => void
  addClue: (clueId: string) => void
  setNPCMood: (npcId: string, mood: NPCMood) => void
  setFlag: (flag: string, value: boolean) => void
  setOutcome: (outcome: RegionState["outcome"]) => void
  getFlag: (flag: string) => boolean
  getCurrentScene: () => Scene | null
  getClueObjects: () => Clue[]
  resetRegion: () => void

  // Histórico por NPC — chave é o npcId
  conversationHistories: Record<string, ConversationMessage[]>

  // Ações novas
  addConversationMessage: (npcId: string, msg: ConversationMessage) => void
  getConversationHistory: (npcId: string) => ConversationMessage[]
  clearConversationHistory: (npcId: string) => void

}



const getResumeSceneId = (regionId: RegionId, resume?: RegionResumeState) => {
  if (!resume) return `${regionId}_entrada`
  if (resume.outcome === "catalogued") return `${regionId}_catalogar`
  if (resume.outcome === "fled") return `${regionId}_cidade_game_over`
  return `${regionId}_entrada`
}

export const useGameStore = create<GameStore>((set, get) => ({
  activeRegion: null,
  cataloguedCreatures: [],
  globalClues: [],
  regionResumeState: {},
  lastGameOver: null,
  conversationHistories: {},

  // ── Inicia ou reinicia uma região ─────────────────────────────────────────
  startRegion: (regionId) => {
    const resume = get().regionResumeState[regionId]
    const entrySceneId = getResumeSceneId(regionId, resume)
    set({
      activeRegion: {
        regionId,
        currentSceneId: entrySceneId,
        previousSceneId: null,
        discoveredClues: [],
        npcMoods: {},
        visitedScenes: [entrySceneId],
        flags: {},
        outcome: "playing",
        lastOutcomeReason: resume?.reason,
      },
    })
  },

  // ── Navega para uma cena ──────────────────────────────────────────────────
  navigateTo: (sceneId) => {
    set((state) => {
      if (!state.activeRegion) return state
      const prev = state.activeRegion.currentSceneId
      const alreadyVisited = state.activeRegion.visitedScenes.includes(sceneId)
      return {
        activeRegion: {
          ...state.activeRegion,
          previousSceneId: prev,
          currentSceneId: sceneId,
          visitedScenes: alreadyVisited
            ? state.activeRegion.visitedScenes
            : [...state.activeRegion.visitedScenes, sceneId],
        },
      }
    })
  },

  // ── Adiciona uma pista ────────────────────────────────────────────────────
  addClue: (clueId) => {
    set((state) => {
      if (!state.activeRegion) return state
      if (state.activeRegion.discoveredClues.includes(clueId)) return state
      return {
        activeRegion: {
          ...state.activeRegion,
          discoveredClues: [...state.activeRegion.discoveredClues, clueId],
        },
        globalClues: state.globalClues.includes(clueId)
          ? state.globalClues
          : [...state.globalClues, clueId],
      }
    })
  },

  // ── Atualiza humor do NPC ─────────────────────────────────────────────────
  setNPCMood: (npcId, mood) => {
    set((state) => {
      if (!state.activeRegion) return state
      return {
        activeRegion: {
          ...state.activeRegion,
          npcMoods: { ...state.activeRegion.npcMoods, [npcId]: mood },
        },
      }
    })
  },

  // ── Seta uma flag livre ───────────────────────────────────────────────────
  setFlag: (flag, value) => {
    set((state) => {
      if (!state.activeRegion) return state
      return {
        activeRegion: {
          ...state.activeRegion,
          flags: { ...state.activeRegion.flags, [flag]: value },
        },
      }
    })
  },

  // ── Lê uma flag ───────────────────────────────────────────────────────────
  getFlag: (flag) => {
    return get().activeRegion?.flags[flag] ?? false
  },

  // ── Seta o outcome ────────────────────────────────────────────────────────
  setOutcome: (outcome) => {
    set((state) => {
      if (!state.activeRegion) return state
      const isWin = outcome === "catalogued"
      const reason = outcome as RegionOutcome
      const shouldResumeFromEnding = outcome === "catalogued" || outcome === "fled"

      return {
        activeRegion: { ...state.activeRegion, outcome, lastOutcomeReason: reason },
        cataloguedCreatures:
          isWin && !state.cataloguedCreatures.includes(state.activeRegion.regionId)
            ? [...state.cataloguedCreatures, state.activeRegion.regionId]
            : state.cataloguedCreatures,
        regionResumeState: shouldResumeFromEnding
          ? {
            ...state.regionResumeState,
            [state.activeRegion.regionId]: { outcome: reason, reason },
          }
          : state.regionResumeState,
        lastGameOver: { regionId: state.activeRegion.regionId, reason },
      }
    })
  },

  // ── Cena atual resolvida ──────────────────────────────────────────────────
  getCurrentScene: () => {
    const region = get().activeRegion
    if (!region) return null
    const scenes = ALL_SCENES[region.regionId]
    return scenes?.[region.currentSceneId] ?? null
  },

  // ── Pistas como objetos ───────────────────────────────────────────────────
  getClueObjects: () => {
    const clueIds = get().activeRegion?.discoveredClues ?? []
    return clueIds.map((id) => ALL_CLUES[id]).filter(Boolean)
  },

  // ── Reseta a região atual ─────────────────────────────────────────────────
  resetRegion: () => {
    set({ activeRegion: null })
  },

  addConversationMessage: (npcId, msg) => {
    set((state) => {
      const current = state.conversationHistories[npcId] ?? []

      // Mantém máximo 20 mensagens por NPC
      const updated = [...current, msg].slice(-20)

      return {
        conversationHistories: {
          ...state.conversationHistories,
          [npcId]: updated,
        },
      }
    })
  },

  getConversationHistory: (npcId) => {
    return get().conversationHistories[npcId] ?? []
  },

  clearConversationHistory: (npcId) => {
    set((state) => ({
      conversationHistories: {
        ...state.conversationHistories,
        [npcId]: [],
      },
    }))
  },
}))

// ─── Hook auxiliar para resolução de consequências ───────────────────────────
// Usar nas telas no lugar do antigo useGameEngine
import { ChoiceOption, ChoiceConsequence } from "../types/narrative"

export function useChoiceResolver() {
  const store = useGameStore()

  const resolveConsequences = (consequences: ChoiceConsequence[]) => {
    for (const c of consequences) {
      switch (c.type) {
        case "navigate":
          // Navegação interna de linha (#) é tratada nas telas
          if (!c.sceneId.includes("#")) {
            store.navigateTo(c.sceneId)
          }
          break
        case "add_clue":
          store.addClue(c.clueId)
          break
        case "add_condition":
          store.setFlag(c.condition, true)
          break
        case "remove_condition":
          store.setFlag(c.condition, false)
          break
        case "game_over":
          store.setOutcome(
            c.reason === "fled" ? "fled"
              : c.reason === "caught" ? "caught"
                : c.reason === "catalogued" ? "catalogued"
                  : "failed"
          )
          break
        case "go_back":
          store.setOutcome("catalogued")
          break
      }
    }
  }

  const makeChoice = (choice: ChoiceOption) => {
    resolveConsequences(choice.consequences)
  }

  const availableChoices = (choices: ChoiceOption[]): ChoiceOption[] => {
    const clues = store.activeRegion?.discoveredClues ?? []
    const flags = store.activeRegion?.flags ?? {}

    return choices.filter((choice) => {
      const hasRequiredClues =
        !choice.requiresClues ||
        choice.requiresClues.length === 0 ||
        choice.requiresClues.every((id) => clues.includes(id))

      const hasRequiredConditions =
        !choice.requiresConditions ||
        choice.requiresConditions.length === 0 ||
        choice.requiresConditions.every((condition) => !!flags[condition])

      const hasBlockedConditions =
        !!choice.blockConditions &&
        choice.blockConditions.some((condition) => !!flags[condition])

      const isUnlocked = hasRequiredClues && hasRequiredConditions && !hasBlockedConditions

      return isUnlocked
    })
  }

  return { makeChoice, availableChoices, resolveConsequences }
}