import React, { useEffect, useRef, useCallback } from "react"
import { View, StatusBar, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"
import { useVideoPlayer, VideoView } from "expo-video"
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
} from "react-native-reanimated"

type SplashNavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">

export default function Splash() {
    const navigation = useNavigation<SplashNavigationProp>()
    const opacity = useSharedValue(1)
    const hasNavigatedRef = useRef(false)

    const goToMenu = useCallback(() => {
        navigation.replace("Menu", { fromSplash: true })
    }, [navigation])

    const fadeOutAndNavigate = useCallback(() => {
        if (hasNavigatedRef.current) return
        hasNavigatedRef.current = true

        opacity.value = withTiming(0, {
            duration: 600,
            easing: Easing.out(Easing.quad),
        }, (finished) => {
            if (finished) runOnJS(goToMenu)()
        })
    }, [opacity, goToMenu])

    const player = useVideoPlayer(
        require("../../assets/animation/SaciSplashscreen.mp4"),
        (p) => {
            p.loop = false
            p.muted = false
            p.play()
        }
    )

    useEffect(() => {
        const subscription = player.addListener("playToEnd", () => {
            fadeOutAndNavigate()
        })

        return () => {
            subscription.remove()
        }
    }, [player, fadeOutAndNavigate])

    const screenStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    return (
        <Animated.View style={[styles.container, screenStyle]}>
            <StatusBar hidden />
            <View style={styles.videoFrame}>
                <VideoView
                    player={player}
                    style={styles.video}
                    contentFit="contain"
                    nativeControls={false}
                />
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    videoFrame: {
        width: "99%",
        height: "95%",
        alignItems: "center",
        justifyContent: "center",
    },
    video: {
        width: "100%",
        height: "100%",
    },
})