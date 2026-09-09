// Cenário narrado. **Zero lógica de progressão**: a tela desenha o que
// `runStore.current()` devolve e chama `choose(id)`. Quem decide o que uma
// escolha faz é a engine.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import type { RootStackParamList } from '@/types/navigation';
import type { ResolvedChoice } from '@/types/scene';
import ScreenVignette from '@/components/ScreenVignette';
import TypewriterText from '@/components/narrative/TypewriterText';
import CluesModal from '@/components/narrative/CluesModal';
import ChoiceList from '@/components/narrative/ChoiceList';
import { sceneAsset } from '@/components/narrative/sceneAssets';
import { APP_COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import { ICONS_DARK } from '@/constants/icons';
import { useRunStore } from '@/store/runStore';
import { useCluesDescobertas } from './useCluesDescobertas';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Scenario'>;

export default function Scenario() {
  const navigation = useNavigation<Nav>();
  const run = useRunStore((estado) => estado.run);
  const desfecho = useRunStore((estado) => estado.desfecho);
  const escolher = useRunStore((estado) => estado.choose);
  const regiao = useRunStore((estado) => estado.regiaoAtual());
  // `current()` monta um objeto novo a cada chamada. Dentro de um seletor do
  // zustand isso quebra o `useSyncExternalStore` do React ("getSnapshot should
  // be cached") e vira laço infinito de render. Memoizar por `run` recalcula
  // exatamente quando o estado da partida muda, e não a cada notificação.
  const resolvida = useMemo(() => (run ? useRunStore.getState().current() : null), [run]);
  const pistas = useCluesDescobertas();

  const [narrativaPronta, setNarrativaPronta] = useState(false);
  const [mostrarEscolhas, setMostrarEscolhas] = useState(false);
  const [mostrarPistas, setMostrarPistas] = useState(false);
  const [avisoTravado, setAvisoTravado] = useState<string | null>(null);
  const narrativeScrollRef = useRef<ScrollView | null>(null);

  const choicesOpacity = useSharedValue(0);
  const choicesY = useSharedValue(20);
  const lupaScale = useSharedValue(1);

  // A cena vem do store, não do resolvido: `current()` devolve `ResolvedScene`
  // ou `ResolvedLine`, e só o store sabe qual cena está em curso.
  const cena = run && regiao ? regiao.scenes[run.currentSceneId] : undefined;
  const ehDialogo = cena?.type === 'dialogo';

  // Cena de diálogo tem tela própria; o store é quem sabe onde estamos.
  useEffect(() => {
    if (ehDialogo) navigation.navigate('Dialogue');
  }, [ehDialogo, cena?.id, navigation]);

  // A região terminou: o desfecho tem tela própria.
  useEffect(() => {
    if (desfecho) navigation.navigate('Ending');
  }, [desfecho, navigation]);

  // Reinicia a coreografia quando o texto muda.
  useEffect(() => {
    setNarrativaPronta(false);
    setMostrarEscolhas(false);
    setAvisoTravado(null);
    choicesOpacity.value = 0;
    choicesY.value = 20;
  }, [cena?.id, resolvida?.texto, choicesOpacity, choicesY]);

  useEffect(() => {
    if (!narrativaPronta) return;
    const timer = setTimeout(() => {
      setMostrarEscolhas(true);
      choicesOpacity.value = withTiming(1, { duration: 500 });
      choicesY.value = withSpring(0, { damping: 14, stiffness: 100 });
    }, 400);
    return () => clearTimeout(timer);
  }, [narrativaPronta, choicesOpacity, choicesY]);

  const choicesStyle = useAnimatedStyle(() => ({
    opacity: choicesOpacity.value,
    transform: [{ translateY: choicesY.value }],
  }));
  const lupaStyle = useAnimatedStyle(() => ({ transform: [{ scale: lupaScale.value }] }));

  const aoEscolher = (resolvidaEscolha: ResolvedChoice) => {
    // Travada responde e não altera estado nenhum — a regra é da engine, e a
    // tela só precisa mostrar o pensamento do investigador.
    if (resolvidaEscolha.estado === 'travada') {
      setAvisoTravado(resolvidaEscolha.choice.lockedText ?? 'Ainda não.');
      return;
    }
    setMostrarEscolhas(false);
    void escolher(resolvidaEscolha.choice.id);
  };

  const aoTocarLupa = () => {
    lupaScale.value = withSequence(
      withTiming(0.88, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    setMostrarPistas(true);
  };

  if (!run || !regiao || !resolvida || cena?.type !== 'local') return null;

  const imagem = sceneAsset(cena.imagem);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <ScreenVignette />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.Text
          entering={FadeInDown.duration(500)}
          style={[styles.regionTitle, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
          {regiao.meta.label}
        </Animated.Text>

        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.ornamentRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.ornamentStar}>◆</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(150).duration(600)}
          style={styles.scenarioImageWrapper}>
          {imagem ? (
            <Image source={imagem} style={styles.scenarioImage} resizeMode="cover" />
          ) : (
            <View style={styles.scenarioImagePlaceholder}>
              <View style={styles.scenarioImageTop}>
                <Text style={styles.scenarioMoon}>☽</Text>
                <Text style={styles.scenarioStar}>✦</Text>
              </View>
              <Text style={styles.scenarioImageLabel}>{regiao.meta.label}</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.narrativeBox}>
          <ScrollView
            ref={narrativeScrollRef}
            style={styles.narrativeScroll}
            contentContainerStyle={styles.narrativeScrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            onContentSizeChange={() => narrativeScrollRef.current?.scrollToEnd({ animated: true })}>
            <TypewriterText
              text={resolvida.texto}
              speed={30}
              style={[styles.narrativeText, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}
              onDone={() => setNarrativaPronta(true)}
            />
          </ScrollView>
        </Animated.View>

        {mostrarEscolhas && (
          <Animated.View style={[choicesStyle, { width: '100%' }]}>
            <View style={[styles.ornamentRow, { marginBottom: 14 }]}>
              <View style={styles.dividerLine} />
              <Text style={styles.ornamentStar}>✦</Text>
              <View style={styles.dividerLine} />
            </View>

            {avisoTravado && (
              <Animated.Text
                entering={FadeIn.duration(240)}
                style={[styles.avisoTravado, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
                {avisoTravado}
              </Animated.Text>
            )}

            <ChoiceList escolhas={resolvida.escolhas} onEscolher={aoEscolher} />
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Animated.View style={[styles.lupaButton, lupaStyle]}>
        <TouchableOpacity
          onPress={aoTocarLupa}
          style={styles.lupaTouchable}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel={`Pistas encontradas: ${pistas.length}`}>
          <Image source={ICONS_DARK.lupa} style={{ width: 32, height: 32 }} />
          {pistas.length > 0 && (
            <View style={styles.lupaBadge}>
              <Text style={styles.lupaBadgeText}>{pistas.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <CluesModal visible={mostrarPistas} onClose={() => setMostrarPistas(false)} clues={pistas} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, alignItems: 'center' },
  regionTitle: {
    fontSize: 36,
    color: APP_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 6,
  },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: APP_COLORS.text.primary, opacity: 0.25 },
  ornamentStar: { fontSize: 10, color: APP_COLORS.text.primary, opacity: 0.45 },
  scenarioImageWrapper: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: APP_COLORS.text.primary,
  },
  scenarioImage: { width: '100%', height: 220 },
  scenarioImagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: APP_COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  scenarioImageTop: {
    position: 'absolute',
    top: 16,
    right: 24,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  scenarioMoon: { fontSize: 32, color: APP_COLORS.background.baseSoft },
  scenarioStar: { fontSize: 14, color: APP_COLORS.background.baseSoft, opacity: 0.7 },
  scenarioImageLabel: {
    color: APP_COLORS.background.baseSoft,
    fontSize: 18,
    opacity: 0.5,
    letterSpacing: 3,
  },
  narrativeBox: {
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 4,
    maxHeight: 190,
    minHeight: 118,
  },
  narrativeScroll: { width: '100%' },
  narrativeScrollContent: { paddingBottom: 2 },
  narrativeText: {
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
    color: APP_COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  avisoTravado: {
    fontSize: 14,
    color: APP_COLORS.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  lupaButton: { position: 'absolute', bottom: 28, right: 22 },
  lupaTouchable: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: APP_COLORS.buttons.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(237,225,196,0.15)',
  },
  lupaBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: APP_COLORS.buttons.battle,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lupaBadgeText: { color: APP_COLORS.text.onDark, fontSize: 10, fontWeight: '700' },
});
