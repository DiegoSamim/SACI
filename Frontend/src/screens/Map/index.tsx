import React, { useEffect, useRef } from "react"
import {
    View,
    Pressable,
    Text,
    StatusBar,
    Image,
    useWindowDimensions,
    StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
} from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import * as Haptics from "expo-haptics"
import { RootStackParamList } from "../../types/navigation"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"

type MapNavigationProp = NativeStackNavigationProp<RootStackParamList, "MainTabs">

const regions = [
    { key: "norte", regionName: "Norte", scenarioName: "Curipira", top: 30, left: 34, color: APP_COLORS.buttons.pin.norte },
    { key: "nordeste", regionName: "Nordeste", scenarioName: "Cabra Cabriola", top: 34, left: 73, color: APP_COLORS.buttons.pin.nordeste },
    { key: "centro-oeste", regionName: "CentroOeste", scenarioName: "Boitata", top: 47, left: 43, color: APP_COLORS.buttons.pin.centroOeste },
    { key: "sudeste", regionName: "Suldeste", scenarioName: "Mula sem cabeça", top: 57, left: 66, color: APP_COLORS.buttons.pin.sudeste },
    { key: "sul", regionName: "Sul", scenarioName: "Negrinho do Pastoreio", top: 75, left: 50, color: APP_COLORS.buttons.pin.sul },
] as const

type RegionItem = (typeof regions)[number]

// ─── Partícula de névoa ───────────────────────────────────────────────────────
type ParticleConfig = {
    id: number
    size: number
    startX: number
    startY: number
    duration: number
    delay: number
    opacity: number
}

function FloatingParticle({ config }: { config: ParticleConfig }) {
    const translateY = useSharedValue(0)
    const translateX = useSharedValue(0)
    const opacity = useSharedValue(0)
    const scale = useSharedValue(0.6)

    useEffect(() => {
        const drift = config.size > 5 ? 18 : 10

        opacity.value = withDelay(
            config.delay,
            withRepeat(
                withSequence(
                    withTiming(config.opacity, { duration: config.duration * 0.3 }),
                    withTiming(config.opacity * 0.7, { duration: config.duration * 0.4 }),
                    withTiming(0, { duration: config.duration * 0.3 })
                ),
                -1,
                false
            )
        )

        translateY.value = withDelay(
            config.delay,
            withRepeat(
                withTiming(-config.duration * 0.06, {
                    duration: config.duration,
                    easing: Easing.inOut(Easing.sin),
                }),
                -1,
                true
            )
        )

        translateX.value = withDelay(
            config.delay,
            withRepeat(
                withSequence(
                    withTiming(drift, { duration: config.duration * 0.5, easing: Easing.inOut(Easing.sin) }),
                    withTiming(-drift * 0.5, { duration: config.duration * 0.5, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                false
            )
        )

        scale.value = withDelay(
            config.delay,
            withRepeat(
                withSequence(
                    withTiming(1, { duration: config.duration * 0.5 }),
                    withTiming(0.7, { duration: config.duration * 0.5 })
                ),
                -1,
                false
            )
        )
    }, [])

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: "absolute",
                    left: config.startX,
                    top: config.startY,
                    width: config.size,
                    height: config.size,
                    borderRadius: config.size / 2,
                    backgroundColor: "#C8B89A",
                },
                style,
            ]}
        />
    )
}

// ─── Shimmer sobre o mapa ─────────────────────────────────────────────────────
function MapShimmer({ width, height }: { width: number; height: number }) {
    const shimmerX = useSharedValue(-width)

    useEffect(() => {
        // Executa o shimmer 1 vez ao montar, com delay curto
        shimmerX.value = withDelay(
            600,
            withTiming(width * 1.5, {
                duration: 1100,
                easing: Easing.out(Easing.quad),
            })
        )
    }, [])

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shimmerX.value }, { rotate: "20deg" }],
    }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                StyleSheet.absoluteFill,
                { overflow: "hidden", borderRadius: 8 },
            ]}
        >
            <Animated.View
                style={[
                    {
                        position: "absolute",
                        top: -height * 0.1,
                        width: width * 0.35,
                        height: height * 1.2,
                    },
                    shimmerStyle,
                ]}
            >
                <LinearGradient
                    colors={[
                        "transparent",
                        "rgba(255,245,220,0.18)",
                        "rgba(255,245,220,0.38)",
                        "rgba(255,245,220,0.18)",
                        "transparent",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </Animated.View>
    )
}

// ─── Pin de região ────────────────────────────────────────────────────────────
type RegionPinProps = {
    region: RegionItem
    index: number
    onPress: (region: RegionItem) => void
}

function RegionPin({ region, index, onPress }: RegionPinProps) {
    const appear = useSharedValue(0)
    const pulse = useSharedValue(1)
    const pressed = useSharedValue(1)

    useEffect(() => {
        appear.value = withDelay(index * 150 + 400, withSpring(1, { damping: 12, stiffness: 130 }))
        pulse.value = withDelay(
            index * 150 + 900,
            withRepeat(
                withSequence(
                    withTiming(1.7, { duration: 1100, easing: Easing.out(Easing.quad) }),
                    withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                false
            )
        )
    }, [])

    const containerStyle = useAnimatedStyle(() => ({
        opacity: appear.value,
        transform: [{ scale: appear.value * pressed.value }],
    }))

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.7], [0.45, 0], Extrapolation.CLAMP),
    }))

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    top: `${region.top}%`,
                    left: `${region.left}%`,
                    marginLeft: -18,
                    marginTop: -18,
                },
                containerStyle,
            ]}
        >
            <Pressable
                onPressIn={() => {
                    pressed.value = withSpring(0.82, { damping: 10, stiffness: 220 })
                }}
                onPressOut={() => {
                    pressed.value = withSpring(1, { damping: 10, stiffness: 220 })
                }}
                onPress={() => onPress(region)}
                accessibilityRole="button"
                accessibilityLabel={`Abrir cenário de ${region.regionName}`}
                style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
            >
                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: region.color,
                        },
                        pulseStyle,
                    ]}
                />
                <View
                    style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: region.color,
                        borderWidth: 2.5,
                        borderColor: APP_COLORS.text.onDark,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.4,
                        shadowRadius: 3,
                        elevation: 6,
                    }}
                />
            </Pressable>
        </Animated.View>
    )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function Map() {
    const navigation = useNavigation<MapNavigationProp>()
    const { width, height } = useWindowDimensions()

    const mapWidth = Math.min(width * 0.95, 400)
    const mapHeight = mapWidth * 1.45

    const isNavigatingRef = useRef(false)

    // Animações do mapa
    const mapOpacity = useSharedValue(0)
    const mapScale = useSharedValue(0.88)
    const mapX = useSharedValue(0)
    const mapY = useSharedValue(0)

    // Animação do título
    const titleOpacity = useSharedValue(0)
    const titleY = useSharedValue(12)

    // Animação do hint
    const hintOpacity = useSharedValue(0)

    // Partículas — geradas uma vez
    const particles = useRef<ParticleConfig[]>(
        Array.from({ length: 22 }, (_, i) => ({
            id: i,
            size: Math.random() * 7 + 3,
            startX: Math.random() * width,
            startY: Math.random() * height,
            duration: 3500 + Math.random() * 3000,
            delay: Math.random() * 4000,
            opacity: 0.12 + Math.random() * 0.18,
        }))
    ).current

    useEffect(() => {
        // Mapa entra
        mapOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
        mapScale.value = withSpring(1, { damping: 14, stiffness: 100 })

        // Título entra
        titleOpacity.value = withDelay(200, withTiming(1, { duration: 700 }))
        titleY.value = withDelay(200, withSpring(0, { damping: 14, stiffness: 100 }))

        // Hint entra
        hintOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }))
    }, [])

    const mapStyle = useAnimatedStyle(() => ({
        opacity: mapOpacity.value,
        transform: [
            { translateX: mapX.value },
            { translateY: mapY.value },
            { scale: mapScale.value },
        ],
    }))

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleY.value }],
    }))

    const hintStyle = useAnimatedStyle(() => ({
        opacity: hintOpacity.value,
    }))

    const handleRegionPress = async (region: RegionItem) => {
        if (isNavigatingRef.current) return
        isNavigatingRef.current = true

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        const ZOOM_SCALE = 1.65

        const pinCenterX = (region.left / 100) * mapWidth
        const pinCenterY = (region.top / 100) * mapHeight

        const offsetX = (mapWidth / 2 - pinCenterX) * (ZOOM_SCALE - 1)
        const offsetY = (mapHeight / 2 - pinCenterY) * (ZOOM_SCALE - 1)

        const timingConfig = { duration: 420, easing: Easing.out(Easing.cubic) }

        mapScale.value = withTiming(ZOOM_SCALE, timingConfig)
        mapX.value = withTiming(offsetX, timingConfig)
        mapY.value = withTiming(offsetY, timingConfig)

        setTimeout(() => {
            navigation.navigate("Scenario", {
                regionName: region.regionName,
                scenarioName: region.scenarioName,
            })

            setTimeout(() => {
                mapScale.value = withSpring(1, { damping: 14, stiffness: 100 })
                mapX.value = withSpring(0, { damping: 14, stiffness: 100 })
                mapY.value = withSpring(0, { damping: 14, stiffness: 100 })
                isNavigatingRef.current = false
            }, 300)
        }, 450)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />

            {/* ── Partículas de névoa ── */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                {particles.map((p) => (
                    <FloatingParticle key={p.id} config={p} />
                ))}
            </View>

            <ScreenVignette />

            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>

                {/* ── Título com fonte serifada ── */}
                <Animated.View style={[{ alignItems: "center", marginBottom: 16 }, titleStyle]}>
                    {/* Linha ornamental superior */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 }}>
                        <View style={{ width: 40, height: 1, backgroundColor: "#7A5C3A", opacity: 0.6 }} />
                        <Text style={{ color: "#7A5C3A", fontSize: 10, opacity: 0.7, letterSpacing: 3 }}>✦</Text>
                        <View style={{ width: 40, height: 1, backgroundColor: "#7A5C3A", opacity: 0.6 }} />
                    </View>

                    <Text
                        style={{
                            fontFamily: TYPOGRAPHY.fontFamily.serif,
                            fontSize: TYPOGRAPHY.fontSize.xl,
                            fontWeight: "700",
                            color: APP_COLORS.text.primary,
                            letterSpacing: 1.5,
                            textAlign: "center",
                        }}
                    >
                        Lendas do Brasil
                    </Text>

                    <Text
                        style={{
                            fontFamily: TYPOGRAPHY.fontFamily.serif,
                            fontSize: 11,
                            color: APP_COLORS.text.muted,
                            letterSpacing: 4,
                            marginTop: 3,
                            textTransform: "uppercase",
                            opacity: 0.75,
                        }}
                    >
                        Escolha sua região
                    </Text>

                    {/* Linha ornamental inferior */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 }}>
                        <View style={{ width: 40, height: 1, backgroundColor: "#7A5C3A", opacity: 0.6 }} />
                        <Text style={{ color: "#7A5C3A", fontSize: 10, opacity: 0.7, letterSpacing: 3 }}>✦</Text>
                        <View style={{ width: 40, height: 1, backgroundColor: "#7A5C3A", opacity: 0.6 }} />
                    </View>
                </Animated.View>

                {/* ── Mapa com shimmer ── */}
                <Animated.View style={[{ width: mapWidth, height: mapHeight }, mapStyle]}>
                    <Image
                        source={require("../../assets/MapaBrasil2.png")}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="contain"
                    />

                    {/* Shimmer de entrada — roda 1 vez */}
                    <MapShimmer width={mapWidth} height={mapHeight} />

                    {regions.map((region, index) => (
                        <RegionPin
                            key={region.key}
                            region={region}
                            index={index}
                            onPress={handleRegionPress}
                        />
                    ))}
                </Animated.View>

                {/* ── Hint ── */}
                <Animated.Text
                    style={[
                        {
                            marginTop: 20,
                            textAlign: "center",
                            paddingHorizontal: 32,
                            fontSize: 12,
                            fontStyle: "italic",
                            fontFamily: TYPOGRAPHY.fontFamily.serif,
                            color: APP_COLORS.text.secondary,
                            opacity: 0.7,
                            letterSpacing: 0.3,
                        },
                        hintStyle,
                    ]}
                >
                    Toque em um ponto colorido para abrir o cenário da região.
                </Animated.Text>
            </View>
        </SafeAreaView>
    )
}