import React, { useEffect } from "react"
import { Image, StyleSheet, View } from "react-native"
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import { ICONS } from "../constants/icons"

type CloudTrackConfig = {
    id: number
    topPercent: number
    size: number
    duration: number
    delay: number
    driftY: number
    driftX: number       // variação sutil de velocidade horizontal
    opacity: number      // nuvens mais distantes = mais transparentes
    scale: number        // paralaxe: nuvens menores = mais ao fundo
    pieces: number       // 2, 3 ou 4 pedaços por cluster
}

const CLOUD_TRACKS: CloudTrackConfig[] = [
    // Fundo — lentas, pequenas, semi-transparentes
    { id: 1, topPercent: 6, size: 72, duration: 35000, delay: 0, driftY: 3, driftX: 0, opacity: 0.28, scale: 1, pieces: 2 },
    { id: 2, topPercent: 16, size: 84, duration: 38000, delay: 6000, driftY: 4, driftX: 600, opacity: 0.32, scale: 1, pieces: 3 },
    // Meio — velocidade e opacidade médias
    { id: 3, topPercent: 28, size: 110, duration: 30000, delay: 1500, driftY: 6, driftX: 0, opacity: 0.48, scale: 1, pieces: 3 },
    { id: 4, topPercent: 42, size: 96, duration: 28000, delay: 9000, driftY: 5, driftX: -800, opacity: 0.42, scale: 1, pieces: 2 },
    // Frente — rápidas, grandes, opacas (paralaxe)
    { id: 5, topPercent: 58, size: 138, duration: 22000, delay: 2000, driftY: 8, driftX: 400, opacity: 0.62, scale: 1, pieces: 4 },
    { id: 6, topPercent: 72, size: 118, duration: 26000, delay: 5000, driftY: 7, driftX: 0, opacity: 0.55, scale: 1, pieces: 3 },
]

// Layout dos pedaços por quantidade — offsets relativos ao size
const PIECE_LAYOUTS: Record<number, { leftMult: number; topMult: number; sizeMult: number }[]> = {
    2: [
        { leftMult: 0, topMult: 0.2, sizeMult: 1 },
        { leftMult: 0.7, topMult: 0.02, sizeMult: 0.78 },
    ],
    3: [
        { leftMult: 0, topMult: 0.22, sizeMult: 1 },
        { leftMult: 0.55, topMult: 0.02, sizeMult: 0.82 },
        { leftMult: 1.08, topMult: 0.24, sizeMult: 0.74 },
    ],
    4: [
        { leftMult: 0, topMult: 0.26, sizeMult: 0.88 },
        { leftMult: 0.48, topMult: 0.02, sizeMult: 1 },
        { leftMult: 1.02, topMult: 0.06, sizeMult: 0.86 },
        { leftMult: 1.52, topMult: 0.28, sizeMult: 0.72 },
    ],
}

function CloudCluster({
    width,
    height,
    config,
}: {
    width: number
    height: number
    config: CloudTrackConfig
}) {
    const layout = PIECE_LAYOUTS[config.pieces]
    // span baseado no layout mais largo
    const lastPiece = layout[layout.length - 1]
    const span = config.size * (lastPiece.leftMult + lastPiece.sizeMult + 0.1)

    const x = useSharedValue(-span)
    const y = useSharedValue(0)
    const scaleAnim = useSharedValue(1)
    const opacityAnim = useSharedValue(0)

    useEffect(() => {
        x.value = -span

        // Movimento horizontal contínuo com leve aceleração/desaceleração nas bordas
        x.value = withDelay(
            config.delay,
            withRepeat(
                withTiming(width + span, {
                    duration: config.duration,
                    easing: Easing.inOut(Easing.quad), // suaviza nas extremidades
                }),
                -1,
                false
            )
        )

        // Drift vertical suave — ciclo ligeiramente diferente do horizontal para movimento não-repetitivo
        y.value = withDelay(
            config.delay,
            withRepeat(
                withSequence(
                    withTiming(-config.driftY, {
                        duration: config.duration * 0.38,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    withTiming(config.driftY * 0.6, {
                        duration: config.duration * 0.32,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    withTiming(0, {
                        duration: config.duration * 0.3,
                        easing: Easing.inOut(Easing.sin),
                    })
                ),
                -1,
                false
            )
        )

        // Respiração de escala — nuvem "incha" levemente como vapor real
        scaleAnim.value = withDelay(
            config.delay,
            withRepeat(
                withSequence(
                    withTiming(1.04, {
                        duration: config.duration * 0.45,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    withTiming(0.97, {
                        duration: config.duration * 0.55,
                        easing: Easing.inOut(Easing.sin),
                    })
                ),
                -1,
                false
            )
        )

        // Fade in suave ao aparecer na borda esquerda
        opacityAnim.value = withDelay(
            config.delay,
            withRepeat(
                withSequence(
                    // aparece
                    withTiming(config.opacity, {
                        duration: 2200,
                        easing: Easing.out(Easing.quad),
                    }),
                    // permanece visível durante a travessia
                    withTiming(config.opacity, {
                        duration: Math.max(config.duration - 4400, 1000),
                        easing: Easing.linear,
                    }),
                    // desaparece na borda direita
                    withTiming(0, {
                        duration: 2200,
                        easing: Easing.in(Easing.quad),
                    })
                ),
                -1,
                false
            )
        )
    }, [config.delay, config.driftY, config.duration, config.opacity, span, width])

    const cloudStyle = useAnimatedStyle(() => ({
        opacity: opacityAnim.value,
        transform: [
            { translateX: x.value },
            { translateY: y.value },
            { scale: scaleAnim.value },
        ],
    }))

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.cloudTrack,
                {
                    top: (config.topPercent / 100) * height,
                    width: span,
                    height: config.size,
                },
                cloudStyle,
            ]}
        >
            {layout.map((piece, i) => (
                <Image
                    key={i}
                    source={ICONS.nuvemPreenchida}
                    resizeMode="contain"
                    style={[
                        styles.cloudPiece,
                        {
                            width: config.size * piece.sizeMult,
                            height: config.size * piece.sizeMult * 0.62,
                            left: config.size * piece.leftMult,
                            top: config.size * piece.topMult,
                            opacity: i === 0 ? 1 : 0.82 - i * 0.06,
                        },
                    ]}
                />
            ))}
        </Animated.View>
    )
}

export default function MapCloudLayer({ width, height }: { width: number; height: number }) {
    return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {CLOUD_TRACKS.map((track) => (
                <CloudCluster key={track.id} width={width} height={height} config={track} />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    cloudTrack: {
        position: "absolute",
    },
    cloudPiece: {
        position: "absolute",
    },
})