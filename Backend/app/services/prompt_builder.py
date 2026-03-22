# app/services/prompt_builder.py
from app.models.request import NPCRequest, NPCMood
from app.data.npcs import NPC_PROFILES
from app.data.creatures import CREATURE_DATA


class PromptBuilder:

    def build(self, request: NPCRequest) -> tuple[str, str]:
        npc = NPC_PROFILES.get(request.npc_id)
        if not npc:
            raise ValueError(f"NPC '{request.npc_id}' não encontrado.")

        creature = CREATURE_DATA.get(request.region_id.value)
        system_prompt = self._build_system_prompt(npc, creature, request)
        user_prompt = self._build_user_prompt(npc, request)
        return system_prompt, user_prompt

    def _build_system_prompt(
        self, npc: dict, creature: dict, request: NPCRequest
    ) -> str:
        available_knowledge = self._get_available_knowledge(npc, request)
        mood_instruction = npc["mood_behavior"].get(
            request.current_mood.value, "Responde normalmente."
        )

        # Pistas que ESTE NPC pode revelar
        allowed_clues = self._get_allowed_clues_for_npc(
            request.npc_id, creature
        )

        # Pistas que este NPC NUNCA pode revelar (pertencentes a outros)
        forbidden_clues = self._get_forbidden_clues_for_npc(
            request.npc_id, creature
        )

        return f"""
Você é {npc['name']}, {npc['role']}.
Você está em uma história interativa ambientada no interior do Nordeste brasileiro.

=== SUA PERSONALIDADE ===
{npc['personality'].strip()}

=== SEU HUMOR ATUAL: {request.current_mood.value.upper()} ===
{mood_instruction}

=== O QUE VOCÊ SABE E PODE COMPARTILHAR ===
{self._format_knowledge(available_knowledge)}

=== O QUE VOCÊ NUNCA SABE E NUNCA DEVE MENCIONAR ===
{chr(10).join(f'- {k}' for k in npc['knowledge']['never_knows'])}

=== SOBRE A SITUAÇÃO NA CIDADE ===
{self._format_creature_context(creature, request.player_discovered_clues)}

=== PISTAS QUE VOCÊ PODE REVELAR ===
Você SOMENTE pode declarar pistas com estes IDs em [CLUES:]:
{self._format_allowed_clues(allowed_clues)}

=== PISTAS QUE VOCÊ NUNCA PODE REVELAR ===
Estas pistas pertencem a outros personagens ou situações.
Você não tem esse conhecimento — nunca as mencione nem as coloque em [CLUES:]:
{self._format_forbidden_clues(forbidden_clues)}

=== REGRAS ABSOLUTAS ===

REGRA 1 — AÇÕES EM 3ª PESSOA:
Ações entre asteriscos SEMPRE em 3ª pessoa.
✅ *(Ele bate o pano no balcão)*
❌ *(Eu bato o pano no balcão)*

REGRA 2 — QUANDO REVELAR UMA PISTA:
Uma pista SÓ vai em [CLUES:] se TODAS as condições forem verdadeiras:
  a) O ID está na lista "PISTAS QUE VOCÊ PODE REVELAR" acima
  b) Você mencionou o conteúdo LITERALMENTE no texto desta fala
  c) Não está na lista "PISTAS QUE VOCÊ NUNCA PODE REVELAR"

Exemplos para as pistas que você pode revelar:
{self._format_clue_examples(allowed_clues)}

Em caso de dúvida: deixe [CLUES:] vazio.

REGRA 3 — HUMOR:
Respeite EXATAMENTE o comportamento descrito para {request.current_mood.value.upper()}.
ANGRY = explosivo e curto. Não medroso.
SCARED = baixo e trêmulo. Não agressivo.

REGRA 4 — FORMATO OBRIGATÓRIO:
Última linha SEMPRE:
[MOOD:valor] [CLUES:id1,id2] [ENDS:true_ou_false]

REGRA 5 — TAMANHO:
Máximo 3 frases + 1 ação. Sem monólogos.
""".strip()

    def _get_allowed_clues_for_npc(
        self, npc_id: str, creature: dict
    ) -> dict[str, dict]:
        """
        Retorna apenas as pistas que este NPC específico pode revelar.
        Regra: exclusive_to_npc é None (qualquer um) OU contém este npc_id.
        """
        if not creature:
            return {}

        allowed = {}
        for clue_id, clue_data in creature["clues_mapping"].items():
            exclusive = clue_data.get("exclusive_to_npc")
            if exclusive is None or npc_id in exclusive:
                allowed[clue_id] = clue_data

        return allowed

    def _get_forbidden_clues_for_npc(
        self, npc_id: str, creature: dict
    ) -> dict[str, dict]:
        """
        Retorna as pistas que este NPC NÃO pode revelar.
        Regra: exclusive_to_npc existe E não contém este npc_id.
        """
        if not creature:
            return {}

        forbidden = {}
        for clue_id, clue_data in creature["clues_mapping"].items():
            exclusive = clue_data.get("exclusive_to_npc")
            if exclusive is not None and npc_id not in exclusive:
                forbidden[clue_id] = clue_data

        return forbidden

    def _format_allowed_clues(self, allowed_clues: dict) -> str:
        if not allowed_clues:
            return "  Nenhuma pista disponível para você revelar."

        lines = []
        for clue_id, clue_data in allowed_clues.items():
            lines.append(f"  - {clue_id}: {clue_data['description']}")
        return "\n".join(lines)

    def _format_forbidden_clues(self, forbidden_clues: dict) -> str:
        if not forbidden_clues:
            return "  Nenhuma restrição adicional."

        lines = []
        for clue_id, clue_data in forbidden_clues.items():
            lines.append(f"  - {clue_id} ({clue_data['description']})")
        return "\n".join(lines)

    def _format_clue_examples(self, allowed_clues: dict) -> str:
        """
        Gera exemplos de quando revelar cada pista permitida.
        """
        examples = {
            "cabra_noite": (
                'cabra_noite → só se disser explicitamente "ela age à noite" '
                'ou "de dia não acontece nada"'
            ),
            "cabra_criancas": (
                'cabra_criancas → só se disser explicitamente "pega crianças" '
                'ou "vai atrás de menino"'
            ),
            "cabra_criancas_mal_educadas": (
                'cabra_criancas_mal_educadas → só se disser explicitamente '
                '"escolhe crianças malcriadas" ou "desobedientes"'
            ),
            "cabra_cheiro": (
                'cabra_cheiro → só se disser explicitamente "aquele cheiro é dela" '
                'ou "o fedor avisa que está perto"'
            ),
            "cabra_voz": (
                'cabra_voz → só se disser explicitamente "ela imita voz de gente conhecida" '
                'ou "faz a voz da mãe"'
            ),
            "cabra_reza": (
                'cabra_reza → só se disser explicitamente "reza afasta ela" '
                'ou "tem uma oração de proteção"'
            ),
            "cabra_rastros": (
                'cabra_rastros → só se disser explicitamente "encontrei rastros' 
                ' estranhos" ou "pegadas de casco"'
            ),
            "cabra_nome": (
                'cabra_nome → só se disser explicitamente o nome "Cabra Cabriola"'
            ),
            "cabra_amigo_sumiu": (
                'cabra_amigo_sumiu → só se disser explicitamente que '
                '"Pedro sumiu" ou "meu amigo desapareceu"'
            ),
        }

        lines = []
        for clue_id in allowed_clues:
            if clue_id in examples:
                lines.append(f"  {examples[clue_id]}")

        return "\n".join(lines) if lines else "  Siga o critério da REGRA 2."

    def _build_user_prompt(self, npc: dict, request: NPCRequest) -> str:
        history_text = ""
        if request.conversation_history:
            history_lines = []
            for msg in request.conversation_history[-8:]:
                prefix = "Jogador" if msg.role == "player" else npc["name"]
                history_lines.append(f"{prefix}: {msg.content}")
            history_text = "\n".join(history_lines)

        relevant_clues = self._get_relevant_clues_text(npc, request.player_discovered_clues)

        return f"""
=== CONTEXTO ATUAL ===
{"Primeira vez que este jogador fala com você." if request.is_first_interaction else "Você já falou com este jogador antes."}

Pistas que o jogador já coletou: {relevant_clues if relevant_clues else "Nenhuma ainda."}

=== HISTÓRICO DESTA CONVERSA ===
{history_text if history_text else "Início da conversa."}

=== AÇÃO ATUAL DO JOGADOR ===
O jogador disse: "{request.player_choice_text}"

Responda como {npc['name']} (humor: {request.current_mood.value}).
Ações em 3ª pessoa. Termine com [MOOD:...] [CLUES:...] [ENDS:...].
""".strip()

    def _get_available_knowledge(self, npc: dict, request: NPCRequest) -> dict:
        knowledge = npc["knowledge"]
        available = {
            "always": knowledge["always_shares"],
            "with_trust": [],
            "with_clues": [],
        }
        if request.current_mood in [NPCMood.FRIENDLY, NPCMood.SCARED]:
            available["with_trust"] = knowledge["shares_with_trust"]

        for clue_id, info in knowledge["shares_with_clues"].items():
            if clue_id in request.player_discovered_clues:
                available["with_clues"].append(info)

        return available

    def _format_knowledge(self, available_knowledge: dict) -> str:
        lines = []
        if available_knowledge["always"]:
            lines.append("Sempre pode compartilhar:")
            for item in available_knowledge["always"]:
                lines.append(f"  - {item}")
        if available_knowledge["with_trust"]:
            lines.append("\nCom confiança ou medo, pode revelar:")
            for item in available_knowledge["with_trust"]:
                lines.append(f"  - {item}")
        if available_knowledge["with_clues"]:
            lines.append("\nO jogador tem pistas — você pode confirmar:")
            for item in available_knowledge["with_clues"]:
                lines.append(f"  - {item}")
        return "\n".join(lines)

    def _format_creature_context(
        self, creature: dict, player_clues: list[str]
    ) -> str:
        if not creature:
            return "Você sabe pouco sobre a criatura."

        discovered_facts = []
        for clue_id in player_clues:
            clue_data = creature["clues_mapping"].get(clue_id)
            if clue_data:
                discovered_facts.append(clue_data["description"])

        context = "Uma criatura misteriosa está na região.\n"
        if discovered_facts:
            context += "Fatos que o jogador já descobriu (pode confirmar):\n"
            context += "\n".join(f"  - {f}" for f in discovered_facts)
        else:
            context += "O jogador ainda não descobriu nada sobre a criatura."
        return context

    def _get_relevant_clues_text(
        self, npc: dict, player_clues: list[str]
    ) -> str:
        relevant = [
            c for c in player_clues
            if c in npc["knowledge"].get("shares_with_clues", {})
        ]
        return ", ".join(relevant) if relevant else ""