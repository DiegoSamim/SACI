import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  Modal,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Easing,
} from "react-native-reanimated"
import { RootStackParamList } from "../../types/navigation"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import { useGameStore, useChoiceResolver } from "../../store/gameStore"
import { NORDESTE_CLUES } from "../../data/region/nordeste"
import { Clue, ChoiceOption, ScenarioDialogue, NPCMood } from "../../types/narrative"
import { ICONS_DARK } from "@/constants/icons"
import { fetchNPCResponse } from "../../services/npcApi"

type DialogueNavigationProp = NativeStackNavigationProp<RootStackParamList, "Dialogue">
type DialogueRouteProp = RouteProp<RootStackParamList, "Dialogue">

// Cor da borda/ornamentos por humor — reflete no visual da caixa
const MOOD_COLOR: Record<string, string> = {
  neutral: APP_COLORS.text.primary,
  friendly: "#5F7A4A",
  suspicious: "#9A6A32",
  angry: "#B5311F",
  scared: "#4E6773",
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({
  text,
  speed = 28,
  style,
  onDone,
}: {
  text: string
  speed?: number
  style?: any
  onDone?: () => void
}) {
  const [displayed, setDisplayed] = useState("")
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finishedRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const revealAll = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    indexRef.current = text.length
    setDisplayed(text)
    onDoneRef.current?.()
  }

  useEffect(() => {
    setDisplayed("")
    indexRef.current = 0
    finishedRef.current = false

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        revealAll()
      }
    }, speed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, speed])

  return (
    <TouchableOpacity onPress={revealAll} activeOpacity={1}>
      <Text style={style}>{displayed}</Text>
    </TouchableOpacity>
  )
}

// ─── Três pontinhos enquanto a IA "pensa" ─────────────────────────────────────
function ThinkingDots({ color }: { color: string }) {
  const dot1 = useSharedValue(0.3)
  const dot2 = useSharedValue(0.3)
  const dot3 = useSharedValue(0.3)

  useEffect(() => {
    const animDot = (val: typeof dot1, delay: number) => {
      val.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        )
      )
    }
    animDot(dot1, 0)
    animDot(dot2, 160)
    animDot(dot3, 320)
  }, [])

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }))
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }))
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }))

  return (
    <View style={styles.dotsRow}>
      {[s1, s2, s3].map((s, i) => (
        <Animated.View
          key={i}
          style={[styles.thinkingDot, { backgroundColor: color }, s]}
        />
      ))}
    </View>
  )
}

// ─── Modal de pistas ──────────────────────────────────────────────────────────
function CluesModal({
  visible,
  onClose,
  clueIds,
}: {
  visible: boolean
  onClose: () => void
  clueIds: string[] | undefined
}) {
  const allClues: Record<string, Clue> = { ...NORDESTE_CLUES }
  const clues = clueIds?.map((id) => allClues[id]).filter(Boolean)

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <View style={styles.dividerLine} />
            <Text style={styles.modalHeaderStar}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={[styles.modalTitle, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
            Pistas Encontradas
          </Text>

          {clues?.length === 0 ? (
            <Text style={styles.modalEmpty}>Nenhuma pista encontrada ainda.</Text>
          ) : (
            clues?.map((clue) => (
              <View key={clue.id} style={styles.clueItem}>
                <Text style={styles.clueIcon}>{clue.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clueTitle, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
                    {clue.title}
                  </Text>
                  <Text style={[styles.clueDesc, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
                    {clue.description}
                  </Text>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text style={[styles.modalCloseText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
              Fechar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function Dialogue() {
  const store = useGameStore()
  const { makeChoice, availableChoices } = useChoiceResolver()
  const navigation = useNavigation<DialogueNavigationProp>()
  const route = useRoute<DialogueRouteProp>()

  const [currentLineId, setCurrentLineId] = useState<string | null>(null)
  const [narrativeDone, setNarrativeDone] = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [showClues, setShowClues] = useState(false)

  // ── Estados da integração com a API ──────────────────────────────────────
  const [displayedText, setDisplayedText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(false)
  const [currentMood, setCurrentMood] = useState<NPCMood>("neutral")

  const narrativeScrollRef = useRef<ScrollView | null>(null)

  const progress = store.activeRegion
  const currentScene = store.getCurrentScene()
  const scene = currentScene?.type === "scenario_dialogue"
    ? (currentScene as ScenarioDialogue)
    : null

  const lineId = currentLineId ?? scene?.initialLineId ?? null
  const line = lineId && scene ? scene.lines[lineId] : null

  // Auto-recupera caso currentLineId fique invalido por alguma transicao.
  useEffect(() => {
    if (!scene || !currentLineId) return
    if (!scene.lines[currentLineId]) {
      setCurrentLineId(scene.initialLineId)
    }
  }, [scene, currentLineId])

  // Texto que vai para o typewriter:
  // se a API retornou algo usa esse, caso contrário usa o texto estático da linha
  const textToShow = displayedText ?? line?.text ?? ""

  // Cor dos ornamentos/borda baseada no humor atual
  const moodColor = MOOD_COLOR[currentMood] ?? MOOD_COLOR.neutral

  const choicesOpacity = useSharedValue(0)
  const choicesY = useSharedValue(20)
  const lupaScale = useSharedValue(1)

  // ── Reset ao trocar de linha ────────────────────────────────────────────
  useEffect(() => {
    setNarrativeDone(false)
    setShowChoices(false)
    setApiError(false)
    choicesOpacity.value = 0
    choicesY.value = 20
  }, [line?.id, line?.text, choicesOpacity, choicesY])

  // ── Mostra escolhas após o texto terminar ───────────────────────────────
  useEffect(() => {
    if (!narrativeDone) return
    const timer = setTimeout(() => {
      setShowChoices(true)
      choicesOpacity.value = withTiming(1, { duration: 500 })
      choicesY.value = withSpring(0, { damping: 14, stiffness: 100 })
    }, 400)
    return () => clearTimeout(timer)
  }, [narrativeDone, choicesOpacity, choicesY])

  // ── Reage ao outcome do GameStore ───────────────────────────────────────
  useEffect(() => {
    if (progress?.outcome === "catalogued") {
      navigation.navigate("MainTabs", { screen: "Catalog" })
    }
    if (progress?.outcome === "fled") {
      navigation.navigate("MainTabs")
    }
    if (progress?.outcome === "failed" || progress?.outcome === "caught") {
      navigation.navigate("GameOver")
    }
  }, [progress?.outcome, navigation])

  // ── Inicializa linha e humor ao entrar na cena ──────────────────────────
  useEffect(() => {
    if (currentScene?.type === "scenario_scene") {
      navigation.goBack()
      return
    }
    if (currentScene?.type === "scenario_dialogue") {
      const routeLineId = route.params?.sceneId?.split("#")[1]
      const fallbackLineId = currentScene.initialLineId
      const nextLineId =
        routeLineId && currentScene.lines[routeLineId]
          ? routeLineId
          : fallbackLineId

      setCurrentLineId(nextLineId)

      const initialLine = currentScene.lines[nextLineId]
      if (initialLine) {
        setCurrentMood(initialLine.mood)
        store.setNPCMood(currentScene.npcId, initialLine.mood)
      }
    }
  }, [currentScene?.id, route.params?.sceneId, navigation])

  const choicesStyle = useAnimatedStyle(() => ({
    opacity: choicesOpacity.value,
    transform: [{ translateY: choicesY.value }],
  }))

  const lupaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lupaScale.value }],
  }))

  // ── Chama a API do backend ──────────────────────────────────────────────
  const callNPCApi = useCallback(async (
    choice: ChoiceOption,
    nextLineId: string | null
  ) => {
    if (!scene) return

    const npcId = scene.npcId
    const history = store.getConversationHistory(npcId)

    setIsLoading(true)
    setShowChoices(false)
    setNarrativeDone(false)

    // Registra a escolha do jogador no histórico
    store.addConversationMessage(npcId, {
      role: "player",
      content: choice.text,
      choice_id: choice.id,
    })

    try {
      const response = await fetchNPCResponse({
        npc_id: npcId,
        region_id: progress?.regionId ?? "nordeste",
        current_mood: currentMood,
        current_line_id: currentLineId ?? "",
        player_choice_text: choice.text,
        player_discovered_clues: progress?.discoveredClues ?? [],
        conversation_history: history,
        is_first_interaction: history.length === 0,
      })

      // Registra a resposta do NPC no histórico
      store.addConversationMessage(npcId, {
        role: "npc",
        content: response.generated_text,
        choice_id: null,
      })

      // Aplica pistas reveladas pela IA no GameStore
      response.revealed_clues.forEach((clueId: string) => store.addClue(clueId))

      // Atualiza humor
      const newMood = response.resulting_mood as NPCMood
      setCurrentMood(newMood)
      store.setNPCMood(npcId, newMood)

      // Define o texto que vai para o typewriter
      setDisplayedText(response.generated_text)
      setApiError(false)

      // Se a IA encerrou a conversa, volta após o texto terminar
      if (response.ends_conversation) {
        setTimeout(() => navigation.goBack(), 2800)
        return
      }

      if (nextLineId) setCurrentLineId(nextLineId)

    } catch (err) {
      console.error("[API Error]", err)
      setApiError(true)

      // Fallback: usa o texto estático da próxima linha
      if (nextLineId && scene.lines[nextLineId]) {
        const fallbackLine = scene.lines[nextLineId]
        setDisplayedText(fallbackLine.text)
        setCurrentMood(fallbackLine.mood)
        setCurrentLineId(nextLineId)
        store.setNPCMood(npcId, fallbackLine.mood)
      }
    } finally {
      setIsLoading(false)
    }
  }, [scene, currentLineId, currentMood, progress])

  // ── Lida com escolha do jogador ─────────────────────────────────────────
  const handleChoice = useCallback((choice: ChoiceOption) => {
    if (isLoading) return
    setShowChoices(false)

    const lineNavigation = choice.consequences.find(
      (c): c is Extract<typeof c, { type: "navigate" }> =>
        c.type === "navigate" && c.sceneId.includes("#")
    )

    // Consequências sem navegação interna (add_clue, game_over, go_back, navigate externo)
    const sideEffects = choice.consequences.filter(
      (c) => !(c.type === "navigate" && c.sceneId.includes("#"))
    )
    if (sideEffects.length > 0) {
      makeChoice({ ...choice, consequences: sideEffects })
    }

    // Navegação externa ou go_back — sai do diálogo
    const isExternalExit = choice.consequences.some(
      (c) =>
        c.type === "go_back" ||
        c.type === "game_over" ||
        (c.type === "navigate" && !c.sceneId.includes("#"))
    )
    if (isExternalExit) return

    // Navega internamente via API
    const nextLineId = lineNavigation
      ? lineNavigation.sceneId.split("#")[1] ?? null
      : null

    callNPCApi(choice, nextLineId)
  }, [scene, makeChoice, callNPCApi, isLoading])

  const handleLupaPress = () => {
    lupaScale.value = withSequence(
      withTiming(0.88, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    )
    setShowClues(true)
  }

  if (!progress || !scene) return null

  // Fallback de render para evitar tela vazia quando a linha alvo nao existe.
  const safeLine = line ?? scene.lines[scene.initialLineId]
  if (!safeLine) return null
  const choices = availableChoices(safeLine.choices)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <ScreenVignette />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Título — nome do NPC */}
        <Animated.Text
          entering={FadeInDown.duration(500)}
          style={[styles.regionTitle, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}
        >
          {scene.npcName}
        </Animated.Text>

        {/* Ornamento com cor do humor */}
        <Animated.View
          entering={FadeIn.delay(200).duration(400)}
          style={styles.ornamentRow}
        >
          <View style={[styles.dividerLine, { backgroundColor: moodColor, opacity: 0.4 }]} />
          <Text style={[styles.ornamentStar, { color: moodColor }]}>◆</Text>
          <View style={[styles.dividerLine, { backgroundColor: moodColor, opacity: 0.4 }]} />
        </Animated.View>

        {/* Imagem do cenário/NPC */}
        <Animated.View
          entering={FadeIn.delay(150).duration(600)}
          style={[styles.scenarioImageWrapper, { borderColor: moodColor }]}
        >
          {scene.backgroundImageSource ? (
            <Image
              source={scene.backgroundImageSource}
              style={styles.scenarioImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.scenarioImagePlaceholder}>
              <View style={styles.scenarioImageTop}>
                <Text style={styles.scenarioMoon}>☽</Text>
                <Text style={styles.scenarioStar}>✦</Text>
                <Text style={styles.scenarioStar}>✦</Text>
              </View>
              <Text style={styles.scenarioImageLabel}>{scene.npcRole}</Text>
            </View>
          )}
        </Animated.View>

        {/* Caixa de diálogo — loading ou typewriter */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.narrativeBox}
        >
          {isLoading ? (
            // NPC "pensando" — três pontinhos animados
            <View style={styles.loadingBox}>
              <ThinkingDots color={moodColor} />
            </View>
          ) : (
            <ScrollView
              ref={narrativeScrollRef}
              style={styles.narrativeScroll}
              contentContainerStyle={styles.narrativeScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              onContentSizeChange={() =>
                narrativeScrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {/* Badge sutil quando a API falhou e usou fallback */}
              {apiError && (
                <Text style={styles.apiErrorBadge}>⚠ resposta local</Text>
              )}

              <TypewriterText
                text={textToShow || safeLine.text}
                speed={30}
                style={[
                  styles.narrativeText,
                  { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular },
                ]}
                onDone={() => setNarrativeDone(true)}
              />
            </ScrollView>
          )}
        </Animated.View>

        {/* Escolhas */}
        {showChoices && !isLoading && (
          <Animated.View style={[choicesStyle, { width: "100%" }]}>
            <View style={[styles.ornamentRow, { marginBottom: 14 }]}>
              <View style={[styles.dividerLine, { backgroundColor: moodColor, opacity: 0.4 }]} />
              <Text style={[styles.ornamentStar, { color: moodColor }]}>✦</Text>
              <View style={[styles.dividerLine, { backgroundColor: moodColor, opacity: 0.4 }]} />
            </View>

            <Text style={[styles.questionText, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
              Como você responde?
            </Text>

            <View style={styles.choicesGrid}>
              {choices.map((choice, i) => (
                <Animated.View
                  key={choice.id}
                  entering={FadeInUp.delay(i * 80).duration(350)}
                  style={styles.choiceWrapper}
                >
                  <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={() => handleChoice(choice)}
                    activeOpacity={0.82}
                  >
                    <View style={styles.choiceInnerBorder}>
                      <Text
                        style={[
                          styles.choiceText,
                          { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular },
                        ]}
                      >
                        {choice.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Lupa */}
      <Animated.View style={[styles.lupaButton, lupaStyle]}>
        <TouchableOpacity
          onPress={handleLupaPress}
          style={styles.lupaTouchable}
          activeOpacity={1}
        >
          <Image source={ICONS_DARK.lupa} style={{ width: 32, height: 32 }} />
          {progress.discoveredClues.length > 0 && (
            <View style={styles.lupaBadge}>
              <Text style={styles.lupaBadgeText}>{progress.discoveredClues.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <CluesModal
        visible={showClues}
        onClose={() => setShowClues(false)}
        clueIds={progress.discoveredClues}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 24, alignItems: "center" },
  regionTitle: { fontSize: 36, color: APP_COLORS.text.primary, textAlign: "center", letterSpacing: 2, marginBottom: 6 },
  ornamentRow: { flexDirection: "row", alignItems: "center", width: "60%", gap: 8, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: APP_COLORS.text.primary, opacity: 0.25 },
  ornamentStar: { fontSize: 10, color: APP_COLORS.text.primary, opacity: 0.45 },
  scenarioImageWrapper: { width: "100%", marginBottom: 24, borderRadius: 4, overflow: "hidden", borderWidth: 2, borderColor: APP_COLORS.text.primary },
  scenarioImage: { width: "100%", height: 220 },
  scenarioImagePlaceholder: { width: "100%", height: 220, backgroundColor: "#1A0F06", alignItems: "center", justifyContent: "flex-end", paddingBottom: 20 },
  scenarioImageTop: { position: "absolute", top: 16, right: 24, flexDirection: "row", gap: 12, alignItems: "center" },
  scenarioMoon: { fontSize: 32, color: "#E8D0A0" },
  scenarioStar: { fontSize: 14, color: "#E8D0A0", opacity: 0.7 },
  scenarioImageLabel: { color: "#E8D0A0", fontFamily: "serif", fontSize: 18, opacity: 0.5, letterSpacing: 3 },
  narrativeBox: { width: "100%", marginBottom: 8, paddingHorizontal: 4, maxHeight: 190, minHeight: 118 },
  narrativeScroll: { width: "100%" },
  narrativeScrollContent: { paddingBottom: 2 },
  narrativeText: { fontSize: 17, lineHeight: 28, textAlign: "center", color: APP_COLORS.text.secondary, letterSpacing: 0.3 },

  // Loading
  loadingBox: { minHeight: 118, justifyContent: "center", alignItems: "center" },
  dotsRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  thinkingDot: { width: 9, height: 9, borderRadius: 5 },

  // Badge de erro
  apiErrorBadge: { fontSize: 9, color: APP_COLORS.text.muted, opacity: 0.45, textAlign: "center", marginBottom: 4, fontStyle: "italic" },

  questionText: { fontSize: 18, color: APP_COLORS.text.primary, textAlign: "center", marginBottom: 18, letterSpacing: 1 },
  choicesGrid: { width: "100%", gap: 10 },
  choiceWrapper: { width: "100%" },
  choiceButton: { backgroundColor: APP_COLORS.buttons.primary, borderRadius: 6, padding: 2, shadowColor: APP_COLORS.text.primary, shadowOffset: { width: 2, height: 3 }, shadowOpacity: 0.4, shadowRadius: 0, elevation: 4, minHeight: 72, justifyContent: "center" },
  choiceInnerBorder: { borderWidth: 1, borderColor: "rgba(237,225,196,0.15)", borderRadius: 4, paddingVertical: 14, paddingHorizontal: 12, alignItems: "stretch", justifyContent: "center", flex: 1 },
  choiceText: { color: "#EDE1C4", fontSize: 14, textAlign: "center", lineHeight: 20, letterSpacing: 0.5, width: "100%", flexShrink: 1 },
  lupaButton: { position: "absolute", bottom: 28, right: 22 },
  lupaTouchable: { width: 58, height: 58, borderRadius: 29, backgroundColor: APP_COLORS.buttons.primary, justifyContent: "center", alignItems: "center", shadowColor: APP_COLORS.text.primary, shadowOffset: { width: 2, height: 3 }, shadowOpacity: 0.45, shadowRadius: 0, elevation: 6, borderWidth: 2, borderColor: "rgba(237,225,196,0.15)" },
  lupaBadge: { position: "absolute", top: 0, right: 0, backgroundColor: APP_COLORS.buttons.battle, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  lupaBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(20,12,5,0.72)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: APP_COLORS.background.base, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 28, paddingBottom: 40, borderTopWidth: 3, borderTopColor: APP_COLORS.text.primary },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  modalHeaderStar: { fontSize: 10, color: APP_COLORS.text.primary, opacity: 0.4 },
  modalTitle: { fontSize: 22, color: APP_COLORS.text.primary, marginBottom: 20, letterSpacing: 2 },
  modalEmpty: { color: APP_COLORS.text.muted, fontSize: 14, fontStyle: "italic" },
  clueItem: { flexDirection: "row", gap: 14, marginBottom: 16, alignItems: "flex-start" },
  clueIcon: { fontSize: 22, marginTop: 2 },
  clueTitle: { fontSize: 15, color: APP_COLORS.text.primary, marginBottom: 3 },
  clueDesc: { fontSize: 13, color: APP_COLORS.text.secondary, lineHeight: 19 },
  modalClose: { marginTop: 8, alignSelf: "center", paddingHorizontal: 32, paddingVertical: 12, backgroundColor: APP_COLORS.buttons.primary, borderRadius: 6, shadowColor: APP_COLORS.text.primary, shadowOffset: { width: 2, height: 3 }, shadowOpacity: 0.4, shadowRadius: 0, elevation: 4 },
  modalCloseText: { color: "#EDE1C4", fontSize: 15, letterSpacing: 1.5 },
})