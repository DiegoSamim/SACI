# tests/test_models.py
# Testa os modelos Pydantic

import pytest
from pydantic import ValidationError
from app.models.request import NPCRequest, NPCMood, RegionId, ConversationMessage


class TestNPCRequestValidation:
    """Testa se o Pydantic valida corretamente os dados de entrada."""

    def test_request_valido_minimo(self):
        """Deve aceitar um request com apenas os campos obrigatórios."""
        # Cenário base de sucesso: garante que o modelo aceita payload mínimo.
        request = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.SUSPICIOUS,
            current_line_id="r1",
            player_choice_text="Não vim beber.",
        )
        assert request.npc_id == "raimundo"
        assert request.player_discovered_clues == []
        assert request.conversation_history == []
        assert request.is_first_interaction == False

    def test_request_sem_campo_obrigatorio(self):
        """Deve rejeitar request sem npc_id."""
        # Valida obrigatoriedade de campo essencial para rotear o NPC.
        with pytest.raises(ValidationError) as exc_info:
            NPCRequest(
                # npc_id ausente
                region_id=RegionId.NORDESTE,
                current_mood=NPCMood.NEUTRAL,
                current_line_id="r1",
                player_choice_text="teste",
            )
        errors = exc_info.value.errors()
        assert any(e["loc"] == ("npc_id",) for e in errors)

    def test_mood_invalido(self):
        """Deve rejeitar um humor que não existe no Enum."""
        # Garante consistência de estado: só aceita moods definidos no Enum.
        with pytest.raises(ValidationError) as exc_info:
            NPCRequest(
                npc_id="raimundo",
                region_id=RegionId.NORDESTE,
                current_mood="raivoso",  # Não existe no NPCMood
                current_line_id="r1",
                player_choice_text="teste",
            )
        errors = exc_info.value.errors()
        assert any("current_mood" in str(e["loc"]) for e in errors)

    def test_todos_moods_validos(self):
        """Todos os valores do Enum devem ser aceitos."""
        # Verifica cobertura completa do Enum para evitar regressão ao adicionar/remover moods.
        for mood in NPCMood:
            request = NPCRequest(
                npc_id="raimundo",
                region_id=RegionId.NORDESTE,
                current_mood=mood,
                current_line_id="r1",
                player_choice_text="teste",
            )
            assert request.current_mood == mood

    def test_todos_region_ids_validos(self):
        """Todas as regiões devem ser aceitas."""
        # Confirma que qualquer região suportada pelo jogo passa na validação.
        for region in RegionId:
            request = NPCRequest(
                npc_id="raimundo",
                region_id=region,
                current_mood=NPCMood.NEUTRAL,
                current_line_id="r1",
                player_choice_text="teste",
            )
            assert request.region_id == region

    def test_historico_com_mensagens(self):
        """Deve aceitar histórico de conversa preenchido."""
        # Garante que histórico serializa corretamente objetos ConversationMessage.
        request = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.NEUTRAL,
            current_line_id="r2",
            player_choice_text="Me ajude.",
            conversation_history=[
                ConversationMessage(role="player", content="Olá", choice_id="r1_insistir"),
                ConversationMessage(role="npc", content="Bar fechado."),
            ]
        )
        assert len(request.conversation_history) == 2
        assert request.conversation_history[0].role == "player"

    def test_pistas_devem_ser_lista_de_strings(self):
        """player_discovered_clues deve ser lista de strings."""
        # Evita formatos inconsistentes de pistas que quebrariam a lógica de prompt.
        request = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.NEUTRAL,
            current_line_id="r1",
            player_choice_text="teste",
            player_discovered_clues=["cabra_cheiro", "cabra_noite"],
        )
        assert "cabra_cheiro" in request.player_discovered_clues
        assert len(request.player_discovered_clues) == 2

    def test_choice_text_nao_pode_ser_vazio(self):
        """Texto da escolha não pode ser string vazia."""
        # Reforça regra de negócio: escolha vazia não deve ser aceita pelo modelo.
        # Dependendo da sua regra de negócio, você pode querer validar isso
        # Se não tiver validação ainda, esse teste vai falhar e te lembrar de adicionar
        with pytest.raises(ValidationError):
            NPCRequest(
                npc_id="raimundo",
                region_id=RegionId.NORDESTE,
                current_mood=NPCMood.NEUTRAL,
                current_line_id="r1",
                player_choice_text="",  # Vazio
            )