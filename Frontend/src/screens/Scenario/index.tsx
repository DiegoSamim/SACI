import React from "react"
import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { RootStackParamList } from "../../types/navigation"
import { RouteProp } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import ScreenVignette from "../../components/ScreenVignette"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import { ICONS } from "@/constants/icons"

type ScenarioNavigationProp = NativeStackNavigationProp<RootStackParamList, "Scenario">
type ScenarioRouteProp = RouteProp<RootStackParamList, "Scenario">

export default function Scenario() {

    const navigation = useNavigation<ScenarioNavigationProp>()
    const route = useRoute<ScenarioRouteProp>()
    const regionName = route.params?.regionName ?? "Região desconhecida"
    const scenarioName = route.params?.scenarioName ?? "Lenda desconhecida"

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
                        marginBottom: 40,
                        fontSize: TYPOGRAPHY.fontSize.xl,
                        fontFamily: TYPOGRAPHY.fontFamily.serif,
                        color: APP_COLORS.text.primary,
                    }}
                >
                    {`Cenário: ${scenarioName}`}
                </Text>

                <Text
                    style={{
                        marginBottom: 32,
                        fontSize: TYPOGRAPHY.fontSize.md,
                        color: APP_COLORS.text.secondary,
                    }}
                >
                    {`Região: ${regionName}`}
                </Text>

                <TouchableOpacity
                    style={{
                        backgroundColor: APP_COLORS.buttons.battle,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        marginBottom: 16,
                        borderRadius: 10,
                    }}
                    onPress={() => navigation.navigate("Battle")}
                >
                    <Text style={{ color: APP_COLORS.buttons.text, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                        Battle
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        backgroundColor: APP_COLORS.buttons.inventory,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 10,
                    }}
                    onPress={() => navigation.navigate("Inventory")}
                >
                    <Text style={{ color: APP_COLORS.buttons.text, fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
                        Inventário
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    )
}