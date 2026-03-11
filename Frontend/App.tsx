import { useEffect } from "react"
import { Platform } from "react-native"
import * as NavigationBar from "expo-navigation-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import "./global.css"
import Routes from "./src/routes"

function AppContent() {
  useEffect(() => {
    if (Platform.OS !== "android") return
    NavigationBar.setVisibilityAsync("hidden")
  }, [])

  return <Routes />
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  )
}