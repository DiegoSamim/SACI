// Conversa com NPC. Como Scenario, **zero lógica de progressão**: desenha o que
// `runStore.current()` devolve. O humor do NPC chega em palavra, via `moodBand`
// — a tela nunca compara números.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  ImageBackground,
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
import { indexQualities, moodBand } from '@/engine';
import { useRunStore } from '@/store/runStore';
import { useCluesDescobertas } from '../Scenario/useCluesDescobertas';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dialogue'>;

export default function Dialogue() {
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
  const falaScrollRef = useRef<ScrollView | null>(null);

  const choicesOpacity = useSharedValue(0);
  const choicesY = useSharedValue(20);
  const lupaScale = useSharedValue(1);

  const cena = run && regiao ? regiao.scenes[run.currentSceneId] : undefined;
  const ehDialogo = cena?.type === 'dialogo';
  const npc = ehDialogo ? regiao?.npcs[cena.npcId] : undefined;

  // Saiu do diálogo: quem manda é o store, a tela só obedece.
  useEffect(() => {
    if (desfecho) navigation.navigate('Ending');
    else if (cena && !ehDialogo) navigation.navigate('Scenario');
  }, [desfecho, ehDialogo, cena, navigation]);

  const linhaId = run?.currentLineId ?? (ehDialogo ? cena.linhaInicial : undefined);

  useEffect(() => {
    setNarrativaPronta(false);
    setMostrarEscolhas(false);
    setAvisoTravado(null);
    choicesOpacity.value = 0;
    choicesY.value = 20;
  }, [linhaId, resolvida?.texto, choicesOpacity, choicesY]);

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

  const aoEscolher = (escolha: ResolvedChoice) => {
    if (escolha.estado === 'travada') {
      setAvisoTravado(escolha.choice.lockedText ?? 'Ainda não.');
      return;
    }
    setMostrarEscolhas(false);
    void escolher(escolha.choice.id);
  };

  const aoTocarLupa = () => {
    lupaScale.value = withSequence(
      withTiming(0.88, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    setMostrarPistas(true);
  };

  if (!run || !regiao || !resolvida || !ehDialogo || !npc) return null;

  // Humor em palavra, nunca em número: a faixa vem do registro de qualidades.
  const def = npc.humorKey ? indexQualities(regiao.qualities)[npc.humorKey] : undefined;
  const faixa = def ? moodBand(def, run.qualities) : undefined;
  const fundo = sceneAsset(cena.id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_COLORS.background.base }}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <ScreenVignette />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.npcBloco}>
          <Text style={[styles.npcNome, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
            {npc.nome}
          </Text>
          <Text style={[styles.npcPapel, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
            {npc.papel}
            {faixa ? ` · ${faixa}` : ''}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(150).duration(600)} style={styles.retratoWrapper}>
          {fundo ? (
            <ImageBackground source={fundo} style={styles.retrato} resizeMode="cover" />
          ) : (
            <View style={[styles.retrato, styles.retratoVazio]}>
              <Text style={styles.retratoInicial}>{npc.nome.charAt(0)}</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.falaBox}>
          <ScrollView
            ref={falaScrollRef}
            style={{ width: '100%' }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            onContentSizeChange={() => falaScrollRef.current?.scrollToEnd({ animated: true })}>
            <TypewriterText
              text={resolvida.texto}
              speed={28}
              style={[styles.falaTexto, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}
              onDone={() => setNarrativaPronta(true)}
            />
          </ScrollView>
        </View>

        {mostrarEscolhas && (
          <Animated.View style={[choicesStyle, { width: '100%' }]}>
            <View style={styles.ornamentRow}>
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
          <View style={{ width: 32, height: 32 }}>
            <Animated.Image source={ICONS_DARK.lupa} style={{ width: 32, height: 32 }} />
          </View>
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
  npcBloco: { alignItems: 'center', marginBottom: 14 },
  npcNome: { fontSize: 30, color: APP_COLORS.text.primary, letterSpacing: 2, textAlign: 'center' },
  npcPapel: { fontSize: 13, color: APP_COLORS.text.muted, letterSpacing: 1, marginTop: 4 },
  retratoWrapper: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: APP_COLORS.text.primary,
  },
  retrato: { width: '100%', height: 200 },
  retratoVazio: {
    backgroundColor: APP_COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retratoInicial: { fontSize: 64, color: APP_COLORS.background.baseSoft, opacity: 0.4 },
  falaBox: { width: '100%', marginBottom: 12, maxHeight: 200, minHeight: 110 },
  falaTexto: {
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'center',
    color: APP_COLORS.text.secondary,
    letterSpacing: 0.3,
  },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: APP_COLORS.text.primary, opacity: 0.25 },
  ornamentStar: { fontSize: 10, color: APP_COLORS.text.primary, opacity: 0.45 },
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
