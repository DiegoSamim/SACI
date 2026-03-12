import React, { useEffect } from "react"
import { View, Text, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"
import { SafeAreaView } from "react-native-safe-area-context"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"

type SplashNavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">

export default function Splash() {
    const navigation = useNavigation<SplashNavigationProp>()

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigation.replace("Menu")
        }, 2000)

        return () => clearTimeout(timeout)
    }, [navigation])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
            <ScreenVignette />

            <View className="flex-1 items-center justify-center">
                <Text
                    style={{
                        fontSize: TYPOGRAPHY.fontSize.display,
                        fontFamily: TYPOGRAPHY.fontFamily.serif,
                        fontWeight: TYPOGRAPHY.fontWeight.bold,
                        color: APP_COLORS.text.primary,
                    }}
                >
                    SACI
                </Text>
            </View>
        </SafeAreaView>
    )
}