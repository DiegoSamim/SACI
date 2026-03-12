import React from "react"
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"
import { SafeAreaView } from "react-native-safe-area-context"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"

type MenuNavigationProp = NativeStackNavigationProp<RootStackParamList, "Menu">

export default function Menu() {
    const navigation = useNavigation<MenuNavigationProp>()

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
            <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
            <ScreenVignette />

            <View className="flex-1 items-center justify-center">

                {/* Logo */}
                <Image
                    source={require("../../assets/Saci.png")}
                    className="w-72 h-72"
                    resizeMode="contain"
                />

                {/* Título */}
                <Text
                    style={{
                        marginBottom: 40,
                        fontSize: TYPOGRAPHY.fontSize.display,
                        fontWeight: TYPOGRAPHY.fontWeight.bold,
                        fontFamily: TYPOGRAPHY.fontFamily.serif,
                        color: APP_COLORS.text.primary,
                    }}
                >
                    SACI
                </Text>

                {/* Botão */}
                <TouchableOpacity
                    style={{
                        backgroundColor: APP_COLORS.buttons.primary,
                        paddingHorizontal: 40,
                        paddingVertical: 16,
                        borderRadius: 12,
                    }}
                    onPress={() => navigation.navigate("MainTabs")}
                >
                    <Text
                        style={{
                            color: APP_COLORS.buttons.text,
                            fontSize: TYPOGRAPHY.fontSize.lg,
                            fontWeight: TYPOGRAPHY.fontWeight.bold,
                        }}
                    >
                        Iniciar Jornada
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    )
}