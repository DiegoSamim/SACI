#Testa o parse da resposta da LLM
# tests/test_llm_service.py
import pytest
from app.services.llm_service import LLMService
from app.models.request import NPCMood


class TestResponseParser:
    """
    Testa o _parse_response sem chamar a API real.
    Simula diferentes formatos de resposta que a LLM pode gerar.
    """

    @pytest.fixture(autouse=True)
    def setup(self):
        self.service = LLMService()

    def test_parse_resposta_completa(self):
        """Deve extrair corretamente todos os campos."""
        raw = (
            "Com medo?! *(Ele bate o pano no balcão)* Pode sair. AGORA!\n"
            "[MOOD:angry] [CLUES:] [ENDS:false]"
        )
        result = self.service._parse_response(raw, NPCMood.SUSPICIOUS)

        assert "Com medo?!" in result.generated_text
        assert "*(Ele bate o pano no balcão)*" in result.generated_text
        assert result.resulting_mood == NPCMood.ANGRY
        assert result.revealed_clues == []
        assert result.ends_conversation == False

    def test_parse_com_pistas_reveladas(self):
        """Deve extrair pistas quando a LLM as inclui."""
        raw = (
            "*(Abaixa a voz)* Meu avô dizia que ela age à noite e imita voz. "
            "Você já sentiu aquele cheiro?\n"
            "[MOOD:scared] [CLUES:cabra_noite,cabra_voz] [ENDS:false]"
        )
        result = self.service._parse_response(raw, NPCMood.NEUTRAL)

        assert result.resulting_mood == NPCMood.SCARED
        assert "cabra_noite" in result.revealed_clues
        assert "cabra_voz" in result.revealed_clues
        assert len(result.revealed_clues) == 2

    def test_parse_ends_conversation_true(self):
        """Deve detectar quando a conversa encerra."""
        raw = (
            "*(Fecha a janela com força)* Vai simbora!\n"
            "[MOOD:angry] [CLUES:] [ENDS:true]"
        )
        result = self.service._parse_response(raw, NPCMood.SUSPICIOUS)

        assert result.ends_conversation == True
        assert "*(Fecha a janela com força)*" in result.generated_text

    def test_parse_sem_metadata_usa_mood_atual(self):
        """Se a LLM não incluir metadados, mantém o humor atual."""
        raw = "Tá bom. Que é que ocê quer saber?"  # Sem [MOOD:...] etc
        result = self.service._parse_response(raw, NPCMood.SUSPICIOUS)

        assert result.resulting_mood == NPCMood.SUSPICIOUS  # Manteve
        assert result.revealed_clues == []
        assert result.ends_conversation == False

    def test_parse_metadata_nao_aparece_no_texto(self):
        """Os marcadores [MOOD:...] não devem aparecer no texto final."""
        raw = (
            "Bar tá fechado.\n"
            "[MOOD:suspicious] [CLUES:cabra_cheiro] [ENDS:false]"
        )
        result = self.service._parse_response(raw, NPCMood.NEUTRAL)

        assert "[MOOD:" not in result.generated_text
        assert "[CLUES:" not in result.generated_text
        assert "[ENDS:" not in result.generated_text

    def test_parse_mood_invalido_mantém_atual(self):
        """Se a LLM gerar um mood inválido, mantém o atual."""
        raw = "Resposta qualquer.\n[MOOD:superbravo] [CLUES:] [ENDS:false]"
        result = self.service._parse_response(raw, NPCMood.NEUTRAL)

        assert result.resulting_mood == NPCMood.NEUTRAL  # Manteve o original

    def test_parse_pistas_com_espacos_extras(self):
        """Deve lidar com espaços extras nas pistas."""
        raw = "Texto.\n[MOOD:neutral] [CLUES: cabra_noite , cabra_cheiro ] [ENDS:false]"
        result = self.service._parse_response(raw, NPCMood.NEUTRAL)

        assert "cabra_noite" in result.revealed_clues
        assert "cabra_cheiro" in result.revealed_clues

    def test_parse_resposta_multilinhas(self):
        """Deve funcionar com respostas de múltiplas linhas."""
        raw = (
            "*(Ele para de esfregar o balcão)*\n"
            "Três crianças em dez dias.\n"
            "Prefeitura diz que fugiram. Mentira.\n"
            "[MOOD:neutral] [CLUES:] [ENDS:false]"
        )
        result = self.service._parse_response(raw, NPCMood.SUSPICIOUS)

        assert "Três crianças" in result.generated_text
        assert "Prefeitura" in result.generated_text
        assert result.resulting_mood == NPCMood.NEUTRAL

    def test_parse_texto_limpo_sem_espacos_extras(self):
        """O texto final não deve ter espaços ou quebras de linha sobrando."""
        raw = "  Texto com espaços.  \n[MOOD:neutral] [CLUES:] [ENDS:false]  "
        result = self.service._parse_response(raw, NPCMood.NEUTRAL)

        assert result.generated_text == result.generated_text.strip()