// services/npcApi.ts
import { API_CONFIG } from "../constants/api"
import { NPCApiRequest, NPCApiResponse } from "../types/api"

export async function fetchNPCResponse(
    data: NPCApiRequest
): Promise<NPCApiResponse> {

    const controller = new AbortController()
    const timeout = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT_MS
    )

    try {
        console.log(`[NPC API] Conectando a ${API_CONFIG.BASE_URL}/npc/respond`)

        const response = await fetch(`${API_CONFIG.BASE_URL}/npc/respond`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "ngrok-skip-browser-warning": "true", },
            body: JSON.stringify(data),
            signal: controller.signal,
        })

        console.log(`[NPC API] Resposta recebida: status ${response.status}`)

        if (!response.ok) {
            const contentType = response.headers.get("content-type") ?? ""
            const errorBody = contentType.includes("application/json")
                ? await response.json().catch(() => ({}))
                : await response.text().catch(() => "")

            const detail = typeof errorBody === "string"
                ? errorBody
                : (errorBody?.detail ?? JSON.stringify(errorBody))

            const errorMsg = `API ${response.status}: ${detail || "Erro desconhecido"}`
            console.error(`[NPC API] ${errorMsg}`)
            throw new Error(errorMsg)
        }

        const responseData = await response.json() as NPCApiResponse
        console.log(`[NPC API] Sucesso`)
        return responseData

    } catch (err) {
        if (err instanceof Error) {
            if (err.name === "AbortError") {
                const timeoutMsg = `Timeout da requisicao (${API_CONFIG.TIMEOUT_MS}ms). Verifique se a API esta ativa em ${API_CONFIG.BASE_URL}`
                console.error(`[NPC API] ${timeoutMsg}`)
                throw new Error(timeoutMsg)
            }

            const isNetworkError =
                err.message.toLowerCase().includes("network") ||
                err.message.toLowerCase().includes("fetch")

            if (isNetworkError) {
                const networkMsg = `Erro de conexao com ${API_CONFIG.BASE_URL}. Verifique API ativa, host 0.0.0.0 e porta 8000 liberada.`
                console.error(`[NPC API] ${networkMsg}`)
                throw new Error(networkMsg)
            }

            console.error(`[NPC API] Erro: ${err.message}`)
            throw err
        }

        const unknownMsg = "Erro desconhecido ao chamar a API"
        console.error(`[NPC API] ${unknownMsg}`, err)
        throw new Error(unknownMsg)

    } finally {
        clearTimeout(timeout)
    }
}