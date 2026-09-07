# Sistema de Animação e Transições

> Ver [SYSTEM_DESIGN.md](../../SYSTEM_DESIGN.md) · [VISUAL.md](VISUAL.md) · [AUDIO.md](AUDIO.md)

## 1. Princípio

**Movimento é narração.** No SACI a animação não decora: ela controla a ordem em que o
jogador recebe a informação. O texto aparece antes das escolhas porque o jogador precisa
ler antes de decidir. A nuvem atravessa o mapa devagar porque o sertão é lento.

Corolário: se uma animação não muda o que o jogador entende ou sente, ela não deveria
existir.

## 2. Vocabulário estético

O papel é físico, a tinta é seca. O movimento herda isso:

- **Nada desliza sem peso.** Entradas usam spring com amortecimento alto (14/100) —
  chega e assenta, sem quicar.
- **Nada pisca.** Sem flash, sem strobe, sem pulso rápido de opacidade.
- **Respiração, não pulsação.** Elementos ambientes (nuvens, névoa, halo de card
  bloqueado) oscilam em `Easing.inOut(Easing.sin)` em ciclos de vários segundos.
- **O texto é datilografado**, caractere a caractere: é a máquina de escrever do
  cordelista, e é a assinatura de motion do projeto.

## 3. Tokens

Fonte única: `src/theme/motion.ts`. Nenhuma duração ou easing literal em componente.

```ts
export const MOTION = {
  duration: {
    instant: 120,   // feedback de toque
    fast:    240,   // entrada de item de lista
    normal:  400,   // transição de conteúdo
    slow:    620,   // revelação, shimmer
    scene:   900,   // troca de cena
    ambient: 26000, // nuvens, névoa
  },
  easing: {
    enter:   Easing.out(Easing.cubic),
    exit:    Easing.in(Easing.quad),
    move:    Easing.inOut(Easing.quad),
    breathe: Easing.inOut(Easing.sin),
  },
  spring: {
    settle: { damping: 14, stiffness: 100 }, // padrão de entrada
    snap:   { damping: 20, stiffness: 180 }, // resposta a toque
  },
  typewriter: {
    slow: 44, normal: 28, fast: 14,          // ms por caractere
  },
  stagger: 40,                               // atraso entre itens de lista
} as const
```

## 4. Coreografias canônicas

### 4.1 Entrada de cena narrativa

A sequência mais importante do jogo. Já implementada em `Scenario`/`Dialogue`,
a ser extraída para `NarrativeFrame`.

```
0ms     imagem da cena — fade in (normal, enter)
0ms     texto começa a datilografar (typewriter.normal)
        ↓ toque a qualquer momento revela o texto inteiro
+0ms    texto termina
+400ms  pausa deliberada — o jogador absorve
        escolhas entram: opacity → 1 (slow) + translateY 20 → 0 (spring.settle)
        cada escolha com stagger de 40ms
```

A pausa de 400ms é intencional: separa "receber a história" de "decidir". Não remova.

### 4.2 Lista (catálogo, pistas)

Item `i` entra em `opacity 0→1` + `scale 0.98→1` com atraso `i * stagger`.
Card desbloqueado ganha um shimmer diagonal único (`slow`, `enter`) — celebração
discreta da descoberta. Card bloqueado respira em `breathe` num loop de 2.4s.

### 4.3 Ambiente

Nuvens do mapa em camadas de paralaxe: as do fundo são menores, mais lentas e mais
transparentes; as da frente maiores, mais rápidas, mais opacas. Cada faixa combina
translação horizontal, deriva vertical em ciclo dessincronizado, respiração de escala
e fade nas bordas — quatro ciclos de período diferente evitam padrão perceptível.
Referência viva: [MapCloudLayer.tsx](../../Frontend/src/components/MapCloudLayer.tsx).

### 4.4 Feedback de toque

Escala `1 → 0.97 → 1` em `spring.snap`, mais háptico. Escolha narrativa e pin de região
usam `Haptics.impactAsync(Medium)`; toques comuns, `Light`. Háptico sempre acompanha
uma mudança visível — nunca sozinho.

## 5. Transições entre telas

Semântica, não uniformidade. Configurar por rota no `Stack.Navigator`.

| De → Para | Transição | Por quê |
| --- | --- | --- |
| Splash → Menu | `fade` lento | o vídeo dissolve no papel |
| Menu → Mapa | `fade` | mudança de contexto |
| Mapa → Cenário | `fade` + escurecimento breve | entrar na história |
| Cenário ↔ Diálogo | `fade` rápido | mesma cena, outro plano |
| Qualquer → GameOver | `fade` lento com pausa | o fracasso precisa de peso |
| Cenário → Catálogo (vitória) | `slide` para cima | recompensa sobe |

Padrão atual (`animation: 'fade'` global) é o fallback aceitável até a fase 3.

## 6. Regras técnicas

- **Reanimated 4, sempre.** `useSharedValue` + `useAnimatedStyle` rodam na UI thread.
  Proibido animar com `setState` em `setInterval` — a única exceção é o typewriter, que
  manipula texto e não estilo.
- **Não anime layout.** `transform` e `opacity` apenas. Nada de animar `width`,
  `height`, `top`, `margin`.
- Toda animação em `useEffect` precisa limpar timers e intervals no unmount. Loops
  infinitos (`withRepeat(-1)`) são só para elementos ambientes.
- Anime dentro de `Animated.View`; o `pointerEvents="none"` é obrigatório em camadas
  decorativas (vinheta, nuvens, névoa).
- Alvo: 60fps em aparelho Android de entrada. Camada ambiente com mais de ~8 elementos
  animados simultâneos precisa ser medida antes de entrar.

## 7. Acessibilidade

`settingsStore.reduceMotion` (espelhando `AccessibilityInfo.isReduceMotionEnabled`):

- Loops ambientes param; elementos ficam em estado de repouso.
- Translação e escala viram `0`; **opacidade é preservada** — a coreografia narrativa
  continua legível, só perde o deslocamento.
- Typewriter passa a revelar o texto inteiro de imediato.

A velocidade do typewriter é configurável (`slow`/`normal`/`fast`) e o toque sempre
completa a fala. Isso não é opcional: leitura é o núcleo do jogo.
