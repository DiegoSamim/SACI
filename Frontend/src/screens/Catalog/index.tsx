import React, { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    StatusBar,
    FlatList,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
    interpolate,
    Extrapolation,
    runOnJS,
} from "react-native-reanimated"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import { FOLKLORE_CREATURES } from "../../data/folkloreCreatures"
import CreatureCard from "@/components/creatureCards"

const { height } = Dimensions.get("window")

const CREATURE_IMAGES: Record<string, any> = {
    boitata: require("../../assets/cards/Boitata.png"),
    cabracabriola: require("../../assets/cards/CabraCabriola.png"),
    curupira: require("../../assets/cards/Curipira.png"),
    mulasemcabeca: require("../../assets/cards/MulaSemCabeça.png"),
    negrinhodopastoreio: require("../../assets/cards/NegrinhoDoPastoreio.png"),
}

const REGION_ACCENT: Record<string, string> = {
    Norte: "#5F7A4A",
    Nordeste: "#9A6A32",
    "Centro-Oeste": "#7D6B3E",
    Sudeste: "#8B4A3D",
    Sul: "#4E6773",
}

// ─── Modal completo ───────────────────────────────────────────────────────────
function CreatureDetailModal({
    creature,
    locked,
    onClose,
}: {
    creature: any
    locked: boolean
    onClose: () => void
}) {
    const imageKey =
        creature?.id
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\s_-]/g, "") ?? ""
    const image = CREATURE_IMAGES[imageKey]
    const accent = REGION_ACCENT[creature?.region] ?? "#7D6B3E"

    const imageScale = useSharedValue(0.96)
    const imageOpacity = useSharedValue(0)
    const sheetY = useSharedValue(56)
    const dragStartY = useRef(0)

    useEffect(() => {
        imageScale.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) })
        imageOpacity.value = withTiming(1, { duration: 220 })
        sheetY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) })
    }, [creature])

    const imageStyle = useAnimatedStyle(() => ({
        transform: [{ scale: imageScale.value }],
        opacity: imageOpacity.value,
    }))

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value }],
    }))

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: interpolate(sheetY.value, [0, height * 0.9], [0.55, 0], Extrapolation.CLAMP),
    }))

    const closeWithAnimation = () => {
        sheetY.value = withTiming(height, { duration: 180, easing: Easing.in(Easing.cubic) }, (finished) => {
            if (finished) {
                runOnJS(onClose)()
            }
        })
    }

    return (
        <Modal visible={!!creature} animationType="none" transparent statusBarTranslucent>
            {/* Backdrop */}
            <Animated.View
                style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(30,20,10,0.55)" }, backdropStyle]}
            >
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeWithAnimation} activeOpacity={1} />
            </Animated.View>

            {/* Sheet */}
            <Animated.View
                style={[styles.sheet, { borderTopColor: `${accent}44` }, sheetStyle]}
            >
                {/* Faixa de cor no topo */}
                <View style={[styles.sheetTopBorder, { backgroundColor: accent }]} />

                {/* Handle */}
                <View
                    style={styles.dragHandleArea}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={(event) => {
                        dragStartY.current = event.nativeEvent.pageY
                    }}
                    onResponderMove={(event) => {
                        const deltaY = event.nativeEvent.pageY - dragStartY.current
                        sheetY.value = Math.max(0, deltaY)
                    }}
                    onResponderRelease={(event) => {
                        const deltaY = event.nativeEvent.pageY - dragStartY.current

                        if (deltaY > 110) {
                            closeWithAnimation()
                            return
                        }

                        sheetY.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) })
                    }}
                    onResponderTerminate={() => {
                        sheetY.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) })
                    }}
                >
                    <View style={styles.handle} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    style={{ width: "100%" }}
                >
                    {/* Número */}
                    <Text style={[styles.modalNumber, { color: `${accent}88` }]}>
                        Nº {creature.id}
                    </Text>

                    {/* ── Card retangular grande ── */}
                    <Animated.View
                        style={[
                            styles.cardWrapper,
                            {
                                borderColor: locked ? "rgba(160,130,80,0.3)" : `${accent}55`,
                                backgroundColor: APP_COLORS.background.baseSoft,
                            },
                            imageStyle,
                        ]}
                    >
                        <View style={[styles.cardTopBorder, { backgroundColor: locked ? "#C8B090" : accent }]} />

                        {!locked && (
                            <View style={[styles.cardHalo, { backgroundColor: `${accent}14` }]} />
                        )}

                        {image ? (
                            <Image
                                source={image}
                                style={styles.cardImage}
                                resizeMode="contain"
                                blurRadius={locked ? 14 : 0}
                            />
                        ) : (
                            <View style={[styles.cardImagePlaceholder, { borderColor: `${accent}44` }]}>
                                <Text style={{ color: accent, fontSize: 48 }}>?</Text>
                            </View>
                        )}

                        {locked && (
                            <View style={styles.lockedCenter}>
                                <Text style={{ fontSize: 36 }}>🔒</Text>
                                <Text style={[styles.lockedCenterText, { color: `${accent}88` }]}>
                                    Ainda não catalogada
                                </Text>
                            </View>
                        )}

                        <View style={styles.cardBottomDecor}>
                            {Array.from({ length: 22 }).map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        { backgroundColor: locked ? "#C8B090" : `${accent}55` },
                                    ]}
                                />
                            ))}
                        </View>
                    </Animated.View>

                    {/* ── Divisor ── */}
                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: `${accent}44` }]} />
                        <Text style={[styles.dividerStar, { color: `${accent}88` }]}>✦</Text>
                        <View style={[styles.dividerLine, { backgroundColor: `${accent}44` }]} />
                    </View>

                    {/* ── Nome grande ── */}
                    <Text style={[styles.modalName, { color: locked ? "#B8A070" : APP_COLORS.text.primary }]}>
                        {locked ? "Criatura Desconhecida" : creature.name}
                    </Text>

                    {!locked ? (
                        <>
                            {/* Região e Habitat */}
                            <View style={styles.statsRow}>
                                <View style={[styles.statBox, { borderColor: `${accent}44` }]}>
                                    <Text style={styles.statLabel}>REGIÃO</Text>
                                    <Text style={[styles.statValue, { color: accent }]}>
                                        {creature.region}
                                    </Text>
                                </View>
                                <View style={[styles.statBox, { borderColor: `${accent}44` }]}>
                                    <Text style={styles.statLabel}>HABITAT</Text>
                                    <Text style={[styles.statValue, { color: accent }]} numberOfLines={2}>
                                        {creature.habitat}
                                    </Text>
                                </View>
                            </View>

                            {/* Descrição */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: APP_COLORS.text.muted }]}>
                                    Descrição
                                </Text>
                                <Text style={[styles.sectionBody, { color: APP_COLORS.text.secondary }]}>
                                    {creature.description}
                                </Text>
                            </View>

                            {/* Características */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: APP_COLORS.text.muted }]}>
                                    Características
                                </Text>
                                <View style={styles.charList}>
                                    {creature.characteristics.map((c: string) => (
                                        <View
                                            key={c}
                                            style={[styles.charItem, { borderLeftColor: accent }]}
                                        >
                                            <Text style={[styles.charText, { color: APP_COLORS.text.secondary }]}>
                                                {c}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Curiosidade */}
                            <View
                                style={[
                                    styles.curiosityBox,
                                    {
                                        borderColor: `${accent}44`,
                                        backgroundColor: `${accent}0D`,
                                    },
                                ]}
                            >
                                <Text style={[styles.curiosityTitle, { color: accent }]}>
                                    ✦ Curiosidade Cultural
                                </Text>
                                <Text style={[styles.sectionBody, { color: APP_COLORS.text.secondary }]}>
                                    {creature.curiosity}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.lockedMessage}>
                            Explore a região {creature.region} para desbloquear esta criatura e revelar seus segredos.
                        </Text>
                    )}
                </ScrollView>

                {/* Botão fechar */}
                <TouchableOpacity
                    onPress={closeWithAnimation}
                    style={[styles.closeButton, { borderColor: `${accent}44` }]}
                >
                    <Text style={[styles.closeText, { color: accent }]}>← Fechar</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function Catalog() {
    const [selected, setSelected] = useState<any | null>(null)
    const unlockedIds = ["boitata", 'cabra_cabriola', "curupira"] // Exemplo de IDs desbloqueados

    const total = FOLKLORE_CREATURES.length
    const unlocked = FOLKLORE_CREATURES.filter((c) => unlockedIds.includes(c.id)).length

    const titleOpacity = useSharedValue(0)
    const titleY = useSharedValue(6)

    useEffect(() => {
        titleOpacity.value = withTiming(1, { duration: 300 })
        titleY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) })
    }, [])

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleY.value }],
    }))

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
            <ScreenVignette />

            <View style={{ flex: 1, paddingHorizontal: 18 }}>

                {/* ── Header ── */}
                <Animated.View style={[styles.header, titleStyle]}>
                    <View style={styles.ornamentRow}>
                        <View style={styles.ornamentLine} />
                        <Text style={styles.ornamentStar}>✦</Text>
                        <View style={styles.ornamentLine} />
                    </View>

                    <Text style={[styles.headerTitle, { color: APP_COLORS.text.primary }]}>
                        Bestiário
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: APP_COLORS.text.muted }]}>
                        CRIATURAS DO FOLCLORE
                    </Text>

                    <View style={styles.progressRow}>
                        <Text style={[styles.progressText, { color: APP_COLORS.text.muted }]}>
                            {unlocked} / {total} catalogadas
                        </Text>
                        <View style={[styles.progressBar, { backgroundColor: "rgba(120,90,50,0.18)" }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(unlocked / total) * 100}%`,
                                        backgroundColor: "#9A6A32",
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={[styles.ornamentRow, { marginTop: 10 }]}>
                        <View style={styles.ornamentLine} />
                        <Text style={styles.ornamentStar}>✦</Text>
                        <View style={styles.ornamentLine} />
                    </View>
                </Animated.View>

                {/* ── Lista resumida ── */}
                <FlatList
                    data={FOLKLORE_CREATURES}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                    renderItem={({ item, index }) => {
                        const locked = !unlockedIds.includes(item.id)
                        return (
                            <CreatureCard
                                creature={item}
                                locked={locked}
                                index={index}
                                onPress={() => setSelected(item)}
                            />
                        )
                    }}
                />
            </View>

            {selected && (
                <CreatureDetailModal
                    creature={selected}
                    locked={!unlockedIds.includes(selected.id)}
                    onClose={() => setSelected(null)}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        paddingVertical: 16,
    },
    ornamentRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
        width: "100%",
    },
    ornamentLine: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(120,90,50,0.35)",
    },
    ornamentStar: {
        color: "rgba(120,90,50,0.6)",
        fontSize: 10,
        letterSpacing: 3,
    },
    headerTitle: {
        fontSize: 34,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 10,
        letterSpacing: 4,
        marginTop: 2,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
    },
    progressRow: {
        width: "100%",
        marginTop: 12,
        gap: 6,
    },
    progressText: {
        fontSize: 10,
        letterSpacing: 2,
    },
    progressBar: {
        width: "100%",
        height: 3,
        borderRadius: 2,
    },
    progressFill: {
        height: 3,
        borderRadius: 2,
    },

    // Sheet
    sheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.92,
        backgroundColor: APP_COLORS.background.base,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        overflow: "hidden",
        paddingHorizontal: 24,
        paddingBottom: 16,
        alignItems: "center",
    },
    sheetTopBorder: {
        height: 3,
        width: "100%",
        position: "absolute",
        top: 0,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(120,90,50,0.3)",
    },
    dragHandleArea: {
        width: "100%",
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 8,
    },
    modalNumber: {
        fontSize: 11,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        letterSpacing: 3,
        marginBottom: 12,
    },

    // Card no modal
    cardWrapper: {
        width: "100%",
        aspectRatio: 0.72,
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    cardTopBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    cardHalo: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cardImage: {
        width: "88%",
        height: "88%",
    },
    cardImagePlaceholder: {
        width: "70%",
        aspectRatio: 1,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    lockedCenter: {
        position: "absolute",
        alignItems: "center",
        gap: 10,
    },
    lockedCenterText: {
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        fontSize: 13,
        letterSpacing: 1,
        fontStyle: "italic",
    },
    cardBottomDecor: {
        position: "absolute",
        bottom: 10,
        left: 16,
        right: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },

    // Divisor
    divider: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerStar: {
        fontSize: 12,
    },

    // Info
    modalName: {
        fontSize: 30,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        gap: 4,
    },
    statLabel: {
        fontSize: 9,
        color: "#A89060",
        letterSpacing: 2,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
    },
    statValue: {
        fontSize: 14,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
    },
    section: {
        marginBottom: 20,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        letterSpacing: 3,
        textTransform: "uppercase",
    },
    sectionBody: {
        lineHeight: 22,
        fontSize: 14,
    },
    charList: {
        gap: 6,
    },
    charItem: {
        borderLeftWidth: 2,
        paddingLeft: 10,
        paddingVertical: 3,
    },
    charText: {
        fontSize: 13,
    },
    curiosityBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 16,
        gap: 8,
        marginBottom: 8,
    },
    curiosityTitle: {
        fontSize: 11,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        letterSpacing: 2,
        textTransform: "uppercase",
    },
    lockedMessage: {
        color: "#A89060",
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        textAlign: "center",
        fontSize: 14,
        lineHeight: 22,
        marginTop: 8,
        fontStyle: "italic",
    },

    // Fechar
    closeButton: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginTop: 8,
    },
    closeText: {
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        fontSize: 13,
        letterSpacing: 1.5,
    },
})