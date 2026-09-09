# SACI — Escopo adiado

> Ideias deliberadamente fora desta versão. Não devem influenciar decisões de
> arquitetura atuais. Referenciado por [SYSTEM_DESIGN.md](../SYSTEM_DESIGN.md),
> [CLAUDE.md](../CLAUDE.md) e [docs/NARRATIVE.md](NARRATIVE.md) — este arquivo
> não existia até a etapa 8 da reescrita da engine v2, apesar de ser citado
> desde antes; os links estavam quebrados.

## 1. IA generativa e NPCs com LLM

Todo diálogo desta versão é escrito à mão, roteirizado, determinístico. A ideia
adiada é um NPC cuja fala seja gerada em tempo real por um modelo de linguagem —
mantendo o humor (`humor.<npcId>`) e o laço (`laco.<npcId>`) como parâmetros que
influenciam o *prompt*, não a lógica.

Por que está fora: exige rede (viola o princípio 5 do `SYSTEM_DESIGN.md`), custo
por chamada, latência incompatível com a coreografia de motion, e — o motivo de
fundo — quebra o determinismo que o §5 do `SYSTEM_DESIGN.md` declara como
propriedade central do jogo. `EngineEvent` (§4.7) já é o gancho para isso: a
engine emite, um consumidor futuro decide o que fazer.

## 2. Backend, contas e nuvem

Sem servidor, sem autenticação, sem sincronização entre dispositivos. O save é
inteiramente local (`services/storage.ts`, AsyncStorage). Levar o progresso para
outro aparelho hoje significa levar o aparelho.

Por que está fora: princípio 5 do `SYSTEM_DESIGN.md` — o jogo é local e completo.
Um backend introduziria disponibilidade, custo de operação e superfície de dados
pessoais que este projeto, no estado atual, não tem por que assumir.

## 3. Moedas, progressão numérica de meta-jogo

Sem XP, sem desbloqueio por gasto, sem qualquer economia entre regiões. O
progresso entre regiões é só o que `GlobalProgress` já registra: a ficha do
FolcloreDex e a galeria de finais vistos.

## 4. O Saci — barramento consumido

`EngineEvent` (§4.7 do `SYSTEM_DESIGN.md`) existe desde a etapa 2 da reescrita,
com emissão e um subscriber vazio, mas **nenhuma lógica do Saci foi escrita**.
A ideia adiada: o Saci observa o barramento entre regiões — talvez reagindo a
`endingReached` acumulados, ou a padrões em `custom` — e ganha alguma presença
no capítulo final avaliado por `meta.regioes_concluidas` e os espelhos
`meta.tag_*` (§4.8 do `SYSTEM_DESIGN.md`).

Por que está fora: o prompt de reescrita da engine (§2) foi explícito — só o
barramento, não a lógica. Implementá-la exige decidir o que o Saci *é* antes de
decidir o que ele *faz*, e essa decisão não foi tomada.

## 5. Confronto por número (D9)

O modelo v1 tinha uma tela `Battle`, stub sem mecânica definida — dívida D9 do
`SYSTEM_DESIGN.md` §7. A reescrita da engine v2 decidiu: **removida**. `Battle`
foi apagada, junto com a rota.

O clímax desta versão é escolha sob pressão narrativa, resolvida por condição —
o padrão está em `nordeste_noite`, na fatia vertical de
[data/regions/nordeste/scenes.ts](../Frontend/src/data/regions/nordeste/scenes.ts):
chegar à cena já exige ter cruzado uma pista ou construído laço com um NPC, e a
escolha dentro dela é decidida sem número nenhum — sem HP, sem dado, sem timer.

Se confronto por número for reconsiderado no futuro, é mudança de engine: o
tipo `Effect` (§4.4) não tem hoje nenhum efeito que resolva por número, e
adicionar um exige o mesmo processo de qualquer efeito novo — tipo, resolver,
validador e este par de documentos, no mesmo commit.

---

Nada aqui deve ser construído antes da Fase 5 do roadmap (`SYSTEM_DESIGN.md` §8).
