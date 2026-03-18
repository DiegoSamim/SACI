import { useState, useCallback } from "react"
import {
  RegionId,
  RegionProgress,
  ChoiceOption,
  ChoiceConsequence,
  NPCMood,
  Scene,
} from "../types/narrative"
import { NORDESTE_SCENES } from "../data/region/nordeste"

// Registre aqui as cenas de cada região conforme for criando
const REGION_SCENES: Partial<Record<RegionId, Record<string, Scene>>> = {
  nordeste: NORDESTE_SCENES,
  // norte: NORTE_SCENES,
  // sudeste: SUDESTE_SCENES,
  // sul: SUL_SCENES,
  // centro_oeste: CENTRO_OESTE_SCENES,
}

export function useGameEngine(regionId: RegionId, entrySceneId: string) {
  const [progress, setProgress] = useState<RegionProgress>({
    regionId,
    currentSceneId: entrySceneId,
    discoveredClues: [],
    npcMoods: {},
    outcome: undefined,
  })

  const scenes = REGION_SCENES[regionId] ?? {}
  const currentScene = scenes[progress.currentSceneId] as Scene | undefined

  // Filtra choices pelo requiresClues + hidden
  const availableChoices = useCallback(
    (choices: ChoiceOption[]): ChoiceOption[] => {
      return choices.filter((choice) => {
        if (!choice.requiresClues || choice.requiresClues.length === 0) return true
        const hasAll = choice.requiresClues.every((id) =>
          progress.discoveredClues.includes(id)
        )
        if (choice.hidden) return hasAll
        return true // tem requiresClues mas não é hidden — aparece sempre, só habilita se tiver
      })
    },
    [progress.discoveredClues]
  )

  // Resolve consequências em sequência
  const resolveConsequences = useCallback((consequences: ChoiceConsequence[]) => {
    setProgress((prev) => {
      let next = { ...prev, npcMoods: { ...prev.npcMoods } }

      for (const c of consequences) {
        switch (c.type) {
          case "add_clue":
            if (!next.discoveredClues.includes(c.clueId)) {
              next = { ...next, discoveredClues: [...next.discoveredClues, c.clueId] }
            }
            break
          case "navigate":
            next = { ...next, currentSceneId: c.sceneId }
            break
          case "game_over":
            next = { ...next, outcome: "failed" }
            break
          case "go_back":
            next = { ...next, outcome: "catalogued" }
            break
        }
      }

      return next
    })
  }, [])

  const makeChoice = useCallback(
    (choice: ChoiceOption) => {
      resolveConsequences(choice.consequences)
    },
    [resolveConsequences]
  )

  const setNPCMood = useCallback((npcId: string, mood: NPCMood) => {
    setProgress((prev) => ({
      ...prev,
      npcMoods: { ...prev.npcMoods, [npcId]: mood },
    }))
  }, [])

  return {
    progress,
    currentScene,
    availableChoices,
    makeChoice,
    setNPCMood,
  }
}