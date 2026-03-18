import React, { useMemo } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../../types/navigation"
import { useGameStore } from "../../store/gameStore"
import { APP_COLORS } from "../../constants/colors"
import { TYPOGRAPHY } from "../../constants/typography"
import ScreenVignette from "../../components/ScreenVignette"

type GameOverNavigationProp = NativeStackNavigationProp<RootStackParamList, "GameOver">

const REGION_LABELS: Record<string, string> = {
  norte: "Norte",
  nordeste: "Nordeste",
  sudeste: "Sudeste",
  sul: "Sul",
  centro_oeste: "Centro-Oeste",
}

const REASON_COPY: Record<string, { title: string; body: string }> = {
  failed: {
    title: "Você Falhou",
    body: "A investigação saiu do controle. Reorganize as pistas e tente novamente.",
  },
  caught: {
    title: "Você Foi Capturado",
    body: "A criatura percebeu sua presença antes da hora. Tente outra estratégia.",
  },
}

export default function GameOver() {
  const navigation = useNavigation<GameOverNavigationProp>()
  const store = useGameStore()

  const reason = store.activeRegion?.outcome === "caught" ? "caught" : "failed"
  const regionId = store.activeRegion?.regionId ?? store.lastGameOver?.regionId ?? "nordeste"

  const copy = useMemo(() => REASON_COPY[reason] ?? REASON_COPY.failed, [reason])
  const regionName = REGION_LABELS[regionId] ?? "Nordeste"

  const handleRetry = () => {
    navigation.navigate("Scenario", {
      regionName,
      scenarioName: "Folclore",
    })
  }

  const handleBackToMap = () => {
    navigation.navigate("MainTabs")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <ScreenVignette />

      <View style={styles.content}>
        <Text style={[styles.title, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>{copy.title}</Text>
        <Text style={[styles.body, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>{copy.body}</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={[styles.primaryText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>Tentar novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToMap} activeOpacity={0.85}>
            <Text style={[styles.secondaryText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>Voltar ao mapa</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  title: {
    fontSize: 38,
    color: APP_COLORS.text.primary,
    textAlign: "center",
    letterSpacing: 2,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: APP_COLORS.text.secondary,
    textAlign: "center",
    maxWidth: 340,
  },
  buttons: {
    marginTop: 12,
    width: "100%",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: APP_COLORS.buttons.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#EDE1C4",
    fontSize: 16,
    letterSpacing: 1,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: APP_COLORS.text.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryText: {
    color: APP_COLORS.text.primary,
    fontSize: 16,
    letterSpacing: 1,
  },
})
