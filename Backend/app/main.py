# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.request import NPCRequest, NPCResponse
from app.services.prompt_builder import PromptBuilder
from app.services.llm_service import LLMService
from app.config import settings


# Cria a aplicação FastAPI
# docs_url="/docs" gera automaticamente documentação Swagger
app = FastAPI(
    title="SACI NPC API",
    description="API para geração de diálogos de NPCs com IA",
    version="1.0.0"
)

# CORS — permite que o React Native acesse a API
# Em produção, substitua "*" pelo domínio real
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Instâncias dos serviços
prompt_builder = PromptBuilder()
llm_service = LLMService()


@app.get("/health")
async def health_check():
    """Endpoint simples para verificar se a API está rodando."""
    return {"status": "ok", "version": "1.0.0"}


@app.post("/npc/respond", response_model=NPCResponse)
async def npc_respond(request: NPCRequest) -> NPCResponse:
    try:
        system_prompt, user_prompt = prompt_builder.build(request)

        response = await llm_service.generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            current_mood=request.current_mood,
            npc_id=request.npc_id,           
            region_id=request.region_id.value, 
        )

        if settings.DEBUG:
            response.debug_prompt_used = (
                f"SYSTEM:\n{system_prompt}\n\nUSER:\n{user_prompt}"
            )

        return response

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao gerar resposta do NPC")