import React from "react"
import { View, Text, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"

export default function Battle() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
            <ScreenVignette />

            <View className="flex-1 items-center justify-center">

                <Text
                    style={{
                        fontSize: TYPOGRAPHY.fontSize.xl,
                        fontFamily: TYPOGRAPHY.fontFamily.serif,
                        color: APP_COLORS.text.primary,
                    }}
                >
                    Batalha contra criatura folclórica
                </Text>

            </View>
        </SafeAreaView>
    )
}