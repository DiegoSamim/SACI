# SACI — System Design

> Documento-espinha do projeto. Define **como o SACI é construído**, quais são os
> contratos entre as camadas e quais regras qualquer pessoa — ou qualquer IA —
> deve seguir ao trabalhar neste repositório.
>
> Última revisão: 2026-09-06

## Escopo desta versão

O SACI, nesta versão, é **exclusivamente um jogo narrativo de investigação em estilo
visual novel**, single-player, 100% offline, sobre folclore brasileiro. O jogador
explora cenários, conversa com NPCs com falas roteirizadas, coleta pistas e decide —
tudo com consequências determinísticas.

**Não há Backend nesta versão.** Não há IA generativa, não há rede, não há conta de
jogador. O foco integral é a **engine narrativa**: escolhas, consequências,
investigação, gating de conteúdo, e a experiência sensorial (visual, motion, áudio)
em torno dela. Ideias adiadas — NPCs com LLM, metadados de perfil, moedas — estão
registradas em [docs/FUTURE.md](docs/FUTURE.md) e não devem influenciar decisões de
arquitetura atuais.

## Índice

| Documento | Escopo |
| --- | --- |
| **Este arquivo** | Arquitetura, camadas, contratos, convenções, roadmap |
| [docs/design/VISUAL.md](docs/design/VISUAL.md) | Sistema de design visual (cordel / xilogravura) |
| [docs/design/MOTION.md](docs/design/MOTION.md) | Sistema de animação e transições |
| [docs/design/AUDIO.md](docs/design/AUDIO.md) | Sistema de som (especificação) |
| [docs/NARRATIVE.md](docs/NARRATIVE.md) | Engine narrativa: como escrever uma região |
| [docs/FUTURE.md](docs/FUTURE.md) | Escopo adiado — IA generativa, contas, moedas |
| [CLAUDE.md](CLAUDE.md) | Regras operacionais para agentes de IA |

---

## 1. Princípios

Seis princípios que resolvem a maioria das decisões de design sem precisar de discussão.

1. **Conteúdo é dado, não código.** Cenas, falas, pistas, NPCs e criaturas são
   estruturas declarativas em `src/data/`. Escrever uma nova região não deve exigir
   escrever um `if`. Se uma história precisa de código novo, o que falta é uma
   *capacidade da engine*, não um caso especial na tela.
2. **A tela não sabe as regras.** `screens/` renderiza estado e dispara intenções.
   Quem decide o que uma escolha faz é o resolver de consequências. Nenhuma tela
   contém lógica de progressão.
3. **Um token, uma fonte de verdade.** Nenhuma cor, fonte, duração de animação,
   espaçamento ou som literal dentro de componente. Tudo vem de `src/theme/`.
   Uma decisão estética se muda em um arquivo, nunca em treze.
4. **A estética é requisito, não enfeite.** Cordel/xilogravura é a especificação:
   alto contraste tinta-sobre-papel, traço bruto, assimetria proposital. Uma tela
   tecnicamente correta mas visualmente "app genérico" está errada.
5. **O jogo é local e completo.** Sem rede, sem servidor, sem dependência externa
   para jogar. Áudio e animação têm fallback (§6), mas a narrativa em si nunca
   depende de nada fora do dispositivo.
6. **Regiões são independentes.** Adicionar Norte não pode exigir tocar em Nordeste.
   Acoplamento entre regiões acontece só via progresso global (catálogo, pistas).

---

## 2. Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend — Expo / React Native (TypeScript)                │
│  Único componente do projeto nesta versão. Sem servidor.     │
│                                                             │
│  screens/ ── components/     apresentação, zero regra       │
│       │                                                     │
│  store/ (zustand)            estado da partida              │
│       │                                                     │
│  engine/                     regras: consequências, gates   │
│       │                                                     │
│  data/                       conteúdo declarativo            │
│       │                                                     │
│  services/                   I/O local: áudio, persistência  │
│       │                                                     │
│  theme/                      tokens: cor, tipo, motion, som │
└─────────────────────────────────────────────────────────────┘
```

**Decisões estruturantes:**

- **Um único jogador, sem conta, sem rede.** Todo o jogo roda no dispositivo. Progresso
  persiste localmente (AsyncStorage — hoje ainda não implementado, ver §7 B1).
- **NPCs são inteiramente roteirizados.** Todo diálogo é conteúdo declarativo em
  `src/data/`. Nada de geração em tempo real — ver [docs/FUTURE.md](docs/FUTURE.md) §1
  para a direção adiada.

---

## 3. Camadas do Frontend

Dependência é **estritamente unidirecional para baixo**. Uma camada nunca importa de
uma camada acima dela.

```
screens / components
        ↓
      store
        ↓
      engine
        ↓
   data  ·  services
        ↓
   theme  ·  types
```

| Camada | Diretório | Responsabilidade | Proibido |
| --- | --- | --- | --- |
| Apresentação | `src/screens/`, `src/components/` | Renderizar, animar, capturar input | Regras de jogo, cores literais |
| Estado | `src/store/` | Estado da partida, progresso persistente | Renderizar, conhecer navegação |
| Regras | `src/engine/` | Resolver consequências, filtrar escolhas, resolver cena | Tocar em React, tocar em navegação |
| Conteúdo | `src/data/` | Cenas, pistas, NPCs, criaturas | Importar store, engine ou screens |
| I/O | `src/services/` | Áudio, persistência, haptics | Regras de jogo |
| Tokens | `src/theme/` | Cor, tipografia, espaço, motion, som | Qualquer lógica |
| Contratos | `src/types/` | Tipos compartilhados | Qualquer implementação |

### 3.1 Estrutura-alvo

```
Frontend/src/
  theme/
    colors.ts          paleta cordel (papel, tinta, acentos regionais)
    typography.ts      famílias, escala, tracking, line-height
    spacing.ts         escala de espaçamento e raios
    motion.ts          durações, easings, presets de transição
    audio.ts           mapa de tokens de som
    index.ts           export único: `theme`
  types/
    narrative.ts       Scene, ChoiceOption, Clue, RegionId, NPCMood
    navigation.ts      RootStackParamList, MainTabParamList
  data/
    regions/
      index.ts         REGION_REGISTRY — fonte única de cenas e pistas
      nordeste/
        index.ts       exporta scenes + clues + meta da região
        scenes.ts
        dialogues.ts
        clues.ts
      norte/  sudeste/  sul/  centro-oeste/
    creatures.ts       FolcloreDex
  engine/
    resolveConsequences.ts
    availableChoices.ts
    resolveScene.ts
  store/
    gameStore.ts       partida ativa + progresso global
    settingsStore.ts   áudio, motion reduzido, velocidade de texto
  services/
    audioService.ts    buses, ducking, playback
    storage.ts         persistência versionada
  components/
    narrative/         TypewriterText, ChoiceList, ClueModal, NarrativeFrame
    layout/            ScreenVignette, PaperSurface, CordelDivider
    catalog/           CreatureCard
    map/               MapCloudLayer, RegionPin
  screens/
```

### 3.2 Regras de import

- Telas importam de `@/theme`, `@/components`, `@/store`, `@/types`. **Nunca** de `@/data` direto.
- Resolver conteúdo é responsabilidade do store/engine, via `REGION_REGISTRY`.
- Alias `@/*` → `src/*` já está configurado ([tsconfig.json](Frontend/tsconfig.json)). **Use sempre o alias**; caminhos relativos `../../` estão proibidos em código novo.

---

## 4. Contratos centrais

### 4.1 Identificadores

Ids são a API pública entre conteúdo e engine. Quebrar um id quebra saves.

| Entidade | Formato | Exemplo |
| --- | --- | --- |
| `RegionId` | snake_case, fechado no tipo | `nordeste`, `centro_oeste` |
| `sceneId` | `{regionId}_{slug}` | `nordeste_caatinga_dia` |
| `dialogueId` | `{regionId}_dialogo_{npcId}` | `nordeste_dialogo_raimundo` |
| `lineId` | slug curto, único dentro do diálogo | `abertura`, `pergunta_cheiro` |
| `clueId` | `{criatura}_{fato}` | `cabra_voz`, `cabra_reza` |
| `npcId` | slug sem acento, minúsculo | `raimundo`, `conceicao` |
| `flag` | snake_case, verbo no particípio | `dialogo_senhora_concluido` |
| `creatureId` | snake_case | `cabra_cabriola` |

**Regra crítica:** `RegionId` é o identificador canônico e circula em **toda** a stack
do frontend — rotas, store, engine e assets. Nomes de exibição ("Centro-Oeste",
"Nordeste") são apenas apresentação e vivem num mapa `REGION_LABELS`. **Nunca derive
um id de um label** com `toLowerCase()`/`replace()`. Rotas devem transportar
`regionId`, não `regionName`.

Assets seguem o mesmo id: `assets/scenario/{regionId}/{sceneId}.png`.

### 4.2 Cena

Duas formas, discriminadas por `type` (ver [types/narrative.ts](Frontend/src/types/narrative.ts)):

- `scenario_scene` — cenário narrado, imagem + texto + escolhas.
- `scenario_dialogue` — conversa com NPC, grafo de `lines` navegável por `lineId`.

Uma cena **nunca** contém lógica. Só descreve o que existe e o que cada escolha causa.

### 4.3 Consequências

A engine conhece exatamente estes efeitos:

| Consequência | Efeito |
| --- | --- |
| `navigate` | Muda a cena atual (ou a linha, se o id contiver `#`) |
| `add_clue` | Registra pista na partida e no progresso global |
| `add_condition` / `remove_condition` | Liga/desliga uma flag livre |
| `game_over` | Encerra a região com um `GameOverReason` |
| `go_back` | Volta para a cena anterior |

**Adicionar um tipo novo de consequência é uma mudança de engine** e exige atualizar:
`types/narrative.ts`, o resolver, este documento e [docs/NARRATIVE.md](docs/NARRATIVE.md).
Nunca implemente um efeito novo dentro de uma tela.

### 4.4 Gating de escolhas

Uma escolha aparece se, e somente se:

```
todas as requiresClues foram descobertas
E todas as requiresConditions estão ligadas
E nenhuma blockConditions está ligada
```

Essa é a única regra de visibilidade. Não existe gating implícito em tela.

### 4.5 Estado da partida

`RegionState` é o save. Qualquer campo novo é **aditivo e opcional**, ou vem com
migração explícita (§7.3).

```ts
{
  regionId, currentSceneId, previousSceneId,
  discoveredClues: string[],
  npcMoods: Record<npcId, NPCMood>,
  visitedScenes: string[],
  flags: Record<string, boolean>,
  outcome: "playing" | "catalogued" | "fled" | "failed" | "caught",
}
```

---

## 5. Investigação e consequências

O núcleo de design desta versão. Três mecânicas compõem a investigação:

- **Pistas (`Clue`)** são o vocabulário de descoberta. Cada uma é um fato atômico
  sobre a criatura da região, obtido explorando cenário ou conversando com um NPC
  específico. Pistas nunca somem e se acumulam no progresso da região e no
  progresso global (catálogo).
- **Flags livres (`flags`)** registram história — o que o jogador já fez, não o que
  já sabe. Usadas para não repetir conteúdo (`blockConditions`) e para desbloquear
  falas que dependem de uma ação anterior, não de uma pista (`requiresConditions`).
- **Consequências múltiplas por escolha.** Uma escolha pode, na mesma ação, revelar
  uma pista, ligar uma flag e navegar — nessa ordem, para que o destino já veja o
  efeito (ver [docs/NARRATIVE.md](docs/NARRATIVE.md) §3).

O jogo é inteiramente determinístico: dado o mesmo histórico de escolhas, o resultado
é sempre o mesmo. Não há aleatoriedade, não há timer, não há combate resolvido por
número — investigar é ler, cruzar informação e escolher, não gerenciar recursos.

Regras de autoria completas — como garantir que toda região tem saída, todo final é
alcançável e toda pista tem origem — estão em [docs/NARRATIVE.md](docs/NARRATIVE.md).

---

## 6. Subsistemas de design

Cada um tem documento próprio com particularidades. Resumo dos contratos:

### 6.1 Visual — [docs/design/VISUAL.md](docs/design/VISUAL.md)

Papel envelhecido, tinta quase-preta, acentos regionais dessaturados. Duas famílias:
`Xilosa` para títulos e rótulos (tracking largo, caixa alta), `Cordel Rustika` para
corpo e fala. Sem sombra difusa, sem gradiente decorativo, sem cor saturada de UI.
Vinheta em todas as telas. Ícones sempre em par claro/escuro.

### 6.2 Motion — [docs/design/MOTION.md](docs/design/MOTION.md)

Movimento é narrativo: revela informação na ordem em que a história a entrega.
Coreografia canônica da cena — imagem *fade* → texto datilografado → pausa 400ms →
escolhas sobem em spring. Tudo em Reanimated (worklets, UI thread). Durações e easings
saem de `theme/motion`. `reduce-motion` desliga movimento e mantém opacidade.

### 6.3 Áudio — [docs/design/AUDIO.md](docs/design/AUDIO.md)

**Ainda não implementado — este é o spec.** Quatro barramentos: `music`, `ambience`,
`sfx`, `voice`. Ambiência por região, stingers por evento narrativo, ducking durante
diálogo. Tokens de som, nunca `require` solto. `expo-audio` (o `expo-av` está
depreciado no SDK 54). Silêncio é estado válido e o jogo é 100% jogável mudo.

Todo subsistema opcional (áudio, animação) tem fallback: sem som o jogo é
completamente jogável; com `reduce-motion`, a coreografia perde deslocamento mas
mantém a ordem de revelação de informação.

---

## 7. Estado atual e dívidas

Levantamento real do repositório em 2026-09-06. **Trate como backlog priorizado.**
Dívidas específicas de IA/Backend foram removidas daqui — ver
[docs/FUTURE.md](docs/FUTURE.md).

### 7.1 Bloqueadores

| # | Problema | Onde |
| --- | --- | --- |
| B1 | **Nada persiste.** Zustand puro em memória: fechar o app apaga todo o progresso. | `store/gameStore.ts` |

### 7.2 Correções de contrato

| # | Problema | Onde |
| --- | --- | --- |
| C1 | `regionName` do mapa (`"Suldeste"`, `"CentroOeste"`) é convertido em id por `toLowerCase().replace(" ","_")` e produz ids inválidos que não existem em `RegionId`. Rotas devem levar `regionId`. | `screens/Map`, `screens/Scenario` |
| C2 | `go_back` seta `outcome: "catalogued"` — volta atrás é tratada como vitória. | `store/gameStore.ts` |
| C3 | Registro de cenas/pistas duplicado em três lugares (`gameStore`, `GameEngine`, e `ALL_CLUES` recriado dentro de `Scenario` e `Dialogue`). Deve existir um `REGION_REGISTRY` único. | 4 arquivos |
| C4 | Dois `RootStackParamList` conflitantes; `routes/types.ts` está obsoleto e diverge do real. | `routes/types.ts` |
| C5 | `engine/GameEngine.ts` é código morto substituído pelo store, e ainda contém a versão antiga (e errada) das consequências. | `engine/GameEngine.ts` |
| C6 | `getResumeSceneId` monta ids por concatenação (`${regionId}_catalogar`), assumindo que toda região terá exatamente essas cenas. Deve vir do meta da região. | `store/gameStore.ts` |
| C7 | `@expo/vector-icons` é importado em `Inventory` sem estar declarado no `package.json`. | `screens/Inventory` |
| C8 | `package.json` ainda se chama `my-expo-app`. | `Frontend/package.json` |

### 7.3 Dívidas de design

| # | Problema |
| --- | --- |
| D1 | **NativeWind instalado e praticamente não usado** (2 arquivos com `className`, 11 em `StyleSheet`). Decisão: **padronizar em `StyleSheet` + tokens**, migrar `Battle` e `Inventory`, e então remover `nativewind`/`tailwindcss` do projeto. Ter dois sistemas de estilo é a pior das opções. |
| D2 | ~40 cores literais espalhadas por telas e componentes, incluindo uma paleta regional paralela (`REGION_ACCENT` em `creatureCards.tsx`) que **diverge** de `APP_COLORS.buttons.pin`. Consolidar em `theme/colors`. |
| D3 | `TypewriterText` e `CluesModal` duplicados byte a byte entre `Scenario` e `Dialogue`. Extrair para `components/narrative/`. |
| D4 | Durações e easings de animação hardcoded em cada arquivo. Extrair para `theme/motion`. |
| D5 | Zero áudio no jogo apesar de `expo-av` instalado (e depreciado). |
| D6 | Sem acessibilidade sistemática: sem `reduce-motion`, sem controle de velocidade de texto, `accessibilityLabel` apenas pontual. |
| D7 | Zero testes no projeto. |
| D8 | `nordeste.ts` tem 1998 linhas em arquivo único — insustentável quando forem cinco regiões. |
| D9 | `Battle` é uma tela stub sem mecânica definida. Decidir se "batalha" nesta versão é confronto narrativo (escolha sob pressão, sem número) ou se o conceito é removido do escopo. |

---

## 8. Roadmap

Fases em ordem de dependência. Não pule fase: cada uma remove um bloqueio da seguinte.
Nenhuma fase envolve backend ou rede — ver [docs/FUTURE.md](docs/FUTURE.md).

**Fase 1 — Fundação**
`theme/` completo; `REGION_REGISTRY` único; corrigir C1–C8; extrair componentes
narrativos duplicados (D3); decidir e executar D1; persistência versionada com
AsyncStorage (B1).

**Fase 2 — Engine narrativa**
Formalizar `engine/resolveConsequences`, `availableChoices` e `resolveScene` como
funções puras testáveis; decidir o formato de "confronto" (D9); cobrir a engine com
testes (D7) — é o coração determinístico do jogo e o lugar onde regressão dói mais.

**Fase 3 — Sistemas de experiência**
Implementar `docs/design/AUDIO.md`; formalizar `docs/design/MOTION.md` em presets;
transições de tela por semântica narrativa; acessibilidade (D6).

**Fase 4 — Expansão de conteúdo**
Norte, Centro-Oeste, Sudeste e Sul seguindo [docs/NARRATIVE.md](docs/NARRATIVE.md).
Se as fases 1–2 foram bem feitas, uma região nova é conteúdo puro — nenhuma linha de
engine. Dividir `nordeste.ts` (D8) antes de replicar o padrão.

**Fase 5 — Polimento e lançamento**
Revisão de todos os finais de todas as regiões; auditoria de acessibilidade completa;
QA de ponta a ponta em dispositivo físico Android e iOS.

Só depois da Fase 5, considerar qualquer item de [docs/FUTURE.md](docs/FUTURE.md).

---

## 9. Qualidade

**Definição de pronto** para qualquer mudança:

- `npx tsc --noEmit` limpo e `npm run lint` limpo (Frontend).
- Zero cor, fonte, duração ou caminho de som literal em código de apresentação.
- Conteúdo novo não introduziu `if` em tela.
- Ids seguem §4.1.
- Se mudou um contrato (tipo, consequência, token), este documento e o doc
  específico foram atualizados **no mesmo commit**.
- Caminho degradado testado quando a mudança envolve áudio ou animação.

**Commits:** `tipo: descrição em português` — `feat`, `fix`, `docs`, `refactor`,
`chore`, `content` (conteúdo narrativo novo), seguindo o histórico existente.
