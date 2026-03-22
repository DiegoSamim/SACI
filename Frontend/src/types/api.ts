// types/api.ts
// Espelha exatamente os modelos Pydantic do backend

export type NPCApiRequest = {
    npc_id: string
    region_id: string
    current_mood: string
    current_line_id: string
    player_choice_text: string
    player_discovered_clues: string[]
    conversation_history: ConversationMessage[]
    is_first_interaction: boolean
}

export type ConversationMessage = {
    role: "player" | "npc"
    content: string
    choice_id?: string | null
}

export type NPCApiResponse = {
    generated_text: string
    resulting_mood: string
    revealed_clues: string[]
    ends_conversation: boolean
}