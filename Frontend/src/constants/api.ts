
export const API_CONFIG = {
    // Desenvolvimento: Use IP local ou URL do ngrok (definida em .env)
    // Produção: Use URL da API em produção
    BASE_URL: __DEV__
        ? (process.env.EXPO_PUBLIC_API_BASE_URL)
        : "https://sua-api-producao.com",
    TIMEOUT_MS: 15000,  // 15 segundos — tempo suficiente para LLM gerar resposta
}