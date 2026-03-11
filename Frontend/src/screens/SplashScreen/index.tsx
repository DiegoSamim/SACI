import React, { useEffect } from "react"
import { View, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"

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
        <View className="flex-1 bg-black items-center justify-center">
            <Text className="text-white text-4xl">SACI 🌪️</Text>
        </View>
    )
}