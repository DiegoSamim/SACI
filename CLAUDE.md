# Regras para agentes de IA neste repositório

Leia [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) antes de qualquer mudança estrutural.
Este arquivo é o resumo operacional.

## Contexto em uma frase

SACI é um jogo narrativo de investigação em estilo visual novel (Expo/React Native),
sobre folclore brasileiro, com estética de cordel/xilogravura. Nesta versão o jogo é
inteiramente offline e scriptado — sem backend, sem IA generativa, sem rede. Ver
[docs/FUTURE.md](docs/FUTURE.md) para o que foi deliberadamente adiado.

## Onde encontrar as regras

| Vai mexer em | Leia antes |
| --- | --- |
| Arquitetura, camadas, contratos | [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) |
| Cor, fonte, layout, componente | [docs/design/VISUAL.md](docs/design/VISUAL.md) |
| Animação, transição, typewriter | [docs/design/MOTION.md](docs/design/MOTION.md) |
| Som | [docs/design/AUDIO.md](docs/design/AUDIO.md) |
| Cena, pista, diálogo, região nova | [docs/NARRATIVE.md](docs/NARRATIVE.md) |
| Ideias fora do escopo atual | [docs/FUTURE.md](docs/FUTURE.md) |

## Comandos

```bash
cd Frontend
npm run dev            # expo start -c --tunnel
npx tsc --noEmit       # checagem de tipos — rode antes de terminar
npm run lint           # eslint + prettier
```

## Sempre

- **Português do Brasil** em código, comentários, commits e conteúdo. O jogo é brasileiro.
- **Tokens, nunca literais.** Cor, fonte, espaçamento, duração e som vêm de `src/theme/`.
  Um `#8B5A1E` novo dentro de uma tela é motivo para rejeitar a mudança.
- **Alias `@/`** para imports (`@/theme`, `@/components`). Nada de `../../`.
- **`RegionId` canônico** viaja pela stack inteira. Nome de exibição só na apresentação.
  Nunca derive id de label com `toLowerCase()`/`replace()`.
- **Conteúdo é dado.** História nova = arquivo em `src/data/`, não `if` em tela.
  Todo diálogo de NPC é escrito à mão — não há geração em tempo real nesta versão.
- **Atualize o doc no mesmo commit** quando mudar um contrato (tipo, consequência, token).
- **`ScreenVignette` em toda tela.**

## Nunca

- Reintroduzir backend, chamada de rede ou IA generativa nesta versão — está
  deliberadamente fora do escopo (ver [docs/FUTURE.md](docs/FUTURE.md)). Se um pedido
  do usuário apontar nessa direção, confirme antes de construir.
- Commitar `.env`, `venv/`, `__pycache__/`, `node_modules/`, `.expo/`.
- Animar com `setState`/`setInterval` em vez de Reanimated (exceto o typewriter).
- Animar `width`, `height`, `top` ou `margin` — só `transform` e `opacity`.
- Introduzir biblioteca de ícones vetoriais, modo escuro, ou visual de "app moderno".
- Criar um quinto registro paralelo de cenas/pistas. Existe **um** `REGION_REGISTRY`.
- Adicionar dependência sem justificar por que o que já existe não resolve.

## Estado do repositório (2026-09-06)

Antes de propor trabalho novo, saiba o que está quebrado — detalhe em
[SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) §7:

- 🔴 **Nada persiste** — fechar o app apaga o progresso (sem AsyncStorage ainda).
- 🟡 NativeWind instalado e quase não usado; padrão é `StyleSheet` + tokens.
- 🟡 `TypewriterText` e `CluesModal` duplicados entre `Scenario` e `Dialogue`.
- 🟡 `engine/GameEngine.ts` e `routes/types.ts` são código morto e divergente.
- 🟡 `go_back` marca a região como vencida.
- 🟡 Zero testes.
- 🟡 `Battle` é stub sem mecânica definida — decidir se existe nesta versão.

## Antes de dizer que terminou

- [ ] `npx tsc --noEmit` limpo
- [ ] `npm run lint` limpo
- [ ] Nenhum literal de cor/fonte/duração/som em código de apresentação
- [ ] Ids seguem [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md) §4.1
- [ ] Doc atualizado se um contrato mudou
- [ ] Caminho degradado testado, se a mudança toca áudio ou animação
