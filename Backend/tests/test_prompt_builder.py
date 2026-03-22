# Testa a construção dos prompts
# tests/test_prompt_builder.py
import pytest
import re
from app.services.prompt_builder import PromptBuilder
from app.models.request import NPCMood, RegionId, NPCRequest, ConversationMessage


class TestPromptBuilder:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.builder = PromptBuilder()

    def test_retorna_dois_prompts(self, base_request):
        """build() deve retornar uma tupla (system, user)."""
        system, user = self.builder.build(base_request)
        assert isinstance(system, str)
        assert isinstance(user, str)
        assert len(system) > 0
        assert len(user) > 0

    def test_system_prompt_contem_nome_npc(self, base_request):
        """System prompt deve identificar o NPC pelo nome."""
        system, _ = self.builder.build(base_request)
        assert "Seu Raimundo" in system

    def test_system_prompt_contem_papel_npc(self, base_request):
        """System prompt deve incluir o papel/função do NPC."""
        system, _ = self.builder.build(base_request)
        assert "Dono do Bar" in system

    def test_system_prompt_contem_mood_atual(self, base_request):
        """System prompt deve incluir o humor atual em maiúsculas."""
        system, _ = self.builder.build(base_request)
        assert "SUSPICIOUS" in system.upper()

    def test_system_prompt_contem_regras_de_resposta(self, base_request):
        """System prompt deve conter as regras de formato de resposta."""
        system, _ = self.builder.build(base_request)
        assert "[MOOD:" in system
        assert "[CLUES:" in system
        assert "[ENDS:" in system

    def test_system_prompt_contem_o_que_npc_nunca_sabe(self, base_request):
        """System prompt deve listar o que o NPC não sabe."""
        system, _ = self.builder.build(base_request)
        # Raimundo nunca sabe o nome da criatura
        assert "Cabra Cabriola" in system or "nome da criatura" in system.lower()

    def test_user_prompt_contem_escolha_do_jogador(self, base_request):
        """User prompt deve incluir o texto da escolha do jogador."""
        _, user = self.builder.build(base_request)
        assert base_request.player_choice_text in user

    def test_user_prompt_sem_historico_indica_inicio(self, base_request):
        """Quando não há histórico, user prompt deve indicar início de conversa."""
        _, user = self.builder.build(base_request)
        assert "início" in user.lower() or "primeira" in user.lower() or "first" in user.lower()

    def test_user_prompt_com_historico_inclui_mensagens(self, request_with_clues):
        """User prompt deve incluir mensagens do histórico."""
        _, user = self.builder.build(request_with_clues)
        # Deve conter pelo menos uma mensagem do histórico
        assert "Bar tá fechado" in user or "Não vim beber" in user

    def test_historico_limitado_a_8_mensagens(self):
        """Histórico longo deve ser truncado para evitar overflow."""
        historico_longo = [
            ConversationMessage(
                role="player" if i % 2 == 0 else "npc",
                content=f"Mensagem {i}"
            )
            for i in range(20)  # 20 mensagens
        ]
        request = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.NEUTRAL,
            current_line_id="r1",
            player_choice_text="teste",
            conversation_history=historico_longo,
        )
        _, user = self.builder.build(request)
        # As primeiras mensagens (muito antigas) não devem estar no prompt
        # Usa boundary para evitar falso positivo em "Mensagem 12"/"Mensagem 19".
        assert re.search(r"\bMensagem 0\b", user) is None
        assert re.search(r"\bMensagem 1\b", user) is None
        # As últimas mensagens devem estar
        assert "Mensagem 18" in user or "Mensagem 19" in user

    def test_npc_inexistente_levanta_excecao(self):
        """NPC que não existe deve lançar ValueError."""
        request = NPCRequest(
            npc_id="npc_que_nao_existe",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.NEUTRAL,
            current_line_id="x1",
            player_choice_text="teste",
        )
        with pytest.raises(ValueError) as exc_info:
            self.builder.build(request)
        assert "npc_que_nao_existe" in str(exc_info.value)

    def test_sem_pistas_nao_revela_conhecimento_condicional(self, base_request):
        """Sem pistas, o sistema de conhecimento condicional não deve liberar info extra."""
        system, _ = self.builder.build(base_request)
        # Sem a pista cabra_cheiro, não deve confirmar o cheiro especificamente
        # O que ele "sempre compartilha" ainda pode estar lá
        assert "cabra_cheiro" not in system  # ID da pista não deve aparecer diretamente

    def test_com_pista_libera_conhecimento_condicional(self, request_with_clues):
        """Com pistas relevantes, o conhecimento adicional deve ser liberado."""
        # request_with_clues tem cabra_cheiro e cabra_noite
        system, _ = self.builder.build(request_with_clues)
        # Com cabra_cheiro, Raimundo pode confirmar o cheiro
        assert "cheiro" in system.lower()

    def test_mood_angry_aplica_comportamento_correto(self):
        """Humor angry deve incluir instrução de comportamento agressivo."""
        request = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.ANGRY,
            current_line_id="r_irritado",
            player_choice_text="Você está com medo?",
        )
        system, _ = self.builder.build(request)
        assert "ANGRY" in system.upper()

    def test_mood_friendly_libera_shares_with_trust(self):
        """Humor friendly deve liberar o conhecimento de shares_with_trust."""
        request = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.FRIENDLY,
            current_line_id="r4",
            player_choice_text="Como eu faço ela me receber?",
        )
        system, _ = self.builder.build(request)
        # Com friendly, Raimundo pode revelar sobre a reza (shares_with_trust)
        assert "reza" in system.lower()

    def test_prompt_diferentes_npcs_sao_diferentes(self):
        """Prompts para NPCs diferentes devem ser completamente diferentes."""
        req_raimundo = NPCRequest(
            npc_id="raimundo",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.NEUTRAL,
            current_line_id="r1",
            player_choice_text="Olá.",
        )
        req_crianca = NPCRequest(
            npc_id="franciscleison",
            region_id=RegionId.NORDESTE,
            current_mood=NPCMood.NEUTRAL,
            current_line_id="j1",
            player_choice_text="Olá.",
        )
        system_raimundo, _ = self.builder.build(req_raimundo)
        system_crianca, _ = self.builder.build(req_crianca)

        assert system_raimundo != system_crianca
        assert "Seu Raimundo" in system_raimundo
        assert "Franciscleison" in system_crianca

    def test_imprime_prompts_para_inspecao(self, base_request):
        """
        Teste de inspeção manual — roda com pytest -s para ver os prompts.
        Não tem assert — serve para você ler e validar visualmente.
        """
        system, user = self.builder.build(base_request)
        print("\n" + "="*60)
        print("SYSTEM PROMPT:")
        print("="*60)
        print(system)
        print("\n" + "="*60)
        print("USER PROMPT:")
        print("="*60)
        print(user)
        print("="*60)
        # Sempre passa — é só para visualização
        assert True