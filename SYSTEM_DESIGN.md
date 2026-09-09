# SACI — System Design

> Documento-espinha do projeto. Define **como o SACI é construído**, quais são os
> contratos entre as camadas e quais regras qualquer pessoa — ou qualquer IA —
> deve seguir ao trabalhar neste repositório.
>
> Última revisão: 2026-09-08 — engine narrativa v2

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

### 3.1 Estrutura real (v2)

```
Frontend/src/
  types/
    ids.ts, qualities.ts, conditions.ts, effects.ts,
    scene.ts, ending.ts, region.ts, dex.ts, save.ts, events.ts
                        contratos v2 — 100% type-only, zero runtime
    narrative.ts        contratos v1, mantido só para o conteúdo v1 morto
    navigation.ts        RootStackParamList, MainTabParamList
  data/
    regions/
      index.ts           REGION_REGISTRY — fonte única de conteúdo
      nordeste/           qualities · scenes · dialogues · npcs · clues ·
                          endings · dex · meta  (fatia vertical, provisória)
    region/nordeste.ts    conteúdo v1, morto, preservado (§12 do prompt v2)
    folkloreCreatures.ts  catálogo v1, ainda usado pelo card do Catalog
  engine/
    qualities · conditions · variants · choices · effects · scenes ·
    endings · completion · dex · constants     — funções puras, zero React
  services/
    storage.ts           persistência versionada, backend injetável
    asyncStorageBackend.ts  único arquivo que importa AsyncStorage
    eventBus.ts           barramento de EngineEvent
  store/
    runStore.ts           partida ativa (SaveSlot)
    progressStore.ts      progresso global (GlobalProgress: dex + finaisVistos)
  components/
    narrative/            TypewriterText, ChoiceList, CluesModal, sceneAssets
    dev/                  DevInspector — só em __DEV__
    layout/, catalog/, map/   como hoje
  screens/
  scripts/
    validate-content.ts, validate/rules.ts   validador — npm run validate
    node-loader.mjs       resolve @/ e extensão implícita em node puro
```

`theme/` continua sendo alvo, não realidade — os tokens vivem em `src/constants/`
(dívida D1/D2, §7.3), fora do escopo desta frente.

### 3.2 Regras de import

- Telas importam de `@/theme` (hoje `@/constants`), `@/components`, `@/store`,
  `@/types`. Resolver conteúdo é responsabilidade do store/engine, via
  `REGION_REGISTRY`.
- **Desvio conhecido, registrado como dívida (D10, §7.3):** algumas telas leem
  `REGION_REGISTRY`/`REGION_LABELS` de `@/data/regions` direto, para nome de
  região e título de pista/NPC — não há hoje um seletor de store para isso. É
  drift real desta regra, não uma reinterpretação dela.
- `data/` nunca importa `require()` de imagem: quem resolve chave de asset em
  pixel é a apresentação (`components/narrative/sceneAssets.ts`). É o que mantém
  o conteúdo v2 carregável em node puro, para o validador e os testes.
- Alias `@/*` → `src/*` já está configurado ([tsconfig.json](Frontend/tsconfig.json)). **Use sempre o alias**; caminhos relativos `../../` estão proibidos em código novo.

---

## 4. Contratos centrais

A engine v2 é uma **máquina de estado narrativo**: todo estado é numérico e
unificado, pistas selecionam variante de texto e efeito em vez de destravar
opções, e finais são nomeados e resolvidos por condição. Contratos completos em
[Frontend/src/types/](Frontend/src/types/); autoria de conteúdo em
[docs/NARRATIVE.md](docs/NARRATIVE.md).

### 4.1 Identificadores

Ids são a API pública entre conteúdo e engine. Quebrar um id quebra saves.

| Entidade | Formato | Exemplo |
| --- | --- | --- |
| `RegionId` | snake_case, fechado no tipo | `nordeste`, `centro_oeste` |
| `sceneId` | `{regionId}_{slug}` | `nordeste_curral` |
| `dialogueId` | `{regionId}_dialogo_{npcId}` | `nordeste_dialogo_raimundo` |
| `lineId` | slug curto, único dentro do diálogo | `abertura`, `a_voz` |
| `clueId` | slug curto, único no projeto, por convenção prefixado por um apelido curto da criatura | `cabra_voz`, `cabra_reza` |
| `npcId` | slug sem acento, minúsculo, **único no projeto** | `raimundo`, `conceicao` |
| `creatureId` | snake_case | `cabra_cabriola` |
| `endingId` | `{regionId}_{slug}` | `nordeste_reza_na_soleira` |

**Regra crítica:** `RegionId` é o identificador canônico e circula em **toda** a stack
do frontend — rotas, store, engine e assets. Nomes de exibição ("Centro-Oeste",
"Nordeste") são apenas apresentação e vivem num mapa `REGION_LABELS`. **Nunca derive
um id de um label** com `toLowerCase()`/`replace()`. Rotas devem transportar
`regionId`, não `regionName`.

`npcId` e `clueId` são únicos **entre todas as regiões**, não só dentro de uma: os
namespaces `humor.<npcId>` e `pista.<clueId>` (§4.3) não são prefixados por região, e
dois ids iguais em regiões diferentes compartilhariam estado no mesmo save. A
checagem 14 do validador (§13 de [docs/NARRATIVE.md](docs/NARRATIVE.md)) barra isso.

`clueId` não é derivável de `creatureId` — ao contrário do que uma versão anterior
deste documento dizia. `cabra_voz` é o padrão de fato, mas nada impõe o prefixo
`cabra` além de convenção do autor; o validador confere só a forma.

Assets seguem o mesmo id: `assets/scenario/{regionId}/{sceneId}.png`.

### 4.2 Estado: qualidades

Substitui `discoveredClues` + `flags` + `npcMoods` do modelo v1. Tudo é um único
mapa numérico:

```ts
type Qualities = Record<string, number>
```

**Chave ausente vale `0`** — nunca existe `undefined` no estado. Sete namespaces
obrigatórios ([types/qualities.ts](Frontend/src/types/qualities.ts)):

| Prefixo | Uso | Prefixado por região? | Exemplo |
| --- | --- | --- | --- |
| `pista.` | conhecimento do investigador | não — `clueId` já é único | `pista.cabra_voz` |
| `humor.` | humor de NPC, tipicamente -3..+3 | não — `npcId` já é único | `humor.raimundo` |
| `laco.` | relação acumulada com NPC | não | `laco.raimundo` |
| `mundo.` | estado da região | **sim** | `mundo.nordeste.ato` |
| `feito.` | histórico de ações | **sim** | `feito.nordeste.fugiu` |
| `visita.` | gerado pela engine ao entrar numa cena, nunca declarado | — | `visita.nordeste_curral` |
| `meta.` | progresso entre regiões, derivado pela engine, nunca escrito por conteúdo | — | `meta.tag_bom` |

`mundo.` e `feito.` levam o `regionId` no meio da chave porque um save atravessa as
cinco regiões: sem o prefixo, `mundo.ato` de Nordeste colidiria com `mundo.ato` de
Norte no mesmo save. `pista.`, `humor.` e `laco.` dispensam prefixo porque `clueId`
e `npcId` já são únicos globalmente (§4.1).

Cada qualidade é declarada num `QualityDef` por região, com `min`/`max` (a engine
aplica `clamp` em todo `set` e `adjust`) e, para humor, `faixas` — intervalos que
convertem número em palavra (`hostil`, `neutro`, `receptivo`...) sem espalhar `if`
pela UI. Meta de autoria: ~15 chaves por região, fora `visita.` e `meta.`.

### 4.3 Condição

```ts
type Predicate = { key: string; op: "gte" | "lte" | "eq" | "neq"; value: number }
type Condition = { all?: Predicate[]; anyOf?: Predicate[][] }
```

`all` é AND; `anyOf` é OR de grupos AND; os dois juntos exigem que ambos passem.
`undefined` ou objeto vazio é sempre verdadeiro. Deliberadamente raso — sem
aninhamento além disso. Se um caso de roteiro exigir mais, o problema é de roteiro.

### 4.4 Efeitos

A engine conhece exatamente estes cinco
([types/effects.ts](Frontend/src/types/effects.ts)):

| Efeito | Ação |
| --- | --- |
| `set` | Grava um valor absoluto numa chave (com clamp) |
| `adjust` | Soma/subtrai do valor atual (com clamp) |
| `navigate` | Muda a cena atual, ou a linha, se `to` contiver `#` |
| `end_region` | Encerra a região; sem `endingId`, a engine resolve por condição |
| `emit` | Publica um evento customizado no barramento (§4.7), para o Saci consumir depois |

`navigate` e `end_region` só podem ser o **último** efeito de um array — a checagem 7
do validador rejeita o contrário. **`go_back` foi extinto**: voltar é uma escolha
autorada, com `navigate` explícito e efeitos próprios (fecha a dívida C2, §7).

**Adicionar um efeito novo é mudança de engine** e exige atualizar, no mesmo commit:
`types/effects.ts`, `engine/effects.ts`, o validador e este documento. Nunca
implemente um efeito novo dentro de uma tela.

### 4.5 Cena e precedência de escolha

Duas formas, discriminadas por `type`
([types/scene.ts](Frontend/src/types/scene.ts)): `local` (cenário narrado) e
`dialogo` (grafo de linhas navegável por `lineId`). Uma cena **nunca** contém
lógica — só descreve o que existe e o que cada escolha causa.

Cada bloco de texto é uma lista de `TextVariant`; a engine escolhe uma por
desempate determinístico: maior `priority` → mais predicados na condição (mais
específica ganha) → ordem de declaração. É assim que uma pista muda **o que o NPC
diz**, não só o que fica visível.

Uma escolha (`Choice`) tem três estados, em ordem de precedência —
**oculta > travada > disponível**:

- **Disponível** — padrão, deve ser a maioria esmagadora.
- **Oculta** (`hiddenWhen`) — só quando exibir já entrega a revelação.
- **Travada** (`lockedWhen`) — aparece, responde com `lockedText`, e **não altera
  estado nenhum**. É o que ensina o sistema ao jogador: ele vê que existe caminho e
  entende o que falta.

`once` remove a escolha depois de usada. A chave de "já usada" é composta
(`sceneId#choiceId`, ou `sceneId#lineId#choiceId` em diálogo) e **gerada pela
engine** — nunca remontada por quem chama, porque foi exatamente esse recálculo
que produziu um bug real na etapa 3 (uma escolha `once` reaparecendo).

Toda `LocalScene` precisa de uma escolha sem `when`/`hiddenWhen`/`lockedWhen`/`once`
(checagem 3). Todo diálogo declara `linhaDeDespedida`; se `availableChoices`
devolver vazio, a engine injeta uma despedida automaticamente — rede de segurança,
não substituto de saída autorada (checagem 4).

### 4.6 Finais, epílogo e a ficha

Uma região termina num `Ending` nomeado, não numa categoria fixa:

```ts
type Ending = { id, nome, tags: EndingTag[], when?, priority, texto, epilogo?: string[] }
```

`EndingTag` é `"bom" | "neutro" | "ruim" | "fuga"`, e um final pode ter mais de uma.
Sem `endingId` explícito no `end_region`, a engine resolve pelo `Ending` de maior
`priority` cuja condição passa; toda região tem **exatamente um** final sem `when`
(fallback) e ao menos um com a tag `bom` (checagem 10).

Cada slot listado em `ending.epilogo` resolve um `EpilogueFragment`, pelo mesmo
mecanismo de prioridade; todo slot referenciado precisa de um fragmento sem `when`
(checagem 11).

**`fuga` é a única tag que não cataloga.** O FolcloreDex (`Catalog`) tem três
seções por criatura: o *relato do investigador* (pistas descobertas, em ordem —
varia por save), *o que ficou* (moral derivada das tags do final, via
`MoralFragment` — varia por save) e *a lenda* (factual, fixa, nunca parcial). Um
final `ruim` ainda cataloga, com relato incompleto — a completude cai sozinha
porque menos pistas foram descobertas. `fuga` deixa a ficha marcada como não
registrada, com explicação diegética.

A ficha é global e **empilha registros**, não sobrescreve: duas investigações da
mesma criatura com finais diferentes viram duas vozes discordando na mesma página,
ordenadas por completude.

### 4.7 Barramento de eventos

```ts
type EngineEvent =
  | { type: "sceneEnter"; sceneId; primeiraVez }
  | { type: "choiceTaken"; choiceId; sceneId }
  | { type: "clueFound"; clueKey; ordem }
  | { type: "moodChanged"; npcId; de; para }
  | { type: "actAdvanced"; ato }
  | { type: "endingReached"; endingId; tags }
  | { type: "custom"; event; tag? }
```

A engine emite sem saber quem escuta ([services/eventBus.ts](Frontend/src/services/eventBus.ts)).
É o gancho para o Saci — construído depois, numa área separada da tela. **Nenhuma
lógica do Saci nesta versão**, só emissão e um subscriber vazio.

### 4.8 Persistência

Dois níveis, quatro chaves de storage:

```ts
type SaveSlot = {
  version, slot: 1 | 2 | 3, criadoEm, atualizadoEm,
  qualities: Qualities,
  currentRegionId: RegionId | null, currentSceneId, currentLineId?,
  takenChoices: string[], clueOrder: string[],
  regioesConcluidas: Partial<Record<RegionId, { endingId; tags }>>,
}

type GlobalProgress = {
  version, dex: Record<creatureId, DexEntry>, finaisVistos: string[],
  ultimoSlotJogado?: 1 | 2 | 3,
}
```

`SaveSlot` é o save de uma partida — três por instalação, sem rejogar uma região já
concluída no mesmo save. `GlobalProgress` atravessa saves: apagar um slot **não**
apaga a ficha nem a galeria de finais vistos.

`SaveSlot.regioesConcluidas` é a verdade estruturada sobre finais. Como `Condition`
só lê números, a engine mantém um **espelho derivado** em `Qualities` —
`meta.tag_bom`, `meta.tag_neutro`, `meta.tag_ruim`, `meta.tag_fuga`,
`meta.regioes_concluidas` — incrementado só no `end_region`. Conteúdo nunca escreve
ali (checagem 15); é o que o capítulo final do Saci vai avaliar, por composição de
tags, não por portão binário.

Migração é uma função por `version`, hoje vazia (v1 é a primeira). Save robusto: se
`currentSceneId` não existir mais no conteúdo, volta ao início da região — nunca
crash. Ver [services/storage.ts](Frontend/src/services/storage.ts).

Autosave grava em quatro marcos: troca de cena, fim de região, app em background, e
qualquer linha de diálogo que produza efeito — sem o último, o diálogo do NPC
(onde mora a maior parte do humor e das pistas por conversa) ficaria sem gravar.

---

## 5. Investigação e consequências

O núcleo de design desta versão. Determinístico: dado o mesmo histórico de
escolhas, o resultado é sempre o mesmo. Não há aleatoriedade, não há timer, não há
combate resolvido por número — investigar é ler, cruzar informação e escolher.

- **Pistas** (`pista.<clueId>`) são o vocabulário de descoberta — um fato atômico
  sobre a criatura, obtido explorando ou conversando. Uma pista indo de `0` para
  `≠ 0` entra em `clueOrder`, preservando a ordem de descoberta, por `set` **ou**
  `adjust`.
- **Humor** (`humor.<npcId>`) e **laço** (`laco.<npcId>`) são as duas faces da
  relação com um NPC: humor é volátil e move o que ele diz agora; laço acumula e
  pode abrir caminhos que o humor sozinho não abre.
- **Uma escolha pode disparar vários efeitos** — revelar pista, ajustar humor,
  navegar — nessa ordem, para que o destino já veja o efeito.
- **Uma variante de texto também carrega efeitos** (`TextVariant.effects`),
  aplicados **ao entrar** na cena, não ao escolher: é como uma pista obtida por
  exploração (olhar o cenário) chega ao estado sem esperar a próxima escolha.

Regras de autoria completas — saída garantida, alcançabilidade, pista com origem,
o checklist terminando em `npm run validate` — estão em
[docs/NARRATIVE.md](docs/NARRATIVE.md).

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

Levantamento real do repositório após a reescrita da engine (v2, etapas 1–8).
**Trate como backlog priorizado.** Dívidas específicas de IA/Backend foram
removidas daqui — ver [docs/FUTURE.md](docs/FUTURE.md).

### 7.1 Bloqueadores

**Nenhum.** B1 (nada persistia) está fechado — ver §7.4.

### 7.2 Correções de contrato

**Todas fechadas** — C1 a C6 na reescrita da engine v2, C2 extinto junto com o
`go_back` que o causava. C7 e C8 seguem abertos, fora do escopo desta frente
(§12 do prompt de reescrita mandou não tocá-los):

| # | Problema | Onde |
| --- | --- | --- |
| C7 | `@expo/vector-icons` é importado em `Inventory` sem estar declarado no `package.json`. | `screens/Inventory` |
| C8 | `package.json` ainda se chama `my-expo-app`. | `Frontend/package.json` |

### 7.3 Dívidas de design

| # | Problema |
| --- | --- |
| D1 | **NativeWind instalado e praticamente não usado** (2 arquivos com `className`, 14 em `StyleSheet` — o número de `StyleSheet` cresceu com a reescrita, não diminuiu). Decisão pendente: padronizar em `StyleSheet` + tokens, migrar `Inventory`, remover `nativewind`/`tailwindcss`. |
| D2 | Cores literais espalhadas por telas e componentes **anteriores à v2**, incluindo `REGION_ACCENT` em `creatureCards.tsx`, que diverge de `APP_COLORS.buttons.pin`. As telas reescritas na v2 (`Scenario`, `Dialogue`, `Ending`, `Menu`, `components/narrative/`, `components/dev/`) não introduziram literal novo — checado nesta revisão. |
| D3 | **Parcialmente fechado.** `TypewriterText` e `CluesModal` foram extraídos para `components/narrative/` durante a etapa 6 — não porque a frente foi aberta de propósito, mas porque as duas telas que os duplicavam estavam sendo reescritas de qualquer forma, e manter a duplicação exigiria a mesma edição duas vezes. `ChoiceList` também foi extraído, novo. Segue aberto: nenhum outro componente do projeto foi auditado por duplicação. |
| D4 | Durações e easings de animação hardcoded em cada arquivo, `theme/motion` inexistente. As telas v2 seguem o mesmo padrão das anteriores — não piorou nem melhorou. |
| D5 | Zero áudio no jogo apesar de `expo-av` instalado (e depreciado). |
| D6 | Sem acessibilidade sistemática: sem `reduce-motion`, sem controle de velocidade de texto. **Progresso pontual na v2:** `ChoiceList`, `DevInspector` e as telas reescritas usam `accessibilityRole`/`accessibilityLabel`/`accessibilityState` onde fazia sentido no que foi tocado — não é uma auditoria completa, e o restante do app segue sem cobertura sistemática. |
| D7 | **Fechado.** Zero testes → 196 testes (`npm test`), cobrindo engine, store, persistência e validador. Não há teste de tela — ver D11. |
| D8 | `nordeste.ts` (v1) continua com 2096 linhas em arquivo único, preservado morto por decisão explícita (§12 do prompt de reescrita: não gastar esforço convertendo-o). A fatia v2 já nasceu dividida em `data/regions/nordeste/{qualities,scenes,dialogues,npcs,clues,endings,dex,meta}.ts` — o padrão que a reescrita de conteúdo deve seguir. |
| D9 | **Decidido: removido do escopo desta versão.** `Battle` foi apagado — confronto por número não existe nesta versão. O clímax é escolha sob pressão (`nordeste_noite` na fatia v2 é o padrão a seguir). Registrado em [docs/FUTURE.md](docs/FUTURE.md). |
| D10 | **Novo.** Algumas telas (`Menu`, `Map`, `ComingSoonRegion`, `Catalog`/`DexRegistros`) importam `REGION_REGISTRY`/`REGION_LABELS` de `@/data/regions` direto, para nome de região e título de pista/NPC — violando a regra do §3.2 de que telas não leem `@/data` direto. Não há hoje um seletor de store que exponha isso; criar um (`useRegionLabel`, ou expor via `progressStore`) e migrar os quatro pontos. |
| D11 | **Novo.** Nenhuma tela tem teste automatizado — não existe `@testing-library/react-native` nem `jest` no projeto, e instalá-los é frente própria. A mitigação estrutural é que as telas ficam finas e toda decisão vive no store (coberto pelos 196 testes); o que falta cobertura é a fiação tela↔store↔navegação. Verificação atual é manual: jogar os quatro finais e fechar/reabrir o app no meio de uma partida. |

### 7.4 O que a reescrita da engine fechou

Registrado aqui porque §9 exige nota de migração em mudança de contrato:
**não havia save de jogador v1 a migrar.** O store v1 (`gameStore.ts`, apagado)
era zustand puro em memória — fechar o app já apagava tudo antes desta reescrita.
Nenhum progresso foi perdido porque nenhum progresso era salvo.

---

## 8. Roadmap

Fases em ordem de dependência. Não pule fase: cada uma remove um bloqueio da seguinte.
Nenhuma fase envolve backend ou rede — ver [docs/FUTURE.md](docs/FUTURE.md).

**Fase 1 — Fundação · concluída.** `REGION_REGISTRY` único; C1–C6 corrigidos;
componentes narrativos extraídos (D3 parcial); persistência versionada (B1).
`theme/` continua como alvo — D1/D2/D4 seguem abertos.

**Fase 2 — Engine narrativa · concluída.** `engine/` inteiro como funções puras
testáveis (`applyEffects`, `availableChoices`/`resolveScene`/`resolveLine`,
`resolveEnding`, `buildDexRecord`...); D9 decidido (confronto por número removido);
D7 fechado — 196 testes, playthroughs de ponta a ponta como o mais valioso.

**Fase 3 — Sistemas de experiência**
Implementar `docs/design/AUDIO.md`; formalizar `docs/design/MOTION.md` em presets;
transições de tela por semântica narrativa; acessibilidade sistemática (D6, hoje
só pontual nas telas v2); `theme/` completo (D1, D2, D4).

**Fase 4 — Expansão de conteúdo**
Norte, Centro-Oeste, Sudeste e Sul seguindo [docs/NARRATIVE.md](docs/NARRATIVE.md)
e o handoff de autoria (§9 daquele documento). A fatia vertical em
`data/regions/nordeste/` é o padrão estrutural a seguir — já nasceu dividida, D8
não se repete. `npm run validate` substitui a conferência manual do checklist.
Reescrever o conteúdo de Nordeste sobre a mesma fatia, trocando o texto provisório.

**Fase 5 — Polimento e lançamento**
Revisão de todos os finais de todas as regiões; auditoria de acessibilidade completa;
teste de tela real (D11) se a superfície do app justificar o investimento; QA de
ponta a ponta em dispositivo físico Android e iOS.

Só depois da Fase 5, considerar qualquer item de [docs/FUTURE.md](docs/FUTURE.md).

---

## 9. Qualidade

**Comandos** (`Frontend/`):

```bash
npm run dev          # expo start -c --tunnel
npx tsc --noEmit      # checagem de tipos
npm run lint          # eslint + prettier
npm test              # engine, store, persistência, validador — node puro
npm run validate      # 20 checagens de conteúdo; --strict promove aviso a erro
```

Exige **Node ≥ 22.18** (`package.json` `engines`) — `npm test` e `npm run validate`
rodam TypeScript direto via `scripts/node-loader.mjs`, sem build, e dependem de
type-stripping habilitado por padrão.

**Definição de pronto** para qualquer mudança:

- `npx tsc --noEmit`, `npm run lint`, `npm test` limpos.
- `npm run validate` limpo se a mudança tocou conteúdo (`src/data/regions/`).
- Zero cor, fonte, duração ou caminho de som literal em código de apresentação.
- Conteúdo novo não introduziu `if` em tela — nem em `screens/`, nem contornando
  a engine.
- Ids seguem §4.1.
- Se mudou um contrato (tipo, efeito, namespace de qualidade), este documento e
  [docs/NARRATIVE.md](docs/NARRATIVE.md) foram atualizados **no mesmo commit**.
- Caminho degradado testado quando a mudança envolve áudio ou animação.

**Commits:** `tipo: descrição em português` — `feat`, `fix`, `docs`, `refactor`,
`chore`, `content` (conteúdo narrativo novo), seguindo o histórico existente.
