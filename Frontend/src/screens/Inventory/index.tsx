import React from "react"
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { RootStackParamList } from "../../types/navigation"
import { SafeAreaView } from "react-native-safe-area-context"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import { ICONS } from "@/constants/icons"

type InventoryNavigationProp = NativeStackNavigationProp<RootStackParamList, "Inventory">

export default function Inventory() {
    const navigation = useNavigation<InventoryNavigationProp>()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
            <ScreenVignette />

            <View className="flex-1 items-center justify-center">

                <TouchableOpacity
                    className="absolute top-14 left-6 z-10"
                    onPress={() => navigation.goBack()}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                >
                    <Image
                        source={ICONS.seta}
                        style={{
                            width: 60,
                            height: 60,
                        }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <Text
                    style={{
                        fontSize: TYPOGRAPHY.fontSize.xl,
                        fontFamily: TYPOGRAPHY.fontFamily.serif,
                        color: APP_COLORS.text.primary,
                    }}
                >
                    Inventário
                </Text>

            </View>
        </SafeAreaView>
    )
}