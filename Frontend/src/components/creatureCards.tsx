import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay,
    Easing,
} from "react-native-reanimated"
import { APP_COLORS } from "../constants/colors"
import { TYPOGRAPHY } from "../constants/typography"
import { ICONS } from "@/constants/icons"

const CREATURE_IMAGES: Record<string, any> = {
    boitata: require("../assets/cards/Boitata.png"),
    cabracabriola: require("../assets/cards/CabraCabriola.png"),
    curupira: require("../assets/cards/Curipira.png"),
    mulasemcabeca: require("../assets/cards/MulaSemCabeça.png"),
    negrinhodopastoreio: require("../assets/cards/NegrinhoDoPastoreio.png"),
}

const REGION_ACCENT: Record<string, string> = {
    Norte: "#5F7A4A",
    Nordeste: "#9A6A32",
    "Centro-Oeste": "#7D6B3E",
    Sudeste: "#8B4A3D",
    Sul: "#4E6773",
}

type Props = {
    creature: any
    locked: boolean
    onPress: () => void
    index?: number
}

export default function CreatureCard({ creature, locked, onPress, index = 0 }: Props) {
    const scale = useSharedValue(0.98)
    const opacity = useSharedValue(0)
    const shimmerX = useSharedValue(-160)
    const glowPulse = useSharedValue(0.5)

    const imageKey = creature.id
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s_-]/g, "")
    const image = CREATURE_IMAGES[imageKey]
    const accent = REGION_ACCENT[creature.region] ?? "#7D6B3E"

    useEffect(() => {
        opacity.value = withDelay(index * 40, withTiming(1, { duration: 260 }))
        scale.value = withDelay(
            index * 40,
            withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) })
        )

        if (!locked) {
            shimmerX.value = withDelay(
                index * 40 + 180,
                withTiming(360, { duration: 620, easing: Easing.out(Easing.cubic) })
            )
        }

        if (locked) {
            glowPulse.value = withRepeat(
                withSequence(
                    withTiming(0.85, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0.45, { duration: 1200, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                false
            )
        }
    }, [])

    const cardStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }))

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerX.value }],
    }))

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowPulse.value,
    }))

    return (
        <Animated.View style={[cardStyle, { marginBottom: 14 }]}>
            <TouchableOpacity
                onPress={!locked ? onPress : undefined}
                activeOpacity={locked ? 1 : 0.82}
                style={[
                    styles.card,
                    {
                        borderColor: locked ? "rgba(160,130,90,0.2)" : `${accent}66`,
                        backgroundColor: APP_COLORS.background.baseSoft,
                    },
                ]}
            >
                {/* Faixa de cor no topo */}
                <View style={[styles.topBorder, { backgroundColor: locked ? "#C8B090" : accent }]} />

                <View style={styles.innerRow}>
                    {/* Info */}
                    <View style={styles.infoSide}>
                        {!locked ? (
                            <Text style={[styles.numberText, { color: locked ? "#B8A080" : `${accent}AA` }]}>
                                Nº {creature.number}
                            </Text>
                        ) : (
                            <Text style={[styles.numberText, { color: locked ? "#B8A080" : `${accent}AA` }]}>
                                Nº ????
                            </Text>
                        )}

                        <Text
                            style={[styles.name, { color: locked ? "#B8A080" : APP_COLORS.text.primary }]}
                            numberOfLines={2}
                        >
                            {locked ? "Criatura\nDesconhecida" : creature.name}
                        </Text>

                        {!locked ? (
                            <View style={[styles.regionTag, { borderColor: `${accent}55` }]}>
                                <Text style={[styles.regionText, { color: accent }]}>
                                    {creature.region.toUpperCase()}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.lockHint}>Explore para desbloquear</Text>
                        )}
                    </View>

                    {/* Imagem */}
                    <View style={styles.imageSide}>
                        {/* Halo retangular */}
                        {!locked ? (
                            <View style={[styles.imageHalo, { backgroundColor: `${accent}18` }]} />
                        ) : (
                            <Animated.View style={[styles.imageHalo, styles.lockedHalo, glowStyle]} />
                        )}

                        {image ? (
                            <Image
                                source={image}
                                style={[styles.image, locked && styles.imageLocked]}
                                resizeMode="contain"
                                blurRadius={locked ? 10 : 0}
                            />
                        ) : (
                            <View style={[styles.imagePlaceholder, { borderColor: `${accent}44` }]}>
                                <Text style={{ color: accent, fontSize: 28 }}>?</Text>
                            </View>
                        )}

                        {/* Shimmer */}
                        {!locked && (
                            <Animated.View
                                pointerEvents="none"
                                style={[StyleSheet.absoluteFill, { overflow: "hidden" }, shimmerStyle]}
                            >
                                <View style={styles.shimmerBar} />
                            </Animated.View>
                        )}

                        {locked && (
                            <Image
                                source={ICONS.cadeado}
                                style={{ width: 32, height: 32, position: "absolute", bottom: -10, right: "auto" }}
                            />
                        )}
                    </View>
                </View>

                {/* Pontilhado cordel na base */}
                <View style={styles.bottomDecor}>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { backgroundColor: locked ? "#C8B090" : `${accent}55` },
                            ]}
                        />
                    ))}
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
        minHeight: 140,
    },
    topBorder: {
        height: 3,
        width: "100%",
    },
    innerRow: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        gap: 12,
        alignItems: "center",
    },
    infoSide: {
        flex: 1,
        gap: 6,
    },
    numberText: {
        fontSize: 10,
        fontFamily: TYPOGRAPHY.fontFamily.serif,
        letterSpacing: 2,
    },
    name: {
        fontSize: 22,
        fontFamily: TYPOGRAPHY.fontFamily.xilosa,
        lineHeight: 26,
    },
    regionTag: {
        alignSelf: "flex-start",
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    regionText: {
        fontSize: 9,
        letterSpacing: 2,
        fontFamily: TYPOGRAPHY.fontFamily.xilosa,
    },
    lockHint: {
        fontSize: 10,
        color: "#A89060",
        fontFamily: TYPOGRAPHY.fontFamily.cordelItalic,
    },
    imageSide: {
        width: 110,
        height: 110,
        alignItems: "center",
        justifyContent: "center",
    },
    imageHalo: {
        position: "absolute",
        width: 110,
        height: 110,
        borderRadius: 8,
    },
    lockedHalo: {
        backgroundColor: "rgba(180,150,100,0.15)",
    },
    image: {
        width: 105,
        height: 105,
    },
    imageLocked: {
        tintColor: "#8A7050",
        opacity: 0.5,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    shimmerBar: {
        position: "absolute",
        top: 0,
        left: 0,
        width: 50,
        height: 200,
        backgroundColor: "rgba(255,245,220,0.35)",
        transform: [{ rotate: "20deg" }],
    },
    lockIcon: {
        position: "absolute",
        bottom: 2,
        right: 2,
    },
    bottomDecor: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 10,
        marginTop: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
})