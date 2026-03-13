import { useEffect } from "react"
import { useFonts } from "expo-font"
import { Platform } from "react-native"
import * as NavigationBar from "expo-navigation-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import "./global.css"
import Routes from "./src/routes"
import { FONT_ASSETS } from "./src/constants/fonts"

function AppContent() {
  useEffect(() => {
    if (Platform.OS !== "android") return
    NavigationBar.setVisibilityAsync("hidden")
  }, [])

  return <Routes />
}

export default function App() {
  const [fontsLoaded] = useFonts(FONT_ASSETS)

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  )
}