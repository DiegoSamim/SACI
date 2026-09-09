import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { AppState, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import Routes from './src/routes';
import { FONT_ASSETS } from './src/constants/fonts';
import { useProgressStore } from './src/store/progressStore';
import { useRunStore } from './src/store/runStore';

function AppContent() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  // Terceiro marco de autosave: o app indo para background. Não cobre crash nem
  // kill pelo sistema — para isso existem os marcos de troca de cena e de linha
  // de diálogo com efeito, no runStore.
  useEffect(() => {
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'background' || estado === 'inactive') {
        void useRunStore.getState().flush();
      }
    });
    return () => inscricao.remove();
  }, []);

  return <Routes />;
}

export default function App() {
  const [fontsLoaded] = useFonts(FONT_ASSETS);
  const hidratado = useProgressStore((estado) => estado.hidratado);
  const hydrate = useProgressStore((estado) => estado.hydrate);

  // Carrega só o progresso global e o resumo dos slots. Nenhuma partida fica
  // ativa: quem manda carregar um save é o menu.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!fontsLoaded || !hidratado) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
