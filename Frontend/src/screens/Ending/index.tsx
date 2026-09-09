// Fim de região. Em v2 não existe "game over": existem **finais nomeados**, com
// epílogo e veredito de catalogação.
//
// Não há "tentar de novo": o §9 proíbe rejogar uma região no mesmo save, e
// `canEnterRegion` já recusa. Oferecer o botão seria mentir sobre o que o jogo
// aceita.

import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { RootStackParamList } from '@/types/navigation';
import ScreenVignette from '@/components/ScreenVignette';
import { APP_COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import { useRunStore } from '@/store/runStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Ending'>;

export default function Ending() {
  const navigation = useNavigation<Nav>();
  const desfecho = useRunStore((estado) => estado.desfecho);

  // Sem desfecho não há o que mostrar — acontece se a tela for alcançada por
  // um caminho que o store não produziu.
  useEffect(() => {
    if (!desfecho) navigation.navigate('MainTabs');
  }, [desfecho, navigation]);

  if (!desfecho) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <ScreenVignette />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.Text
          entering={FadeInDown.duration(560)}
          style={[styles.nome, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
          {desfecho.nome}
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(240).duration(400)} style={styles.ornamentRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.ornamentStar}>◆</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(380).duration(520)}
          style={[styles.texto, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
          {desfecho.texto}
        </Animated.Text>

        {desfecho.epilogo.map((fragmento, i) => (
          <Animated.Text
            key={fragmento}
            entering={FadeInUp.delay(700 + i * 220).duration(520)}
            style={[styles.epilogo, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
            — {fragmento}
          </Animated.Text>
        ))}

        <Animated.View entering={FadeIn.delay(1100).duration(480)} style={styles.fichaBloco}>
          <Text style={[styles.ficha, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
            {desfecho.podeCatalogar
              ? 'A ficha foi registrada no caderno de campo.'
              : 'A ficha ficou sem registro. Você foi embora antes de entender o que viu.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1300).duration(480)} style={styles.botoes}>
          {desfecho.podeCatalogar && (
            <TouchableOpacity
              style={styles.botao}
              activeOpacity={0.85}
              accessibilityRole="button"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Catalog' })}>
              <Text
                style={[styles.botaoTexto, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
                Ver a ficha
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.botao, styles.botaoSecundario]}
            activeOpacity={0.85}
            accessibilityRole="button"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Map' })}>
            <Text
              style={[
                styles.botaoTexto,
                styles.botaoTextoSecundario,
                { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular },
              ]}>
              Voltar ao mapa
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background.base },
  scroll: { padding: 28, paddingTop: 60, alignItems: 'center' },
  nome: {
    fontSize: 32,
    color: APP_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
    width: '100%',
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: APP_COLORS.text.primary, opacity: 0.25 },
  ornamentStar: { fontSize: 10, color: APP_COLORS.text.primary, opacity: 0.45 },
  texto: {
    fontSize: 17,
    lineHeight: 29,
    color: APP_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 26,
  },
  epilogo: {
    fontSize: 15,
    lineHeight: 25,
    color: APP_COLORS.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  fichaBloco: {
    marginTop: 18,
    marginBottom: 32,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.text.primary,
    width: '100%',
  },
  ficha: { fontSize: 14, color: APP_COLORS.text.primary, textAlign: 'center', letterSpacing: 0.4 },
  botoes: { width: '100%', gap: 12 },
  botao: {
    backgroundColor: APP_COLORS.buttons.primary,
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: APP_COLORS.text.primary,
  },
  botaoTexto: { color: APP_COLORS.text.onDark, fontSize: 15, letterSpacing: 1.4 },
  botaoTextoSecundario: { color: APP_COLORS.text.primary },
});
