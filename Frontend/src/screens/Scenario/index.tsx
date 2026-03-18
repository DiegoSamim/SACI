import React, { useEffect, useRef, useState } from "react"
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
    FadeIn,
    FadeInDown,
    FadeInUp,
} from "react-native-reanimated"
import { RootStackParamList } from "../../types/navigation"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import { useGameStore, useChoiceResolver } from "../../store/gameStore"
import { NORDESTE_CLUES } from "../../data/region/nordeste"
import { Clue, ScenarioScene, ChoiceOption, RegionId } from "../../types/narrative"
import { ICONS_DARK } from "@/constants/icons"

type ScenarioNavigationProp = NativeStackNavigationProp<RootStackParamList, "Scenario">
type ScenarioRouteProp = RouteProp<RootStackParamList, "Scenario">

// ─── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({
    text, speed = 28, style, onDone,
}: {
    text: string; speed?: number; style?: any; onDone?: () => void
}) {
    const [displayed, setDisplayed] = useState("")
    const indexRef = useRef(0)

    useEffect(() => {
        setDisplayed("")
        indexRef.current = 0
        const interval = setInterval(() => {
            indexRef.current += 1
            setDisplayed(text.slice(0, indexRef.current))
            if (indexRef.current >= text.length) {
                clearInterval(interval)
                onDone?.()
            }
        }, speed)
        return () => clearInterval(interval)
    }, [text])

    return <Text style={style}>{displayed}</Text>
}

// ─── Modal de pistas ─────────────────────────────────────────────────────────
function CluesModal({
    visible, onClose, clueIds,
}: {
    visible: boolean; onClose: () => void; clueIds: string[] | undefined
}) {
    // Resolve ids para objetos Clue — centralizado em NORDESTE_CLUES por ora
    const ALL_CLUES: Record<string, Clue> = { ...NORDESTE_CLUES }
    const clues = clueIds?.map((id) => ALL_CLUES[id]).filter(Boolean)

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
export default function Scenario() {
    const store = useGameStore()
    const { makeChoice, availableChoices } = useChoiceResolver()
    const navigation = useNavigation<ScenarioNavigationProp>()
    const route = useRoute<ScenarioRouteProp>()

    const regionId = (route.params?.regionName?.toLowerCase().replace(" ", "_") ?? "nordeste") as RegionId
    const currentScene = store.getCurrentScene()
    const progress = store.activeRegion

    useEffect(() => {
        if (
            !store.activeRegion ||
            store.activeRegion.regionId !== regionId ||
            store.activeRegion.outcome !== "playing"
        ) {
            store.startRegion(regionId)
        }
    }, [regionId, store.activeRegion?.regionId, store.activeRegion?.outcome])


    const [narrativeDone, setNarrativeDone] = useState(false)
    const [showChoices, setShowChoices] = useState(false)
    const [showClues, setShowClues] = useState(false)

    const choicesOpacity = useSharedValue(0)
    const choicesY = useSharedValue(20)
    const lupaScale = useSharedValue(1)

    // Reinicia animações de escolhas quando a cena muda
    useEffect(() => {
        setNarrativeDone(false)
        setShowChoices(false)
        choicesOpacity.value = 0
        choicesY.value = 20
    }, [progress?.currentSceneId])

    useEffect(() => {
        if (narrativeDone) {
            setTimeout(() => {
                setShowChoices(true)
                choicesOpacity.value = withTiming(1, { duration: 500 })
                choicesY.value = withSpring(0, { damping: 14, stiffness: 100 })
            }, 400)
        }
    }, [narrativeDone])

    // Reage ao outcome da engine
    useEffect(() => {
        if (progress?.outcome === "catalogued") {
            navigation.navigate("MainTabs")
        }
        if (progress?.outcome === "fled") {
            navigation.navigate("MainTabs")
        }
        if (progress?.outcome === "failed" || progress?.outcome === "caught") {
            navigation.navigate("GameOver")
        }
    }, [progress?.outcome, navigation])

    // Se a cena atual for um diálogo, redireciona para a tela de Dialogue
    useEffect(() => {
        if (currentScene?.type === "scenario_dialogue") {
            navigation.navigate("Dialogue", {
                npcId: currentScene.id,
            })
        }
    }, [currentScene?.id])

    const choicesStyle = useAnimatedStyle(() => ({
        opacity: choicesOpacity.value,
        transform: [{ translateY: choicesY.value }],
    }))

    const lupaStyle = useAnimatedStyle(() => ({
        transform: [{ scale: lupaScale.value }],
    }))

    const handleChoice = (choice: ChoiceOption) => {
        makeChoice(choice)
    }

    const handleLupaPress = () => {
        lupaScale.value = withSequence(
            withTiming(0.88, { duration: 100 }),
            withSpring(1, { damping: 10, stiffness: 200 })
        )
        setShowClues(true)
    }

    if (!progress) return null
    if (!currentScene || currentScene.type !== "scenario_scene") return null
    const scene = currentScene as ScenarioScene
    const choices = availableChoices(scene.choices)

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
            <ScreenVignette />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <Animated.Text
                    entering={FadeInDown.duration(500)}
                    style={[styles.regionTitle, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}
                >
                    {route.params?.regionName ?? "Região"}
                </Animated.Text>

                <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.ornamentRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.ornamentStar}>◆</Text>
                    <View style={styles.dividerLine} />
                </Animated.View>

                {/* Imagem do cenário */}
                <Animated.View entering={FadeIn.delay(150).duration(600)} style={styles.scenarioImageWrapper}>
                    {scene.imageSource ? (
                        <Image source={scene.imageSource} style={styles.scenarioImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.scenarioImagePlaceholder}>
                            <View style={styles.scenarioImageTop}>
                                <Text style={styles.scenarioMoon}>☽</Text>
                                <Text style={styles.scenarioStar}>✦</Text>
                                <Text style={styles.scenarioStar}>✦</Text>
                            </View>
                            <Text style={styles.scenarioImageLabel}>{route.params?.scenarioName ?? ""}</Text>
                        </View>
                    )}
                    
                </Animated.View>

                {/* Texto narrativo */}
                <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.narrativeBox}>
                    <TypewriterText
                        text={scene.narrativeText}
                        speed={30}
                        style={[styles.narrativeText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}
                        onDone={() => setNarrativeDone(true)}
                    />
                </Animated.View>

                {/* Pergunta + Escolhas */}
                {showChoices && (
                    <Animated.View style={[choicesStyle, { width: "100%" }]}>
                        <View style={[styles.ornamentRow, { marginBottom: 14 }]}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.ornamentStar}>✦</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {scene.question && (
                            <Text style={[styles.questionText, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
                                {scene.question}
                            </Text>
                        )}

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
                                            <Text style={[styles.choiceText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
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
                <TouchableOpacity onPress={handleLupaPress} style={styles.lupaTouchable} activeOpacity={1}>
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
                clueIds={progress?.discoveredClues}
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
    imageBorderBottom: { flexDirection: "row", backgroundColor: "#1A0F06", justifyContent: "space-around", paddingHorizontal: 8, paddingBottom: 6 },
    borderTriangle: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 14, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: APP_COLORS.background.base },
    narrativeBox: { width: "100%", marginBottom: 8, paddingHorizontal: 4 },
    narrativeText: { fontSize: 17, lineHeight: 28, textAlign: "center", color: APP_COLORS.text.secondary, letterSpacing: 0.3 },
    questionText: { fontSize: 18, color: APP_COLORS.text.primary, textAlign: "center", marginBottom: 18, letterSpacing: 1 },
    choicesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, width: "100%" },
    choiceWrapper: { width: "48%" },
    choiceButton: { backgroundColor: APP_COLORS.buttons.primary, borderRadius: 6, padding: 2, shadowColor: APP_COLORS.text.primary, shadowOffset: { width: 2, height: 3 }, shadowOpacity: 0.4, shadowRadius: 0, elevation: 4, minHeight: 72, justifyContent: "center" },
    choiceInnerBorder: { borderWidth: 1, borderColor: "rgba(237,225,196,0.15)", borderRadius: 4, paddingVertical: 14, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flex: 1 },
    choiceText: { color: "#EDE1C4", fontSize: 14, textAlign: "center", lineHeight: 20, letterSpacing: 0.5 },
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