import React, { useCallback, useState } from 'react';
import { View, Pressable, Text, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import type { RegionId } from '../../types/ids';
import { APP_COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import ScreenVignette from '../../components/ScreenVignette';
import type { MotivoBloqueio } from '../../types/save';
import { useRunStore } from '../../store/runStore';
import { findRegion } from './regions';
import { useMapController } from './useMapController';
import { useMapPreferences } from './useMapPreferences';
import { MapComposition } from './MapComposition';
import { MapAtmosphere, MapPaper } from './MapAtmosphere';

/**
 * Cada motivo de `canEnterRegion` tem uma frase. Como a união é fechada, um
 * motivo novo na engine quebra a compilação aqui — que é o objetivo.
 */
const MOTIVO_TEXTO: Record<MotivoBloqueio, string> = {
  ja_concluida: 'Você já investigou esta região neste caderno.',
  save_inexistente: 'Comece uma investigação no menu antes de escolher a região.',
  regiao_desconhecida: 'Esta região ainda não foi escrita.',
};

export default function Map() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MainTabs'>>();
  const { active, reducedMotion } = useMapPreferences();
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const [bloqueio, setBloqueio] = useState<MotivoBloqueio | null>(null);
  const enter = useCallback(
    (id: RegionId) => {
      const region = findRegion(id);
      if (!region) return;
      // Quem decide se dá para entrar é o store, não a tela. Os motivos são
      // união fechada — um motivo novo quebra a compilação daqui.
      setBloqueio(null);
      const permissao = useRunStore.getState().canEnterRegion(id);
      if (!permissao.permitido) {
        if (permissao.motivo === 'regiao_desconhecida') {
          navigation.navigate('ComingSoonRegion', { regionId: id });
        } else {
          setBloqueio(permissao.motivo);
        }
        return;
      }

      void useRunStore
        .getState()
        .enterRegion(id)
        .then(() => navigation.navigate('Scenario'));
    },
    [navigation]
  );
  const controller = useMapController(active, enter);
  const { state } = controller;
  const selected = findRegion(state.regionId);
  const enabled = active && !reducedMotion && state.phase !== 'entering';
  // The reserved border accommodates the lift and the largest camera scale.
  const size = Math.max(0, Math.min(stage.width * 0.8, stage.height * 0.8, 400));
  const ready = state.phase === 'selected';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <StatusBar backgroundColor={APP_COLORS.background.base} barStyle="dark-content" />
      <MapPaper enabled={enabled} />
      <ScreenVignette />
      <View style={styles.header}>
        <View style={styles.ornament} accessible={false}>
          <View style={styles.rule} />
          <Text style={styles.star}>✦</Text>
          <View style={styles.rule} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          Lendas do Brasil
        </Text>
        <Text style={styles.subtitle}>Escolha sua região</Text>
      </View>

      <View
        style={styles.stage}
        onLayout={({ nativeEvent: { layout } }) =>
          setStage({ width: layout.width, height: layout.height })
        }>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={controller.cancel}
          accessible={false}
          tabIndex={-1}
          testID="map-paper"
        />
        {size > 0 && (
          <MapComposition
            size={size}
            state={state}
            active={active}
            reducedMotion={reducedMotion}
            onPress={controller.press}
            onCancel={controller.cancel}
            onFocusFinished={controller.focusFinished}
            onEnterFinished={controller.enterFinished}
          />
        )}
        <MapAtmosphere width={stage.width} height={stage.height} enabled={enabled} />
      </View>

      <View style={styles.controls}>
        <Text style={styles.selection} accessibilityLiveRegion="polite" testID="map-selection">
          {bloqueio
            ? MOTIVO_TEXTO[bloqueio]
            : selected
              ? `${selected.name} · ${selected.destination === 'Scenario' ? selected.scenarioName : 'Em breve'}`
              : 'Cinco regiões, muitas histórias'}
        </Text>
        <Text style={styles.hint}>
          {state.phase === 'entering'
            ? 'Abrindo os caminhos desta história…'
            : selected
              ? 'Toque novamente na região ou confirme abaixo.'
              : 'Toque em uma região para descobrir seus caminhos.'}
        </Text>
        <Pressable
          onPress={controller.confirm}
          disabled={!ready || !active}
          accessibilityRole="button"
          accessibilityLabel={
            selected
              ? `${selected.destination === 'Scenario' ? 'Entrar no capítulo' : 'Conhecer região'}: ${selected.name}`
              : 'Selecione uma região'
          }
          accessibilityState={{ disabled: !ready || !active, busy: state.phase === 'entering' }}
          aria-disabled={!ready || !active}
          aria-busy={state.phase === 'entering'}
          style={({ pressed }) => [
            styles.confirm,
            (!ready || !active) && styles.disabled,
            pressed && styles.pressed,
          ]}
          testID="map-confirm">
          <Text style={styles.confirmText}>
            {selected
              ? selected.destination === 'Scenario'
                ? 'Entrar no capítulo'
                : 'Conhecer região'
              : 'Selecione uma região'}
          </Text>
        </Pressable>
        <Pressable
          onPress={controller.cancel}
          disabled={!selected || state.phase === 'entering'}
          accessibilityRole="button"
          style={styles.cancel}
          accessibilityState={{ disabled: !selected || state.phase === 'entering' }}
          testID="map-cancel">
          <Text style={[styles.cancelText, !selected && styles.invisible]}>
            Voltar ao mapa inteiro
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: APP_COLORS.background.base, overflow: 'hidden' },
  header: { alignItems: 'center', paddingTop: 12, paddingHorizontal: 16 },
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 4 },
  rule: { width: 36, height: 1, backgroundColor: APP_COLORS.text.muted, opacity: 0.5 },
  star: { fontSize: 10, color: APP_COLORS.text.muted },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.xilosa,
    fontSize: 28,
    color: APP_COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.xilosa,
    fontSize: 12,
    color: APP_COLORS.text.muted,
    letterSpacing: 3,
    marginTop: 4,
  },
  stage: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' },
  controls: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  selection: {
    fontFamily: TYPOGRAPHY.fontFamily.xilosa,
    color: APP_COLORS.text.primary,
    fontSize: 18,
    textAlign: 'center',
  },
  hint: {
    fontFamily: TYPOGRAPHY.fontFamily.cordelItalic,
    color: APP_COLORS.text.secondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  confirm: {
    minHeight: 48,
    minWidth: 220,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: APP_COLORS.buttons.primary,
    borderRadius: 2,
  },
  confirmText: {
    fontFamily: TYPOGRAPHY.fontFamily.cordelRegular,
    color: APP_COLORS.buttons.primaryText,
    fontSize: 16,
    textAlign: 'center',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  cancel: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  cancelText: {
    fontFamily: TYPOGRAPHY.fontFamily.cordelRegular,
    fontSize: 13,
    color: APP_COLORS.text.secondary,
    textDecorationLine: 'underline',
  },
  invisible: { opacity: 0 },
});
