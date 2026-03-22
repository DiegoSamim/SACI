# app/services/llm_service.py
import re
from groq import AsyncGroq
from app.models.request import NPCMood, NPCResponse
from app.data.creatures import CREATURE_DATA
from app.config import settings


class LLMService:

    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"

    async def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        current_mood: NPCMood,
        npc_id: str,
        region_id: str,
    ) -> NPCResponse:
        try:
            completion = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=300,
            )
            raw = completion.choices[0].message.content
            return self._parse_response(raw, current_mood, npc_id, region_id)

        except Exception as e:
            print(f"[LLM ERROR] {e}")
            return NPCResponse(
                generated_text="*(Ele olha para você sem dizer nada)*",
                resulting_mood=current_mood,
                revealed_clues=[],
                ends_conversation=False,
            )

    def _parse_response(
        self,
        raw: str,
        current_mood: NPCMood,
        npc_id: str,
        region_id: str,
    ) -> NPCResponse:

        mood_match  = re.search(r'\[MOOD:(\w+)\]', raw)
        clues_match = re.search(r'\[CLUES:([^\]]*)\]', raw)
        ends_match  = re.search(r'\[ENDS:(true|false)\]', raw)

        clean_text = re.sub(
            r'\[MOOD:[^\]]+\]|\[CLUES:[^\]]+\]|\[ENDS:[^\]]+\]', '', raw
        ).strip()

        # Humor
        resulting_mood = current_mood
        if mood_match:
            try:
                resulting_mood = NPCMood(mood_match.group(1).lower())
            except ValueError:
                pass

        # Pistas declaradas pela LLM
        declared_clues = []
        if clues_match:
            raw_clues = clues_match.group(1).strip()
            if raw_clues:
                declared_clues = [
                    c.strip() for c in raw_clues.split(',') if c.strip()
                ]

        # Validação dupla:
        # 1) NPC tem permissão para revelar esta pista?
        # 2) O texto contém evidência textual da pista?
        validated_clues = self._validate_clues(
            declared_clues, clean_text, npc_id, region_id
        )

        removed = set(declared_clues) - set(validated_clues)
        if removed:
            print(f"[CLUE VALIDATOR] NPC '{npc_id}' — pistas bloqueadas: {removed}")

        ends_conversation = False
        if ends_match:
            ends_conversation = ends_match.group(1).lower() == 'true'

        return NPCResponse(
            generated_text=clean_text,
            resulting_mood=resulting_mood,
            revealed_clues=validated_clues,
            ends_conversation=ends_conversation,
        )

    def _validate_clues(
        self,
        declared_clues: list[str],
        text: str,
        npc_id: str,
        region_id: str,
    ) -> list[str]:
        """
        Valida cada pista declarada com dois critérios independentes.
        Uma pista só passa se AMBOS forem verdadeiros.
        """
        creature = CREATURE_DATA.get(region_id, {})
        clues_mapping = creature.get("clues_mapping", {})
        text_lower = text.lower()
        validated = []

        for clue_id in declared_clues:
            clue_data = clues_mapping.get(clue_id)

            # Pista não existe no mapeamento — bloqueia
            if clue_data is None:
                print(
                    f"[CLUE VALIDATOR] '{clue_id}' não existe no mapeamento "
                    f"de '{region_id}' — bloqueada"
                )
                continue

            # Critério 1: NPC tem permissão?
            exclusive = clue_data.get("exclusive_to_npc")
            if exclusive is not None and npc_id not in exclusive:
                print(
                    f"[CLUE VALIDATOR] '{clue_id}' pertence a {exclusive} "
                    f"— NPC '{npc_id}' não tem permissão"
                )
                continue

            # Critério 2: texto contém evidência?
            keywords = clue_data.get("keywords", [])
            if keywords:
                found = any(kw in text_lower for kw in keywords)
                if not found:
                    print(
                        f"[CLUE VALIDATOR] '{clue_id}' declarada mas sem "
                        f"evidência textual — bloqueada"
                    )
                    continue

            validated.append(clue_id)

        return validated