# Engine Narrativa — Como escrever uma região

> Guia normativo de autoria de conteúdo. Ver [SYSTEM_DESIGN.md](../SYSTEM_DESIGN.md) §4.

## 1. O modelo

Uma região é um **grafo de cenas**. O jogador se move por nós; cada aresta é uma escolha
com consequências. O estado que atravessa o grafo é: pistas descobertas, flags ligadas e
humor de cada NPC.

Não existe timer, não existe combate resolvido por número, não existe aleatoriedade.
Tudo é determinístico e legível no dado.

## 2. Tipos de nó

### `scenario_scene` — cenário narrado

```ts
{
  type: "scenario_scene",
  id: "nordeste_entrada",
  regionId: "nordeste",
  imageSource: require("@/assets/scenario/nordeste/nordeste_entrada.png"),
  narrativeText: "O sol de rachar castiga o sertão...",
  question: "O que você decide fazer?",
  choices: [ /* ChoiceOption[] */ ],
}
```

### `scenario_dialogue` — conversa com NPC

```ts
{
  type: "scenario_dialogue",
  id: "nordeste_dialogo_raimundo",
  regionId: "nordeste",
  npcId: "raimundo",
  npcName: "Seu Raimundo",
  npcRole: "Dono do bar",
  npcImageSource, backgroundImageSource,
  initialLineId: "abertura",
  lines: {
    abertura: { id: "abertura", text: "...", mood: "suspicious", choices: [...] },
  },
}
```

Navegação **dentro** de um diálogo usa `sceneId` com `#`: `{ type: "navigate",
sceneId: "nordeste_dialogo_raimundo#pergunta_cheiro" }`. A tela resolve o fragmento; o
store ignora ids com `#`.

## 3. Escolhas

```ts
{
  id: "perguntar_cheiro",
  text: "Perguntar sobre o cheiro estranho",
  requiresClues: ["cabra_cheiro"],          // só aparece com estas pistas
  requiresConditions: ["falou_com_senhora"], // só aparece com estas flags
  blockConditions: ["dialogo_raimundo_concluido"], // some se alguma estiver ligada
  consequences: [
    { type: "add_clue", clueId: "cabra_voz" },
    { type: "add_condition", condition: "dialogo_raimundo_concluido" },
    { type: "navigate", sceneId: "nordeste_cidade" },
  ],
}
```

**Ordem importa.** Consequências são aplicadas em sequência: registre pistas e flags
**antes** de navegar, para que a cena de destino já as veja.

## 4. Regras de autoria

1. **Toda cena tem saída.** Um nó sem escolha alcançável é um beco — o jogador trava.
2. **Toda pista tem origem.** Se `requiresClues: ["x"]` existe, algum caminho precisa
   conceder `x`. Pista órfã esconde conteúdo para sempre.
3. **Ida e volta não repete conteúdo.** Use `blockConditions` com a flag
   `{dialogo}_concluido` para que uma conversa já tida não reapareça idêntica.
4. **Toda região termina.** Precisa haver ao menos um caminho para
   `game_over: "catalogued"` (vitória) e caminhos plausíveis para `fled`, `caught`,
   `failed`.
5. **Escolha errada informa.** Um final ruim deve deixar claro *qual* leitura estava
   errada. Perder sem entender por quê é bug de design.
6. **Uma pista, um fato.** Pista é átomo de informação, não parágrafo. Se a descrição
   tem dois fatos, são duas pistas.
7. **Texto em PT-BR com voz regional.** A fala do NPC carrega o sotaque da região; a
   narração é sóbria e em segunda pessoa ("Você sente nos ossos").

## 5. Estrutura de arquivos

Uma região por diretório. `nordeste.ts` tem 1998 linhas em arquivo único — não repita
isso (dívida D8).

```
src/data/regions/nordeste/
  index.ts       // monta e exporta { meta, scenes, clues }
  meta.ts        // entrySceneId, endingSceneIds, creatureId, label
  clues.ts
  scenes.ts      // scenario_scene
  dialogues.ts   // scenario_dialogue
```

`meta.ts` remove a concatenação de ids do store (dívida C7):

```ts
export const NORDESTE_META = {
  regionId: "nordeste",
  label: "Nordeste",
  creatureId: "cabra_cabriola",
  entrySceneId: "nordeste_entrada",
  resumeSceneIds: {
    catalogued: "nordeste_catalogar",
    fled: "nordeste_cidade_game_over",
  },
} as const
```

Toda região é registrada em **um único lugar**, `src/data/regions/index.ts`:

```ts
export const REGION_REGISTRY: Record<RegionId, RegionContent> = {
  nordeste: NORDESTE,
  // norte: NORTE, ...
}
```

`REGION_REGISTRY` é a única fonte de cenas e pistas do app. Store, engine e telas leem
dele. Hoje existem quatro registros paralelos (dívida C3) — não crie um quinto.

## 6. Checklist de uma região nova

- [ ] `RegionId` existe no tipo e o registro aponta para o conteúdo
- [ ] `meta.ts` com entrada, finais e criatura
- [ ] Todas as pistas declaradas em `clues.ts` e referenciadas em alguma consequência
- [ ] Grafo sem beco: toda cena alcançável tem saída alcançável
- [ ] Caminho de vitória e ao menos dois de derrota
- [ ] Assets em `assets/scenario/{regionId}/` seguindo o nome do `sceneId`
- [ ] Criatura em `data/creatures.ts` com número, região, origem, comportamento
- [ ] Acento regional em `theme/colors` e pin no mapa
- [ ] Cada pista só é concedida pela(s) linha(s) de diálogo do NPC que
      plausivelmente a sabe — ver regra de exclusividade no §7
- [ ] Ambiência da região definida em `theme/audio` (Fase 3)
- [ ] Jogada de ponta a ponta pelos caminhos de vitória e de derrota

## 7. Nordeste — referência

Região completa e o padrão a imitar. Criatura: **Cabra Cabriola**.

**NPCs:** Seu Raimundo (dono do bar, desconfiado), Dona Conceição (idosa, religiosa,
guarda a reza), Franciscleison (criança de 9 anos, amigo de Pedro que desapareceu).

**As nove pistas** e quem as detém:

| Pista | Fato | Exclusiva de |
| --- | --- | --- |
| `cabra_noite` | Só age à noite | — |
| `cabra_criancas` | Caça crianças | — |
| `cabra_criancas_mal_educadas` | Prefere as desobedientes | — |
| `cabra_cheiro` | Cheiro de enxofre e bode | — |
| `cabra_voz` | Imita voz de conhecidos | `conceicao`, `franciscleison` |
| `cabra_reza` | Reza afasta | `conceicao` |
| `cabra_rastros` | Cascos bifurcados | — |
| `cabra_nome` | O nome: Cabra Cabriola | `conceicao` |
| `cabra_amigo_sumiu` | Pedro sumiu há três dias | `franciscleison` |

A exclusividade não é detalhe de implementação: é **design narrativo**. Só Dona
Conceição sabe o nome e a reza — é isso que torna encontrá-la necessário. Como todo
diálogo é roteirizado, a exclusividade é garantida simplesmente por **não escrever**
a consequência `add_clue` daquela pista em nenhuma linha de outro NPC — não existe
validação em tempo de execução porque não existe geração; o autor da região é quem
impõe a regra ao decidir onde cada `add_clue` aparece.
