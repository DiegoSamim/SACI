import React, { useEffect } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
} from "react-native"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"
import { SafeAreaView } from "react-native-safe-area-context"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withRepeat,
    withSequence,
    Easing,
} from "react-native-reanimated"

type MenuNavigationProp = NativeStackNavigationProp<RootStackParamList, "Menu">
type MenuRouteProp = RouteProp<RootStackParamList, "Menu">

// ─── Ornamento de linha com estrela ──────────────────────────────────────────
function OrnamentRow({ opacity }: { opacity: Animated.SharedValue<number> }) {
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
    return (
        <Animated.View style={[styles.ornamentRow, style]}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentDiamond}>◆</Text>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentDiamond}>◆</Text>
            <View style={styles.ornamentLine} />
        </Animated.View>
    )
}

export default function Menu() {
    const navigation = useNavigation<MenuNavigationProp>()
    const route = useRoute<MenuRouteProp>()
    const { width } = useWindowDimensions()
    const fromSplash = route.params?.fromSplash ?? false

    // ── Shared values ──────────────────────────────────────────────────────
    const logoScale = useSharedValue(fromSplash ? 1.8 : 1)
    const logoOpacity = useSharedValue(fromSplash ? 0 : 1)
    const logoY = useSharedValue(fromSplash ? 60 : 0)
    // Rotação suave e contínua do Saci — dá vida à logo
    const logoRotate = useSharedValue(0)

    const titleOpacity = useSharedValue(0)
    const titleY = useSharedValue(20)
    const titleScale = useSharedValue(0.88)

    const subOpacity = useSharedValue(0)
    const subY = useSharedValue(12)

    const ornamentOpacity = useSharedValue(0)

    const buttonOpacity = useSharedValue(0)
    const buttonY = useSharedValue(28)
    const buttonScale = useSharedValue(0.88)

    const bgOpacity = useSharedValue(fromSplash ? 0 : 1)

    // Animação idle da logo — balanço leve
    const logoIdleY = useSharedValue(0)

    useEffect(() => {
        const d = fromSplash ? 80 : 0

        bgOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) })

        // Logo entra
        logoOpacity.value = withDelay(d, withTiming(1, { duration: 400 }))
        logoScale.value = withDelay(d, withSpring(1, { damping: 16, stiffness: 90, mass: 1.1 }))
        logoY.value = withDelay(d, withSpring(0, { damping: 18, stiffness: 100 }))

        // Flutuação idle da logo após entrar
        logoIdleY.value = withDelay(
            d + 700,
            withRepeat(
                withSequence(
                    withTiming(-8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                false
            )
        )

        // Título
        titleOpacity.value = withDelay(d + 320, withTiming(1, { duration: 450 }))
        titleY.value = withDelay(d + 320, withSpring(0, { damping: 14, stiffness: 110 }))
        titleScale.value = withDelay(d + 320, withSpring(1, { damping: 14, stiffness: 120 }))

        // Subtítulo e ornamentos
        subOpacity.value = withDelay(d + 480, withTiming(1, { duration: 400 }))
        subY.value = withDelay(d + 480, withSpring(0, { damping: 14, stiffness: 110 }))
        ornamentOpacity.value = withDelay(d + 520, withTiming(1, { duration: 500 }))

        // Botão
        buttonOpacity.value = withDelay(d + 640, withTiming(1, { duration: 400 }))
        buttonY.value = withDelay(d + 640, withSpring(0, { damping: 13, stiffness: 100 }))
        buttonScale.value = withDelay(d + 640, withSpring(1, { damping: 12, stiffness: 130 }))
    }, [])

    // ── Animated styles ────────────────────────────────────────────────────
    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [
            { scale: logoScale.value },
            { translateY: logoY.value + logoIdleY.value },
        ],
    }))

    const titleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleY.value }, { scale: titleScale.value }],
    }))

    const subStyle = useAnimatedStyle(() => ({
        opacity: subOpacity.value,
        transform: [{ translateY: subY.value }],
    }))

    const buttonStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ translateY: buttonY.value }, { scale: buttonScale.value }],
    }))

    const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))

    // Pressionar botão
    const btnPressScale = useSharedValue(1)
    const btnPressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnPressScale.value }],
    }))

    const handlePressIn = () => { btnPressScale.value = withSpring(0.94, { damping: 12, stiffness: 200 }) }
    const handlePressOut = () => { btnPressScale.value = withSpring(1, { damping: 10, stiffness: 200 }) }

    const handleStart = () => {
        logoOpacity.value = withTiming(0, { duration: 280 })
        titleOpacity.value = withTiming(0, { duration: 230 })
        subOpacity.value = withTiming(0, { duration: 200 })
        buttonOpacity.value = withTiming(0, { duration: 180 })
        bgOpacity.value = withTiming(0, { duration: 380, easing: Easing.in(Easing.quad) })
        setTimeout(() => navigation.navigate("MainTabs"), 360)
    }

    return (
        <Animated.View style={[{ flex: 1 }, bgStyle]}>
            <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
                <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
                <ScreenVignette />

                <View style={styles.center}>

                    {/* ── Logo flutuante ── */}
                    <Animated.Image
                        source={require("../../assets/Saci.png")}
                        style={[styles.logo, logoStyle]}
                        resizeMode="contain"
                    />

                    {/* ── Bloco de título ── */}
                    <Animated.View style={[styles.titleBlock, titleStyle]}>

                        {/* Linha ornamental acima do título */}
                        <View style={styles.titleOrnamentTop}>
                            <View style={styles.ornamentLineThin} />
                            <Text style={styles.ornamentStar}>✦</Text>
                            <View style={styles.ornamentLineThin} />
                        </View>

                        <Text style={[styles.title, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
                            SACI
                        </Text>

                        {/* Linha ornamental abaixo */}
                        <View style={styles.titleOrnamentTop}>
                            <View style={styles.ornamentLineThin} />
                            <Text style={styles.ornamentStar}>✦</Text>
                            <View style={styles.ornamentLineThin} />
                        </View>
                    </Animated.View>

                    {/* ── Subtítulo cordel ── */}
                    <Animated.Text
                        style={[styles.subtitle, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }, subStyle]}
                    >
                        Lendas & Folclore do Brasil
                    </Animated.Text>


                    {/* ── Botão estilo cordel ── */}
                    <Animated.View style={[buttonStyle, btnPressStyle, { width: width * 0.78 }]}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleStart}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            activeOpacity={1}
                        >
                            {/* Borda interna pontilhada — detalhe xilogravura */}
                            <View style={styles.buttonInnerBorder}>
                                <Text style={[styles.buttonText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
                                    Iniciar Jornada
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* ── Rodapé ornamental ── */}
                    <Animated.Text style={[styles.footer, subStyle]}>
                        ◆  ◆  ◆
                    </Animated.Text>

                </View>
            </SafeAreaView>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        gap: 0,
    },

    // Logo
    logo: {
        width: 240,
        height: 240,
        marginBottom: 8,
    },

    // Bloco título
    titleBlock: {
        alignItems: "center",
        width: "100%",
        marginBottom: 8,
    },
    titleOrnamentTop: {
        flexDirection: "row",
        alignItems: "center",
        width: "60%",
        gap: 8,
        marginVertical: 4,
    },
    ornamentLineThin: {
        flex: 1,
        height: 1,
        backgroundColor: APP_COLORS.text.primary,
        opacity: 0.35,
    },
    ornamentStar: {
        color: APP_COLORS.text.primary,
        fontSize: 9,
        opacity: 0.5,
    },
    title: {
        fontSize: 56,
        color: APP_COLORS.text.primary,
        letterSpacing: 10,
        textAlign: "center",
        lineHeight: 64,
    },

    // Subtítulo
    subtitle: {
        fontSize: 13,
        color: APP_COLORS.text.muted,
        letterSpacing: 2,
        textAlign: "center",
        marginBottom: 25,
    },

    // Ornamento de linha separadora
    ornamentRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "70%",
        gap: 6,
        marginBottom: 28,
    },
    ornamentLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: APP_COLORS.text.primary,
        opacity: 0.2,
    },
    ornamentDiamond: {
        fontSize: 7,
        color: APP_COLORS.text.primary,
        opacity: 0.35,
    },

    // Botão
    button: {
        backgroundColor: APP_COLORS.buttons.primary,
        borderRadius: 10,
        paddingVertical: 2,
        paddingHorizontal: 2,
        // Sombra estilo xilogravura — deslocada para baixo e direita
        shadowColor: APP_COLORS.text.primary,
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 0,
        elevation: 5,
    },
    buttonInnerBorder: {
        borderWidth: 1.5,
        borderColor: "rgba(237,225,196,0.18)",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 40,
        alignItems: "center",
    },
    buttonText: {
        color: APP_COLORS.buttons.primaryText ?? APP_COLORS.text.onDark,
        fontSize: 19,
        letterSpacing: 2,
    },

    // Rodapé
    footer: {
        marginTop: 28,
        fontSize: 10,
        color: APP_COLORS.text.primary,
        opacity: 0.25,
        letterSpacing: 8,
    },
})