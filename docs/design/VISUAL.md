# Sistema de Design Visual — Cordel / Xilogravura

> Direção estabelecida. Este documento é normativo: define os tokens e as regras
> que produzem a identidade do SACI. Ver [SYSTEM_DESIGN.md](../../SYSTEM_DESIGN.md).

## 1. A referência

O SACI se parece com um **folheto de cordel**: papel barato amarelado, capa impressa
em xilogravura, uma cor de tinta, traço bruto e contraste alto. Não se parece com um
app mobile moderno.

Isso implica escolhas que em outro projeto seriam "erradas":

| Fazemos | Não fazemos |
| --- | --- |
| Fundo de papel com textura | Fundo branco ou cinza liso |
| Uma tinta escura dominante | Paleta multicolor de UI |
| Bordas duras, cantos quase retos | Cantos muito arredondados |
| Vinheta e sujeira nas bordas | Superfícies limpas e uniformes |
| Assimetria e imperfeição propositais | Grid perfeitamente regular |
| Tipografia display com tracking largo | Sans-serif neutra de sistema |
| Divisores pontilhados, estrelas `✦`, filetes | Sombras difusas, glassmorphism |

**Teste de sanidade:** se a tela, impressa em preto e branco num papel de baixa
qualidade, ainda parecer um folheto de cordel — está certa.

## 2. Cor

Fonte única: `src/theme/colors.ts` (hoje `src/constants/colors.ts`).

### 2.1 Papel e tinta

| Token | Valor | Uso |
| --- | --- | --- |
| `background.base` | `#EDE1C4` | Papel padrão de toda tela |
| `background.baseSoft` | `#E2D4B0` | Cartões, superfícies elevadas |
| `background.baseDark` | `#CFC09A` | Papel envelhecido, estados desabilitados |
| `background.tabBar` | `#120D07` | Tinta cheia — tab bar, blocos sólidos |
| `text.primary` | `#1A0F06` | Tinta de impressão — corpo e títulos |
| `text.secondary` | `#4A3520` | Apoio, metadados |
| `text.muted` | `#7A5C38` | Legendas, texto inativo |
| `text.onDark` | `#EDE1C4` | Papel sobre tinta |

### 2.2 Acentos narrativos

| Token | Valor | Semântica |
| --- | --- | --- |
| `buttons.primary` | `#1A0F06` | Ação principal — bloco de tinta |
| `buttons.secondary` | `#3D2210` | Ação secundária — couro |
| `buttons.battle` | `#B5311F` | Perigo, confronto |
| `buttons.inventory` | `#2E4A3E` | Ferramenta, inventário |

### 2.3 Acentos regionais

Cada região tem uma tinta, usada em pin do mapa, borda de card e rótulo do catálogo.

| Região | Valor | Origem |
| --- | --- | --- |
| Norte | `#4A6B35` | verde de mata fechada |
| Nordeste | `#8B5A1E` | ocre seco do sertão |
| Centro-Oeste | `#6B5828` | terra dourada do cerrado |
| Sudeste | `#7A3828` | terracota colonial |
| Sul | `#385868` | azul frio das araucárias |

> **Dívida ativa (D2):** `components/creatureCards.tsx` mantém um `REGION_ACCENT`
> paralelo com valores diferentes destes. Consolidar em `theme/colors` e chavear por
> `RegionId`, não por nome de exibição.

### 2.4 Regras

- Opacidade se expressa por sufixo hex sobre a tinta (`${accent}55`), preservando a
  sensação de tinta diluída. Não use `opacity` no container quando o alvo é a cor.
- Vinheta: `rgba(42,28,14,0.55)` forte (topo/base), `rgba(42,28,14,0.28)` suave (laterais).
- **Proibido** hex literal fora de `theme/`.
- Sem modo escuro. O papel é o produto. `userInterfaceStyle: "light"` está fixo.

## 3. Tipografia

| Família | Arquivo | Papel |
| --- | --- | --- |
| `Xilosa` | `assets/fonts/xilosa/xilosa_.ttf` | Títulos, nomes de criatura, rótulos, botões |
| `CordelRustika-Regular` | `assets/fonts/cordel_rustika/` | Corpo, narração, descrição |
| `CordelRustika-Italic` | idem | Fala interior, sussurro, dica |
| `serif` (sistema) | — | Numeração e metadados discretos |

Escala (`theme/typography`): `xs 10 · sm 12 · md 16 · lg 20 · xl 26 · display 36`.
Tracking: `tight 0.3 · normal 1 · wide 1.5 · ultraWide 4`.

**Regras**

- Título é `Xilosa` em caixa alta com tracking `wide`+. É o gesto que carrega a identidade.
- Narrativa é `CordelRustika-Regular`, `md`, line-height ≥ 1.5 — texto longo se lê muito.
- Nunca use `fontWeight: bold` para dar ênfase em `Xilosa`: ela já é display. Ênfase se
  faz com tracking, caixa e escala.
- `useFonts` bloqueia o render até carregar ([App.tsx](../../Frontend/App.tsx)); toda
  fonte nova entra em `FONT_ASSETS`.

## 4. Espaço e forma

`theme/spacing`: `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32`.
Raios: `sm 4 · md 8 · lg 12`. Nunca acima de 12 — cordel não tem canto redondo.
Bordas: `1px` como padrão, `3px` para a faixa de acento no topo de um card.

## 5. Componentes canônicos

Todos vivem em `src/components/` e são a única forma correta de montar uma tela.

| Componente | Papel |
| --- | --- |
| `ScreenVignette` | Vinheta de quatro lados. **Obrigatória em toda tela.** |
| `PaperSurface` | Superfície `baseSoft` com borda e raio corretos |
| `CordelDivider` | Filete + `✦` + filete — separador de seção |
| `NarrativeFrame` | Imagem da cena + caixa de texto narrativo |
| `TypewriterText` | Texto datilografado, toque revela tudo (§ MOTION) |
| `ChoiceList` | Lista de escolhas já filtrada pelo gating |
| `ClueModal` | Modal de pistas descobertas |
| `CreatureCard` | Card do FolcloreDex, com estado bloqueado |

> **Dívida ativa (D3):** `TypewriterText` e `CluesModal` estão duplicados entre
> `screens/Scenario` e `screens/Dialogue`. Extrair para `components/narrative/`.

## 6. Ícones

PNGs em par obrigatório: `Nome.png` (claro, para fundo escuro) e `NomeDark.png`
(escuro, para papel), registrados em `ICONS` / `ICONS_DARK`. Todo ícone novo entra nos
dois mapas. Tamanho padrão 32×32, `resizeMode="contain"`.

Não introduza biblioteca de ícones vetoriais: a assinatura xilográfica vem do traço
irregular dos PNGs. (`@expo/vector-icons` em `Inventory` é um resquício a remover — C8.)

## 7. Imagens de cena

`assets/scenario/{regionId}/{sceneId}.png`, mesma proporção dentro de uma região,
tratadas com a mesma paleta reduzida. Uma cena sem arte usa `PaperSurface` vazia com o
texto — nunca um placeholder colorido.

## 8. Acessibilidade

- Contraste tinta/papel supera 12:1 — mantenha assim ao criar tokens.
- Toda área tocável ≥ 44×44pt, com `accessibilityRole` e `accessibilityLabel`.
- A cor **nunca** é o único portador de informação: acento regional sempre acompanha
  rótulo em texto.
- Velocidade do texto datilografado é ajustável (`settingsStore`) e o toque sempre
  revela a fala inteira.
