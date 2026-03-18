import React from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from "react-native"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import ScreenVignette from "../../components/ScreenVignette"

type ComingSoonNavigationProp = NativeStackNavigationProp<RootStackParamList, "ComingSoonRegion">
type ComingSoonRouteProp = RouteProp<RootStackParamList, "ComingSoonRegion">

export default function ComingSoonRegion() {
  const navigation = useNavigation<ComingSoonNavigationProp>()
  const route = useRoute<ComingSoonRouteProp>()

  const regionName = route.params?.regionName ?? "Regiao"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <ScreenVignette />

      <View style={styles.content}>
        <Text style={[styles.kicker, { fontFamily: TYPOGRAPHY.fontFamily.cordelItalic }]}>Exploracao em andamento</Text>
        <Text style={[styles.title, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>{regionName}</Text>
        <Text style={[styles.subtitle, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>Em breve</Text>

        <Text style={[styles.body, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
          Esta regiao recebera novas lendas e misterios em uma proxima atualizacao.
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Text style={[styles.buttonText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>Voltar ao mapa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background.base,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  kicker: {
    color: APP_COLORS.text.muted,
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    color: APP_COLORS.text.primary,
    fontSize: 42,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  subtitle: {
    color: APP_COLORS.text.secondary,
    fontSize: 30,
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: -2,
  },
  body: {
    color: APP_COLORS.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 350,
    marginTop: 6,
  },
  button: {
    marginTop: 18,
    backgroundColor: APP_COLORS.buttons.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    color: APP_COLORS.buttons.primaryText,
    fontSize: 16,
    letterSpacing: 1,
  },
})
