# app/models/request.py
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# Espelha exatamente o NPCMood do frontend
class NPCMood(str, Enum):
    NEUTRAL = "neutral"
    FRIENDLY = "friendly"
    SUSPICIOUS = "suspicious"
    ANGRY = "angry"
    SCARED = "scared"


class RegionId(str, Enum):
    NORDESTE = "nordeste"
    NORTE = "norte"
    SUDESTE = "sudeste"
    SUL = "sul"
    CENTRO_OESTE = "centro_oeste"


# Uma mensagem anterior na conversa
# O frontend vai acumular o histórico e mandar junto
class ConversationMessage(BaseModel):
    role: str              # "player" ou "npc"
    content: str           # Texto da mensagem
    choice_id: Optional[str] = None  # ID da choice que gerou essa mensagem


# Corpo do request principal
# Espelha o RegionProgress + NPCLine do frontend
class NPCRequest(BaseModel):
    # Identificação
    npc_id: str = Field(..., description="ID do NPC (ex: 'raimundo')")
    region_id: RegionId
    
    # Estado atual
    current_mood: NPCMood = NPCMood.NEUTRAL
    current_line_id: str = Field(..., description="ID da linha atual do diálogo")
    
    # O que o jogador disse/fez
    player_choice_text: str = Field(..., description="Texto da escolha feita pelo jogador")
    
    # Pistas que o jogador já descobriu
    # A IA usa isso para decidir o que o NPC pode revelar
    player_discovered_clues: list[str] = Field(
        default=[],
        description="IDs das pistas já descobertas pelo jogador"
    )
    
    # Histórico da conversa para contexto
    conversation_history: list[ConversationMessage] = Field(
        default=[],
        max_length=20  # Limita para não explodir o context window
    )
    
    # Flag para controle
    is_first_interaction: bool = False


# O que a API retorna
class NPCResponse(BaseModel):
    # Texto gerado pela IA
    generated_text: str
    
    # Humor resultante após a resposta (a IA pode mudar o humor)
    resulting_mood: NPCMood
    
    # Pistas que a IA decidiu revelar nessa resposta
    # O frontend pode adicionar automaticamente ao progress
    revealed_clues: list[str] = []
    
    # Se o NPC está encerrando a conversa
    ends_conversation: bool = False
    
    # Metadados para debug (não mostrar no frontend em produção)
    debug_prompt_used: Optional[str] = None