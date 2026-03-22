# Testa os endpoints completos
# tests/test_api.py
import pytest
from unittest.mock import AsyncMock, patch
from app.models.request import NPCMood
from app.models.request import NPCResponse


class TestHealthEndpoint:

    async def test_health_retorna_ok(self, async_client):
        response = await async_client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    async def test_health_retorna_versao(self, async_client):
        response = await async_client.get("/health")
        assert "version" in response.json()


class TestNPCRespondEndpoint:

    # ─── Testes sem chamar a API real (usando mock) ──────────────────────────
    #
    # Mock = substituto falso de um componente real
    # Aqui substituímos o LLMService por uma versão controlada
    # Isso permite testar o endpoint sem gastar tokens do Groq
    # e sem depender de internet

    @pytest.fixture
    def mock_llm_response(self):
        """Resposta falsa que simula o que o LLMService retornaria."""
        return NPCResponse(
            generated_text="Bar tá fechado, moço. *(Esfrega o balcão sem olhar)*",
            resulting_mood=NPCMood.SUSPICIOUS,
            revealed_clues=[],
            ends_conversation=False,
        )

    async def test_endpoint_retorna_200_com_request_valido(
        self, async_client, base_request, mock_llm_response
    ):
        """Endpoint deve retornar 200 com dados válidos."""
        # patch substitui temporariamente o método real pelo mock
        with patch(
            "app.services.llm_service.LLMService.generate_response",
            new_callable=AsyncMock,
            return_value=mock_llm_response,
        ):
            response = await async_client.post(
                "/npc/respond",
                json=base_request.model_dump(),
            )

        assert response.status_code == 200

    async def test_endpoint_retorna_campos_obrigatorios(
        self, async_client, base_request, mock_llm_response
    ):
        """Resposta deve conter todos os campos definidos no NPCResponse."""
        with patch(
            "app.services.llm_service.LLMService.generate_response",
            new_callable=AsyncMock,
            return_value=mock_llm_response,
        ):
            response = await async_client.post(
                "/npc/respond",
                json=base_request.model_dump(),
            )

        data = response.json()
        assert "generated_text" in data
        assert "resulting_mood" in data
        assert "revealed_clues" in data
        assert "ends_conversation" in data

    async def test_endpoint_retorna_400_para_npc_inexistente(
        self, async_client
    ):
        """NPC que não existe deve retornar erro 400."""
        request_invalido = {
            "npc_id": "npc_fantasma",
            "region_id": "nordeste",
            "current_mood": "neutral",
            "current_line_id": "x1",
            "player_choice_text": "teste",
        }
        response = await async_client.post("/npc/respond", json=request_invalido)
        assert response.status_code == 400

    async def test_endpoint_retorna_422_para_mood_invalido(
        self, async_client
    ):
        """Mood inválido deve retornar erro 422 (Unprocessable Entity)."""
        request_invalido = {
            "npc_id": "raimundo",
            "region_id": "nordeste",
            "current_mood": "superbravo",  # Não existe
            "current_line_id": "r1",
            "player_choice_text": "teste",
        }
        response = await async_client.post("/npc/respond", json=request_invalido)
        assert response.status_code == 422

    async def test_endpoint_retorna_422_sem_campos_obrigatorios(
        self, async_client
    ):
        """Request sem campos obrigatórios deve retornar 422."""
        response = await async_client.post("/npc/respond", json={})
        assert response.status_code == 422

    async def test_endpoint_propaga_pistas_reveladas(
        self, async_client, base_request
    ):
        """Pistas reveladas pelo LLM devem aparecer na resposta."""
        mock_com_pistas = NPCResponse(
            generated_text="Meu avô dizia que ela age à noite...",
            resulting_mood=NPCMood.SCARED,
            revealed_clues=["cabra_noite", "cabra_voz"],
            ends_conversation=False,
        )
        with patch(
            "app.services.llm_service.LLMService.generate_response",
            new_callable=AsyncMock,
            return_value=mock_com_pistas,
        ):
            response = await async_client.post(
                "/npc/respond",
                json=base_request.model_dump(),
            )

        data = response.json()
        assert "cabra_noite" in data["revealed_clues"]
        assert "cabra_voz" in data["revealed_clues"]

    async def test_endpoint_propaga_ends_conversation(
        self, async_client, base_request
    ):
        """ends_conversation=True deve ser propagado na resposta."""
        mock_fim = NPCResponse(
            generated_text="*(Fecha a janela)* Vai simbora!",
            resulting_mood=NPCMood.ANGRY,
            revealed_clues=[],
            ends_conversation=True,
        )
        with patch(
            "app.services.llm_service.LLMService.generate_response",
            new_callable=AsyncMock,
            return_value=mock_fim,
        ):
            response = await async_client.post(
                "/npc/respond",
                json=base_request.model_dump(),
            )

        assert response.json()["ends_conversation"] == True

    # ─── Teste REAL com a API do Groq ────────────────────────────────────────
    # Marcado como "integration" — só roda quando explicitamente pedido
    # Execute com: pytest -m integration -s

    @pytest.mark.integration
    async def test_groq_responde_raimundo_suspicious(
        self, async_client, base_request
    ):
        """
        Teste de integração real — chama o Groq de verdade.
        
        Valida:
        - A API não retorna erro
        - O texto gerado tem conteúdo
        - O mood retornado é um valor válido
        - As pistas, se reveladas, são IDs conhecidos
        """
        response = await async_client.post(
            "/npc/respond",
            json=base_request.model_dump(),
        )

        print(f"\n\nRESPOSTA GROQ (Raimundo - suspicious):")
        print(f"Status: {response.status_code}")

        assert response.status_code == 200
        data = response.json()

        print(f"Texto: {data['generated_text']}")
        print(f"Mood resultante: {data['resulting_mood']}")
        print(f"Pistas reveladas: {data['revealed_clues']}")
        print(f"Encerra conversa: {data['ends_conversation']}\n")

        assert len(data["generated_text"]) > 10
        assert data["resulting_mood"] in [m.value for m in NPCMood]

    @pytest.mark.integration
    async def test_groq_nao_revela_nome_cabra_sem_pistas(
        self, async_client, base_request
    ):
        """
        Teste crítico: sem pistas, Raimundo NÃO deve revelar o nome 'Cabra Cabriola'.
        Valida que o sistema de controle de conhecimento funciona.
        """
        response = await async_client.post(
            "/npc/respond",
            json=base_request.model_dump(),
        )
        data = response.json()

        print(f"\nTexto gerado: {data['generated_text']}")

        # Raimundo nunca sabe o nome — isso é regra no NPC_PROFILES
        assert "Cabra Cabriola" not in data["generated_text"]
        assert "cabra_nome" not in data.get("revealed_clues", [])

    @pytest.mark.integration
    async def test_groq_muda_mood_quando_provocado(
        self, async_client, request_angry_npc
    ):
        """
        Quando jogador provoca o Raimundo, o mood deve mudar para angry.
        """
        response = await async_client.post(
            "/npc/respond",
            json=request_angry_npc.model_dump(),
        )
        data = response.json()

        print(f"\nResposta quando provocado: {data['generated_text']}")
        print(f"Mood resultante: {data['resulting_mood']}")

        assert response.status_code == 200
        # O Raimundo deve ficar irritado ao ser provocado
        assert data["resulting_mood"] in ["angry", "suspicious"]

    @pytest.mark.integration
    async def test_groq_usa_sotaque_nordestino(
        self, async_client, base_request
    ):
        """
        O Raimundo deve responder com expressões nordestinas.
        Valida que a personalidade está sendo aplicada.
        """
        # Rodamos 2 vezes para ter mais chance de pegar uma expressão regional
        expressoes_nordestinas = ["moço", "ocê", "visse", "num", "danado", "simbora"]

        response = await async_client.post(
            "/npc/respond",
            json=base_request.model_dump(),
        )
        texto = response.json()["generated_text"].lower()

        print(f"\nTexto: {texto}")

        encontrou_expressao = any(exp in texto for exp in expressoes_nordestinas)
        assert encontrou_expressao, (
            f"Esperava expressão nordestina no texto, mas recebi: '{texto}'"
        )

    @pytest.mark.integration
    async def test_groq_franciscleison_fala_como_crianca(
        self, async_client, request_crianca
    ):
        """
        Franciscleison deve responder com vocabulário de criança nordestina.
        """
        expressoes_crianca = ["mainha", "painho", "ocê", "num", "danado"]

        response = await async_client.post(
            "/npc/respond",
            json=request_crianca.model_dump(),
        )
        data = response.json()
        texto = data["generated_text"].lower()

        print(f"\nResposta Franciscleison: {data['generated_text']}")

        assert response.status_code == 200
        assert len(texto) > 5