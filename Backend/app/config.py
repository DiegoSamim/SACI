# app/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Pydantic Settings lê automaticamente do arquivo .env
    e valida os tipos. Se GROQ_API_KEY não existir, a app
    não sobe — melhor do que um erro silencioso em produção.
    """
    GROQ_API_KEY: str
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"


# Instância singleton — importada em todos os módulos
settings = Settings()