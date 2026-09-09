# Engine Narrativa v2 — Como escrever uma região

> Guia normativo de autoria de conteúdo. Ver [SYSTEM_DESIGN.md](../SYSTEM_DESIGN.md) §4.
> Substitui integralmente a versão anterior deste documento — o modelo mudou de
> árvore com fechaduras para máquina de estado narrativo.

## 1. O modelo

Uma região é um **grafo de cenas** sobre um **estado numérico único**. O jogador se
move por nós; cada aresta é uma escolha com efeitos. Não existe timer, combate
resolvido por número, ou aleatoriedade — tudo é determinístico e legível no dado.

A mudança central em relação ao modelo anterior: **pistas não destravam mais
opções.** Uma pista muda **o que uma opção faz** e **qual texto aparece** — via
variante de texto e efeito, não via `requiresClues`. Se você está pensando em
"esconder uma escolha até o jogador saber X", pare: a pergunta certa é "que
variante de texto ou que efeito muda quando o jogador sabe X".

## 2. Estado: qualidades

```ts
type Qualities = Record<string, number>
```

Tudo é um número. Chave ausente vale `0` — nunca teste existência, teste valor.
Sete namespaces, dois deles prefixados por região (contrato completo no
`SYSTEM_DESIGN.md` §4.2):

| Prefixo | Uso | Prefixo de região? | Exemplo |
| --- | --- | --- | --- |
| `pista.` | conhecimento do investigador | não | `pista.cabra_voz` |
| `humor.` | humor de NPC, -3..+3 | não | `humor.raimundo` |
| `laco.` | relação acumulada com NPC | não | `laco.raimundo` |
| `mundo.` | estado da região | **sim** | `mundo.nordeste.ato` |
| `feito.` | histórico de ações | **sim** | `feito.nordeste.fugiu` |
| `visita.` | gerado pela engine, nunca declarado | — | `visita.nordeste_curral` |
| `meta.` | derivado pela engine, nunca escrito por conteúdo | — | `meta.tag_bom` |

`mundo.` e `feito.` levam o `regionId` porque um save atravessa as cinco regiões
— sem o prefixo, `mundo.ato` do Nordeste colidiria com `mundo.ato` do Norte no
mesmo save. `pista.` e `humor.` dispensam prefixo porque `clueId` e `npcId` já
são únicos **entre todas as regiões** (é regra, não coincidência — o validador
barra colisão).

### Vocabulário recomendado

Meta de autoria: ~15 chaves por região, fora `visita.`/`meta.`. Um vocabulário
que costuma bastar:

- `mundo.<regiao>.ato` — 0..N, avança em marcos narrativos, dispara `actAdvanced`
- `mundo.<regiao>.medo_vila` (ou equivalente) — termômetro do que a investigação
  perturbou, útil pra epílogo
- `humor.<npc>` com `faixas` — 3 a 5 nomes, cobrindo `min..max` sem buraco
- `laco.<npc>` — cresce com escolhas que custam algo ao jogador (pagar, admitir,
  ceder), não com qualquer interação
- `feito.<regiao>.<algo>` — um por ramificação relevante de comportamento
- `pista.<criatura>_<fato>` — uma por fato atômico; se a descrição carrega dois
  fatos, são duas pistas

### Registro de qualidades

```ts
{
  key: "humor.raimundo",
  default: 0, min: -3, max: 3,
  label: "Seu Raimundo",
  faixas: {
    hostil:    [-3, -2],
    fechado:   [-1, -1],
    neutro:    [ 0,  0],
    receptivo: [ 1,  2],
    cumplice:  [ 3,  3],
  },
}
```

`faixas` converte número em palavra sem espalhar `if` pela UI. **Cubra `min..max`
sem buraco e sem sobreposição** — a checagem C23 do validador pega os dois erros.

## 3. Condição

```ts
type Predicate = { key: string; op: "gte" | "lte" | "eq" | "neq"; value: number }
type Condition = { all?: Predicate[]; anyOf?: Predicate[][] }
```

`all` é AND. `anyOf` é OR de grupos AND — cada grupo interno é um caminho
inteiro, não um predicado solto. `all` e `anyOf` juntos exigem os dois.
`undefined`/`{}` é sempre verdadeiro. Sem aninhamento além disso: se um caso
pede mais, o problema é de roteiro, não de tipo.

## 4. Efeitos

Cinco, e só estes (§4.4 do `SYSTEM_DESIGN.md`): `set`, `adjust`, `navigate`,
`end_region`, `emit`. `navigate`/`end_region` só como **último** efeito do array
— o resto seria órfão (checagem C7). `go_back` não existe: voltar é uma escolha
autorada com `navigate` explícito.

Ordem importa: efeitos rodam em sequência, então registre pista/humor **antes**
de navegar, para que o destino já veja o efeito.

## 5. Cenas, variantes e escolhas

### Uma cena local completa, comentada

```ts
const CURRAL: LocalScene = {
  type: "local",
  id: "nordeste_curral",              // {regionId}_{slug} — checagem C8
  imagem: "nordeste_curral",          // chave de asset, NUNCA require() aqui —
                                       // quem resolve é components/narrative/sceneAssets.ts

  textos: [
    {
      // Revisita: `visita.<sceneId>` é gerado pela engine, nunca declarado.
      when: { all: [{ key: "visita.nordeste_curral", op: "gte", value: 2 }] },
      priority: 1,
      texto: "Os rastros continuam onde você os deixou.",
    },
    {
      // SEM `when` — obrigatório. Sem uma variante incondicional, pickVariant
      // pode devolver undefined e a cena sai com texto vazio (checagem C16).
      texto: "Cerca arrebentada de dentro para fora. Cascos bifurcados na poeira.",
      // Efeito da VARIANTE, aplicado ao ENTRAR na cena — é como uma pista por
      // exploração chega ao estado sem esperar a próxima escolha.
      effects: [
        { type: "set", key: "pista.cabra_rastros", value: 1 },
        { type: "adjust", key: "mundo.nordeste.medo_vila", by: 1 },
      ],
    },
  ],

  escolhas: [
    {
      // Saída incondicional — sem `when`/`hiddenWhen`/`lockedWhen`/`once`.
      // Toda LocalScene precisa de uma (checagem C3). Normalmente é "voltar".
      id: "curral_voltar",
      texto: "Voltar para a praça",
      effects: [{ type: "navigate", to: "nordeste_praca" }],
    },
  ],
}
```

### Um diálogo completo, comentado

```ts
const RAIMUNDO: DialogueScene = {
  type: "dialogo",
  id: "nordeste_dialogo_raimundo",     // {regionId}_dialogo_{npcId} — checagem C8
  npcId: "raimundo",
  linhaInicial: "abertura",
  linhaDeDespedida: "despedida",       // toda linha precisa de UMA que sirva de
                                       // saída sempre alcançável (checagem C4)

  linhas: {
    abertura: {
      id: "abertura",
      variantes: [
        // 3 variantes: humor alto > com pista > base. Desempate: priority desc
        // → nº de predicados desc → ordem de declaração.
        {
          when: { all: [{ key: "humor.raimundo", op: "gte", value: 2 }] },
          priority: 2,
          texto: "Senta aí. Faz três noites que eu não durmo.",
        },
        {
          when: { all: [{ key: "pista.cabra_rastros", op: "gte", value: 1 }] },
          priority: 1,
          texto: "Você foi no curral, né? Dá pra ver na bota.",
        },
        { texto: "O bar tá fechado. Tô limpando o balcão." }, // sem `when` — base
      ],
      escolhas: [
        {
          id: "raimundo_pagar_dose",
          texto: "Pagar uma dose e ficar calado",
          once: true,   // some depois de usada — a chave "já usada" é composta
                        // e gerada pela engine; nunca a remonte fora dela
          effects: [
            { type: "adjust", key: "humor.raimundo", by: 1 },
            { type: "adjust", key: "laco.raimundo", by: 1 },
            { type: "navigate", to: "nordeste_dialogo_raimundo#abertura" },
          ],
        },
        {
          id: "raimundo_perguntar_reza",
          texto: "Perguntar da reza que a mãe dele rezava",
          // Travada: aparece, responde com lockedText, NÃO altera estado.
          // É o que ensina o sistema — o jogador vê que existe caminho.
          lockedWhen: { all: [{ key: "humor.raimundo", op: "lte", value: 0 }] },
          lockedText: "Ele não vai falar da mãe com um estranho.",
          effects: [
            { type: "set", key: "pista.cabra_reza", value: 1 },
            { type: "navigate", to: "nordeste_dialogo_raimundo#a_reza" },
          ],
        },
        {
          id: "raimundo_sair",
          texto: "Agradecer e sair",
          effects: [{ type: "navigate", to: "nordeste_dialogo_raimundo#despedida" }],
        },
      ],
    },
    a_reza: {
      id: "a_reza",
      variantes: [{ texto: "Minha mãe rezava na soleira." }],
      escolhas: [
        { id: "a_reza_voltar", texto: "Continuar perguntando",
          effects: [{ type: "navigate", to: "nordeste_dialogo_raimundo#abertura" }] },
      ],
    },
    despedida: {
      id: "despedida",
      variantes: [{ texto: "Vai com Deus." }],
      // Precisa ter escolha própria — se ficar vazia, a rede de segurança da
      // engine (que injeta despedida quando não há escolha disponível) vira
      // um laço apontando para si mesma (checagem C4).
      escolhas: [
        { id: "despedida_sair", texto: "Sair do bar",
          effects: [{ type: "navigate", to: "nordeste_praca" }] },
      ],
    },
  },
}
```

Precedência de escolha: **oculta > travada > disponível**. Disponível é o
padrão e deve ser a maioria esmagadora; oculta só quando exibir já entrega a
revelação; travada ensina o sistema sem alterar nada.

## 6. Finais, epílogo e a ficha

```ts
{
  id: "nordeste_reza_na_soleira",
  nome: "A soleira que ninguém cruzou",
  tags: ["bom"],
  when: { all: [
    { key: "pista.cabra_reza", op: "gte", value: 1 },
    { key: "mundo.nordeste.ato", op: "gte", value: 2 },
  ] },
  priority: 10,
  texto: "Você rezou até o galo...",
  epilogo: ["vila"],       // slots resolvidos por um EpilogueFragment cada
}
```

Regras: **exatamente um** final sem `when` (fallback), **ao menos um** com tag
`bom`. `fuga` é a única tag que não cataloga — ver §4.6 do `SYSTEM_DESIGN.md`.
`fuga` deve ser alcançável, mas **evite** que toda saída da região a acione: se
o único caminho de encerramento antecipado sempre carrega `fuga`, o fallback
fica inalcançável na prática, mesmo passando no validador (que só confere
alcançabilidade estática — C22 — não a probabilidade de um caminho real chegar
lá).

Ficha do FolcloreDex (`dex.ts` da região): `lenda` (factual, fixa, nunca
parcial), `morais` (um `MoralFragment` por combinação de tags relevante, mais
**um fallback obrigatório** sem `tags` e sem `when`), `textoNaoRegistrado`
(explicação diegética para quando o final é `fuga`).

## 7. Checklist de região nova

- [ ] `RegionId` existe no tipo (`types/ids.ts`) e `REGION_REGISTRY` aponta
      para o conteúdo (`data/regions/index.ts`)
- [ ] `meta.ts`: `regionId`, `label`, `creatureId`, `entrySceneId`, `atoKey`,
      `epilogueSlots`
- [ ] Toda pista declarada em `clues.ts` tem origem em algum `effect`
- [ ] Grafo sem beco: toda cena alcançável a partir da entrada tem caminho até
      um `end_region`
- [ ] Ao menos um final `bom`, exatamente um fallback
- [ ] Ficha do Dex com as três seções, moral com fallback
- [ ] Assets em `assets/scenario/{regionId}/` seguindo o `sceneId`, resolvidos
      via chave em `components/narrative/sceneAssets.ts` — nunca `require()`
      dentro de `data/`
- [ ] Cada pista concedida só pela(s) linha(s) plausíveis — exclusividade é
      decisão de autoria, o validador não impõe isso
- [ ] `npm run validate` limpo, **inclusive em `--strict`**
- [ ] Jogada de ponta a ponta pelos caminhos de todos os finais

## 8. O validador — o que cada código pede

`npm run validate` roda 20 checagens sobre `REGION_REGISTRY`
([scripts/validate/rules.ts](../Frontend/scripts/validate/rules.ts)). Erros
(`C`) derrubam a validação; avisos (`A`) passam, salvo `--strict`. Uma linha por
código, ligando o que ele diz ao que consertar:

| Código | O que significa | Conserto |
| --- | --- | --- |
| C1 | `navigate.to` aponta para cena ou linha que não existe | corrija o id de destino, ou crie a cena/linha |
| C2 | cena inalcançável a partir de `entrySceneId` | ligue-a via `navigate` de algum lugar alcançável, ou apague-a |
| C3 | `LocalScene` sem escolha incondicional | acrescente uma escolha sem `when`/`hiddenWhen`/`lockedWhen`/`once` — normalmente "voltar" |
| C4 | `linhaDeDespedida` inexistente, inalcançável, ou sem escolha própria | garanta que ela existe, tem caminho até ela, e tem ao menos uma escolha autorada |
| C5 | uma `Condition` lê chave que nenhum `Effect` escreve | acrescente o `set`/`adjust` em algum lugar, ou corrija o nome da chave |
| C6 | chave usada mas não declarada no registro de qualidades (inclui `meta.atoKey`) | acrescente o `QualityDef`, ou corrija o typo |
| C7 | `navigate`/`end_region` no meio do array de efeitos | mova para o fim — o que vier depois é órfão |
| C8 | id fora do padrão do §4.1 do `SYSTEM_DESIGN.md` | renomeie seguindo `{regionId}_{slug}` (cena), `{regionId}_dialogo_{npcId}` (diálogo), ou a forma snake_case (npc/pista/linha) |
| C9 | pista declarada em `clues.ts` que nenhum efeito concede | acrescente o `set` que a revela, ou remova a pista |
| C10 | falta final `bom`, ou não há exatamente um fallback | acrescente/ajuste um `Ending` com a tag certa, ou corrija quantos ficam sem `when` |
| C11 | slot de epílogo referenciado sem fragmento fallback, ou fora de `meta.epilogueSlots` | acrescente o fragmento sem `when`, e/ou declare o slot no meta |
| C12 | ficha sem `lenda`, ou sem moral fallback | preencha a lenda (nunca parcial), acrescente um `MoralFragment` sem `tags`/`when` |
| C13 | `mundo.*`/`feito.*` sem o prefixo de região | prefixe: `mundo.<regionId>.algo` |
| C14 | `npcId`/`clueId`/`sceneId` repetido entre regiões diferentes | renomeie um dos dois — esses ids são únicos no projeto inteiro |
| C15 | conteúdo escrevendo em `meta.*`/`visita.*` | remova o efeito — só a engine escreve ali |
| C16 | bloco de variantes sem nenhuma sem `when` | acrescente uma variante base, sem `when`, no fim da lista |
| C21 | final cuja condição nenhum caminho alcança (análise estática grosseira) | verifique se algum efeito realmente escreve a chave alto/baixo o bastante para o operador |
| C22 | de uma cena alcançável não há caminho até nenhum `end_region` | conecte-a a um caminho que encerra, ou verifique se ela devia mesmo existir |
| C23 | faixas de humor com buraco, sobreposição, ou não cobrindo `min..max` | ajuste os intervalos para cobrir tudo sem sobrepor |
| C24 | chave `mundo.*`/`feito.*` com o `regionId` **errado** — provável copia-e-cola entre regiões | corrija o prefixo para o `regionId` desta região |
| A17 | qualidade declarada que nenhuma condição lê | está morta, ou falta um `when` que a use — confira se é intencional |
| A18 | qualidade declarada que nenhum efeito escreve | mesma coisa, do outro lado |
| A19 | linha de diálogo inalcançável | ligue-a via `navigate`, ou apague-a |
| A20 | `lockedWhen` sem `lockedText` | escreva o pensamento do investigador — travada sem texto não ensina nada |

## 9. Nordeste — a fatia vertical, referência estrutural

[Frontend/src/data/regions/nordeste/](../Frontend/src/data/regions/nordeste/)
é conteúdo **provisório** — marcado `// TEXTO PROVISÓRIO` em todo arquivo — mas
a estrutura de arquivos é o padrão a seguir: `meta.ts`, `qualities.ts`,
`scenes.ts`, `dialogues.ts`, `npcs.ts`, `clues.ts`, `endings.ts`, `dex.ts`,
`index.ts` montando tudo em `RegionContent`.

O conteúdo v1 completo — **texto definitivo, mas estrutura obsoleta** — está
preservado em
[Frontend/src/data/region/nordeste.ts](../Frontend/src/data/region/nordeste.ts):
Seu Raimundo (dono do bar, desconfiado), Dona Conceição (idosa, guarda a reza),
Franciscleison (criança, amigo de Pedro que desapareceu), e nove pistas com
exclusividade de origem definida por NPC. Reescrever o conteúdo de Nordeste é
migrar esse texto para a estrutura v2 — não reescrever a história do zero.
