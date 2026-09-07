# Sistema de Som

> **Status: especificação.** Nada de áudio existe no projeto hoje. Este documento
> define o alvo da Fase 3 — ver [SYSTEM_DESIGN.md](../../SYSTEM_DESIGN.md) §8.

## 1. Princípio

**O som é o sertão.** A imagem mostra o lugar; o som diz que ele está vivo e que algo
nele está errado. No SACI o áudio carrega tensão — é o canal por onde a criatura existe
antes de aparecer.

Duas consequências de projeto:

- **Silêncio é um instrumento.** Cortar a ambiência é o efeito mais forte do sistema.
  Reserve-o para o momento em que a criatura chega.
- **O jogo é 100% jogável mudo.** Nenhuma informação existe apenas no áudio. Toda pista
  sonora tem par visual ou textual.

## 2. Barramentos

Quatro buses, com volume independente e persistido em `settingsStore`.

| Bus | Conteúdo | Comportamento |
| --- | --- | --- |
| `music` | Trilha regional, tema do menu | Um por vez, crossfade de 1200ms |
| `ambience` | Vento, cigarra, rua, fogo | Loop contínuo, atrelado à cena |
| `sfx` | Toque, virada de página, pista, passo | Curto, pode sobrepor (até 4) |
| `voice` | Stingers de NPC e da criatura | Prioridade alta, faz ducking dos outros |

**Ducking:** ao tocar em `voice`, `music` e `ambience` caem para 35% em 200ms e voltam
em 600ms. Durante diálogo, `music` fica em 50% permanente — a fala é o foco.

## 3. Tokens

Fonte única: `src/theme/audio.ts`. Componente **nunca** faz `require` de som direto —
dispara um token semântico.

```ts
export const SFX = {
  ui: {
    choiceHover:  "ui/choice_hover",
    choiceSelect: "ui/choice_select",
    back:         "ui/back",
    pageTurn:     "ui/page_turn",     // abrir catálogo / modal de pistas
    typewriter:   "ui/type_tick",     // ver §5
  },
  narrative: {
    clueFound:      "narrative/clue_found",     // acorde curto, ascendente
    clueLocked:     "narrative/clue_locked",
    creatureUnlock: "narrative/creature_unlock", // recompensa maior
    moodShift:      "narrative/mood_shift",      // NPC muda de humor
    dread:          "narrative/dread",           // a criatura se aproxima
  },
  outcome: {
    catalogued: "outcome/catalogued",
    caught:     "outcome/caught",
    fled:       "outcome/fled",
    failed:     "outcome/failed",
  },
} as const

export const AMBIENCE: Record<RegionId, string> = {
  nordeste:     "ambience/caatinga",      // vento seco, cigarra, chocalho distante
  norte:        "ambience/floresta",      // insetos densos, água, pássaro
  centro_oeste: "ambience/cerrado",       // grilo, capim, fogo distante
  sudeste:      "ambience/estrada_rural", // sapo, casco, silêncio
  sul:          "ambience/campo",         // vento aberto, gado, fogo de chão
}
```

Variação: eventos frequentes (`choiceSelect`, `typewriter`) precisam de 3–4 amostras
alternadas com pitch de ±4% aleatório. Som repetido idêntico vira ruído irritante em
poucos minutos.

## 4. Paleta sonora

Como o visual é cordel, o som é **acústico e regional** — nada sintético.

| Elemento | Fontes |
| --- | --- |
| Trilha | Viola caipira, rabeca, zabumba, triângulo, sanfona. Escalas modais nordestinas |
| Ambiência | Campo gravado, não sample de biblioteca genérica |
| UI | Papel, madeira, metal velho. `pageTurn` é papel real |
| Criatura | Casco em terra batida, respiração grave, chocalho, voz processada |
| Stingers | Instrumento único, sem reverb de sala grande |

**Regra do Cabra Cabriola:** a voz da criatura imitando a mãe é o momento mais
importante do áudio do jogo. Deve ser humano, com um artefato sutil de errado.

## 5. Som e datilografia

O typewriter (ver [MOTION.md](MOTION.md) §4.1) pede um tick por caractere — o que a 28ms
seria insuportável. Regra:

- Toca no máximo **um tick a cada 3 caracteres**, e nunca em espaço ou pontuação.
- Volume baixo (−18dB do bus `sfx`).
- Corta imediatamente quando o toque revela o texto inteiro.
- Desligável de forma independente em `settingsStore.typewriterSound`.

## 6. Arquitetura

`src/services/audioService.ts` — única camada que fala com a biblioteca de áudio.

```ts
audio.playSfx(token, { volume?, pitchVariation? })
audio.setAmbience(regionId | null, { fadeMs })
audio.setMusic(track | null, { fadeMs })
audio.duck(durationMs)
audio.setBusVolume(bus, 0..1)
```

- **Biblioteca: `expo-audio`.** O `expo-av` está instalado mas **depreciado no SDK 54**;
  não construa em cima dele. `expo-video` continua correto para o splash.
- **Formato:** `.m4a` (AAC), mono para sfx, estéreo para ambiência e música.
  Alvo: sfx < 40KB, ambiência < 600KB em loop de ~30s.
- **Carregamento:** sfx de UI pré-carregados no boot; ambiência e trilha carregadas ao
  entrar na região e liberadas ao sair. Nada de bundle único gigante.
- **Ciclo de vida:** pausar tudo em background (`AppState`), retomar no foreground.
  Respeitar o switch de silencioso do iOS. Nunca interromper áudio de outro app.
- **Falha é silêncio.** Erro de carregamento loga e segue. Áudio nunca derruba uma tela.

## 7. Mapa de gatilhos

| Evento | Áudio |
| --- | --- |
| Splash | Tema do Saci, entra com o vídeo |
| Menu | Trilha do menu em loop |
| Entra numa região | Crossfade de `music` regional + `ambience` da região |
| Troca de cena | `ambience` conforme a cena (dia/noite muda a camada) |
| Escolha selecionada | `ui.choiceSelect` + háptico |
| Pista descoberta | `narrative.clueFound` + modal |
| NPC muda de humor | `narrative.moodShift`, sutil |
| Criatura se aproxima | **Ambiência corta.** Depois `narrative.dread` |
| Criatura captura | `outcome.caught`, tudo cheio |
| Criatura catalogada | `narrative.creatureUnlock` → `outcome.catalogued` |
| Abre catálogo/pistas | `ui.pageTurn` |

## 8. Acessibilidade e ajustes

`settingsStore.audio`: `master`, `music`, `ambience`, `sfx`, `voice`, `typewriterSound`.
Todos persistidos. Padrão: tudo ligado, `music` em 0.7, `ambience` em 0.6.

Nenhuma pista existe apenas em áudio (§1). Quando houver fala de NPC gravada, ela é
sempre acompanhada do texto — o texto é a fonte de verdade.
