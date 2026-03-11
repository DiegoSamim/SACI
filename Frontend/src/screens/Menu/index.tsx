import React from "react"
import {
    View,
    Text,
    Image,
    TouchableOpacity
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"

type MenuNavigationProp = NativeStackNavigationProp<RootStackParamList, "Menu">

export default function Menu() {
    const navigation = useNavigation<MenuNavigationProp>()

    return (
        <View className="flex-1 items-center justify-center">

            {/* Logo */}
            <Image
                source={require("../../assets/Saci.png")}
                className="w-72 h-72"
                resizeMode="contain"
            />

            {/* Título */}
            <Text className="text-4xl font-bold text-black mb-10">
                SACI
            </Text>

            {/* Botão */}
            <TouchableOpacity
                className="bg-black px-10 py-4 rounded-lg"
                onPress={() => navigation.navigate("MainTabs")}
            >
                <Text className="text-white text-lg font-bold">
                    Iniciar Jornada
                </Text>
            </TouchableOpacity>

        </View>
    )
}