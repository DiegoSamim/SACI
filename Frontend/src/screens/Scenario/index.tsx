import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { RootStackParamList } from "../../types/navigation"

type ScenarioNavigationProp = NativeStackNavigationProp<RootStackParamList, "Scenario">

export default function Scenario() {

    const navigation = useNavigation<ScenarioNavigationProp>()

    return (
        <View className="flex-1 items-center justify-center">

            <TouchableOpacity
                className="absolute top-14 left-6 z-10"
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
            >
                <Ionicons name="arrow-back" size={28} color="#111827" />
            </TouchableOpacity>

            <Text className="text-2xl mb-10">
                Cenário da Floresta
            </Text>

            <TouchableOpacity
                className="bg-green-600 px-6 py-3 mb-4"
                onPress={() => navigation.navigate("Battle")}
            >
                <Text>Battle</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-blue-600 px-6 py-3"
                onPress={() => navigation.navigate("Inventory")}
            >
                <Text>Inventário</Text>
            </TouchableOpacity>

        </View>
    )
}