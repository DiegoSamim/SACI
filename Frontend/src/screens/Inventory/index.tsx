import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { RootStackParamList } from "../../types/navigation"

type InventoryNavigationProp = NativeStackNavigationProp<RootStackParamList, "Inventory">

export default function Inventory() {
    const navigation = useNavigation<InventoryNavigationProp>()

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

            <Text className="text-2xl">
                Inventário
            </Text>

        </View>
    )
}