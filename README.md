# 🌪️ SACI

Jogo narrativo interativo sobre o folclore brasileiro em estilo de cordel

## Sobre o Projeto

SACI é um jogo mobile desenvolvido em React Native, inspirado no folclore brasileiro e na estética da literatura de cordel.

A experiência gira em torno de decisões, interpretação e diálogo.. Cada escolha molda a narrativa, criando uma experiência dinâmica e imersiva por todos as regições do Brasil.

O jogador investiga eventos misteriosos, conversa com NPCs e coleta pistas em busca de catalogar todo folclore brasileiro

O grande diferencial do projeto é o uso de IA generativa, permitindo que NPCs reajam de forma contextual às escolhas do jogador.

## Estrutura do Projeto

```text
SACI/
  Backend/        # API Python (FastAPI + Groq) para IA dos NPCs
  Frontend/       # Aplicativo Expo React Native
```

## 🎮 Conceito Central

Cada região do Brasil apresenta uma lenda diferente, onde o jogador:

🧭 Explora cenários narrativos
🗣️ Conversa com NPCs
🔍 Coleta pistas através de diálogo
🧠 Interpreta informações
📖 Desbloqueia a criatura no catálogo

## 🧠 Sistema de Escolhas

O jogo é baseado em uma engine narrativa orientada a decisões:

- Cada escolha altera o fluxo da história
- Algumas opções só aparecem se o jogador tiver pistas específicas
- Algumas opções são bloqueadas após certas interações (`blockConditions`)
- Decisões erradas podem levar a finais ruins
- Decisões corretas revelam a verdade sobre a criatura

## Exploração do Brasil

O jogo é estruturado para que cada historia se passe em alguma região do Brasil, tendo atualmente um folclore para cara região.

🐐 Nordeste 
🌲 Norte 
🔥 Centro-Oeste 
🐎 Sudeste 
🌾 Sul

Futuramente o objetivo é expandir cada região para ter:

- Novas histórias e ramificações
- Novos NPCs com referências à cultura brasileira, como filmes, livros etc.
- Novas mecânicas narrativas
- Novos cenários

## 🎨 Estilo Visual

Inspirado na cultura brasileira:

- Imagens, icones e tipografia em cordel
- Alto contraste (preto e bege)
- Textura de papel envelhecido
- Visual minimalista e simbólico

## 📖 FolcloreDex (Catálogo)

As criaturas são desbloqueadas através da narrativa.

Cada entrada contém:

- Nome e número
- Região e origem cultural
- Habitat e comportamento
- Características
- Curiosidade cultural
- Status de desbloqueio (silhueta bloqueada → card completo)

## 🤖 IA Generativa — Estado Atual

A integração com IA generativa foi implementada e está funcional.

### Stack

- **Backend:** Python + FastAPI
- **LLM:** Llama 3.1 8B via Groq API (gratuito, ~1s de resposta)

### Como funciona

Cada fala de NPC é gerada dinamicamente pelo backend com base em:

- Identidade e personalidade do NPC
- Humor atual (`neutral`, `friendly`, `suspicious`, `angry`, `scared`)
- Histórico da conversa
- Pistas já coletadas pelo jogador
- Contexto da região e da criatura

O backend retorna além do texto gerado:
- `resulting_mood` — novo humor do NPC após a resposta
- `revealed_clues` — pistas reveladas naquela fala
- `ends_conversation` — se o NPC encerrou o diálogo

## 🔧 Correções Pendentes — IA

### 1. Sincronização de contexto
Algumas respostas da IA não condizem com a escolha que o jogador acabou de fazer. O modelo às vezes responde a um contexto genérico em vez de reagir especificamente ao que foi dito.

**Causa provável:** o `player_choice_text` não está sendo suficientemente enfatizado no user prompt em relação ao histórico.

**Correção planejada:** reformular o user prompt para colocar a escolha atual como elemento central e reduzir o peso do histórico quando ele for longo.

### 2. Fluxo de pistas e desbloqueios
A IA às vezes revela pistas que não foram mencionadas no texto gerado ou declara IDs de pistas que não existem no mapeamento.

**Causa provável:** a LLM infere relações semânticas entre conceitos e os mapeia para IDs errados (ex: mencionar "fé" e declarar `cabra_reza`).

**Correção planejada:**
- Adicionar exemplos negativos explícitos no prompt para cada pista
- Expandir o validador de keywords no parser para cobrir mais variações linguísticas
- Incluir no prompt a distinção entre "mencionar algo relacionado" vs "revelar a pista diretamente"

### 3. Indicações entre NPCs
Quando Raimundo indica falar com Dona Conceição, a IA não está gerando consistentemente a `condition` `raimundo_indicacao`, que desbloqueia opções exclusivas no diálogo com a senhora.

**Correção planejada:** mapear indicações entre NPCs como um tipo especial de consequência (`type: "unlock_condition"`) e validá-las no parser da mesma forma que as pistas.

### 4. Métricas de qualidade de resposta
Não há atualmente nenhuma forma de medir se as respostas da IA estão dentro do esperado narrativamente.

**Correção planejada:** implementar um sistema de logging estruturado no backend que registre para cada chamada:
- NPC, humor de entrada e humor resultante
- Pistas declaradas vs pistas validadas (quantas foram bloqueadas pelo validador)
- Tempo de resposta do Groq
- Se o texto continha ações em 1ª pessoa (violação da REGRA 1)

Esses dados vão permitir ajustar o prompt com base em padrões reais de falha.

### 5. Qualidade do prompt
O prompt atual funciona mas ainda produz inconsistências em cenários de borda:

- NPC com humor `angry` às vezes responde com tom pensativo em vez de explosivo
- Ações entre asteriscos ocasionalmente ficam em 1ª pessoa (`*(Eu olho...)*`)
- Respostas às vezes longas demais para o estilo do personagem

**Correção planejada:**
- Adicionar exemplos de respostas boas e ruins diretamente no prompt (few-shot prompting)
- Testar o modelo `llama-3.1-70b-versatile` para cenas críticas onde a coerência é essencial
- Separar as instruções de formato das instruções de personalidade em blocos mais distintos


## 🌪️ Futuro: O Papel do SACI

O Saci como narrador e guia da jornada.

Funções planejadas:

- Introduzir regiões e histórias
- Comentar decisões do jogador
- Dar pistas indiretas
- Provocar, confundir ou ajudar
- Ele não é apenas um personagem...

## 🔊 Futuro: Áudio e Imersão

Planejado para evoluir com:

🎧 Trilha sonora regional
🔊 Sons ambientes (vento, passos, vozes)
🌀 Feedback sonoro narrativo