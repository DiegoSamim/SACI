import React from "react"
import { View, TouchableOpacity, Text, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"

type MapNavigationProp = NativeStackNavigationProp<RootStackParamList, "MainTabs">

export default function Map() {

    const navigation = useNavigation<MapNavigationProp>()

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>

            <StatusBar backgroundColor="black" barStyle="dark-content" />

            <View className="flex-1 items-center justify-center">

                <Text className="text-2xl mb-10">
                    Mapa do Brasil
                </Text>

                <TouchableOpacity
                    className="w-16 h-16 bg-green-600 rounded-full items-center justify-center"
                    onPress={() => navigation.navigate("Scenario")}
                >
                    <Text>🌳</Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>
    )
}