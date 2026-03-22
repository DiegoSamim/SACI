# tests/conftest.py
# Configurações compartilhadas entre todos os testes

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.request import (
    NPCRequest,
    NPCMood,
    RegionId,
    ConversationMessage
)


# fixture = recurso reutilizável entre testes
# O pytest injeta automaticamente onde for necessário

@pytest.fixture
def base_request():
    """Request mínimo válido — usado como base para variar nos testes."""
    return NPCRequest(
        npc_id="raimundo",
        region_id=RegionId.NORDESTE,
        current_mood=NPCMood.SUSPICIOUS,
        current_line_id="r1",
        player_choice_text="Não vim beber. Vim perguntar sobre os desaparecimentos.",
        player_discovered_clues=[],
        conversation_history=[],
        is_first_interaction=True,
    )


@pytest.fixture
def request_with_clues():
    """Request com pistas já descobertas."""
    return NPCRequest(
        npc_id="raimundo",
        region_id=RegionId.NORDESTE,
        current_mood=NPCMood.FRIENDLY,
        current_line_id="r3",
        player_choice_text="Sim. Desde que cheguei sinto aquele cheiro.",
        player_discovered_clues=["cabra_cheiro", "cabra_noite"],
        conversation_history=[
            ConversationMessage(role="player", content="Não vim beber.", choice_id="r1_insistir"),
            ConversationMessage(role="npc", content="Bar tá fechado, moço."),
            ConversationMessage(role="player", content="Preciso de informação.", choice_id="r2_prometer"),
            ConversationMessage(role="npc", content="Meu avô contava sobre uma coisa..."),
        ],
        is_first_interaction=False,
    )


@pytest.fixture
def request_crianca():
    """Request para o NPC Franciscleison."""
    return NPCRequest(
        npc_id="franciscleison",
        region_id=RegionId.NORDESTE,
        current_mood=NPCMood.SCARED,
        current_line_id="j3",
        player_choice_text="Uma voz que imitava a mãe dele... você já ouviu falar disso?",
        player_discovered_clues=["cabra_voz", "cabra_cheiro"],
        conversation_history=[
            ConversationMessage(role="player", content="Pode ficar onde está.", choice_id="j1_gentil"),
            ConversationMessage(role="npc", content="Ocê num é daqui não..."),
            ConversationMessage(role="player", content="Pedro é seu amigo que sumiu?", choice_id="j2_pedro"),
            ConversationMessage(role="npc", content="...sumiu faz três dias."),
        ],
        is_first_interaction=False,
    )


@pytest.fixture
def request_angry_npc():
    """Request que deve deixar o NPC irritado."""
    return NPCRequest(
        npc_id="raimundo",
        region_id=RegionId.NORDESTE,
        current_mood=NPCMood.SUSPICIOUS,
        current_line_id="r2_desconfiado",
        player_choice_text="Você está com medo de falar?",
        player_discovered_clues=[],
        conversation_history=[
            ConversationMessage(role="player", content="Não vim beber.", choice_id="r1_insistir"),
            ConversationMessage(role="npc", content="Desaparecimento... prefeitura diz que é fuga."),
        ],
        is_first_interaction=False,
    )


@pytest.fixture
async def async_client():
    """Cliente HTTP assíncrono para testar os endpoints."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        yield client