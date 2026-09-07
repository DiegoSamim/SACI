# 🌪️ SACI

Jogo narrativo interativo sobre o folclore brasileiro em estilo de cordel

## Sobre o Projeto

SACI é um visual novel de investigação narrativa desenvolvido em React Native (Expo),
inspirado no folclore brasileiro e na estética da literatura de cordel.

A experiência gira em torno de decisões, interpretação e diálogo. Cada escolha molda a
narrativa, criando uma experiência dinâmica e imersiva por todas as regiões do Brasil.

O jogador investiga eventos misteriosos, conversa com NPCs e coleta pistas em busca de
catalogar todo folclore brasileiro.

Nesta versão o jogo é **inteiramente offline e roteirizado**: sem backend, sem IA
generativa, sem rede. O foco é a engine narrativa — escolhas, consequências e
investigação. Essa direção fica registrada em [docs/FUTURE.md](docs/FUTURE.md) para
uma versão futura.

## Estrutura do Projeto

```text
SACI/
  Frontend/       # Aplicativo Expo React Native — único componente desta versão
  docs/           # Especificações dos subsistemas
```

## 📐 Documentação Técnica

O projeto segue um system design documentado. Antes de contribuir, leia:

- **[SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)** — arquitetura, camadas, contratos e roadmap
- [CLAUDE.md](CLAUDE.md) — regras operacionais para agentes de IA
- [docs/NARRATIVE.md](docs/NARRATIVE.md) — como escrever uma região
- [docs/design/VISUAL.md](docs/design/VISUAL.md) — sistema visual cordel/xilogravura
- [docs/design/MOTION.md](docs/design/MOTION.md) — animações e transições
- [docs/design/AUDIO.md](docs/design/AUDIO.md) — sistema de som (especificação)

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
- Algumas opções só aparecem se você tiver pistas
- Decisões erradas podem levar a finais ruins
- Decisões corretas revelam a verdade da criatura

Todo o diálogo dos NPCs é escrito à mão como conteúdo declarativo — sem geração em
tempo real. O jogo é determinístico: a mesma sequência de escolhas sempre leva ao
mesmo resultado.

## Exploração do Brasil

O jogo é estruturado para que cada história se passe em alguma região do Brasil, tendo
atualmente um folclore para cada região.

🐐 Nordeste (completo — Cabra Cabriola)
🌲 Norte
🔥 Centro-Oeste
🐎 Sudeste
🌾 Sul

Futuramente o objetivo é expandir cada região para ter:

- Novas histórias
- Novos NPCs
- Novas mecânicas narrativas
- Novos cenários

## 🎨 Estilo Visual

Inspirado na cultura brasileira:

- Imagens, ícones e tipografia em cordel
- Alto contraste (preto e bege)
- Textura de papel envelhecido
- Visual minimalista e simbólico

Ver detalhamento em [docs/design/VISUAL.md](docs/design/VISUAL.md).

## 📖 FolcloreDex (Catálogo)

As criaturas são desbloqueadas através da narrativa.

Cada entrada contém:

- Nome
- Região
- Origem cultural
- Comportamento
- Relatos coletados

## 🔊 Áudio e Imersão

Especificado (ainda não implementado) em [docs/design/AUDIO.md](docs/design/AUDIO.md):

🎧 Trilha sonora regional
🔊 Sons ambientes (vento, passos, vozes)
🌀 Feedback sonoro narrativo
