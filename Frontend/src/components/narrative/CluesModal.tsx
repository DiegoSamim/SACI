// Caderno de pistas da partida em curso. Extraído de Scenario e Dialogue, onde
// vivia duplicado byte a byte (dívida D3).
//
// A ordem é a de **descoberta** (`SaveSlot.clueOrder`), não a de declaração: o
// caderno conta como o investigador chegou lá.

import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { APP_COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import type { ClueDef } from '@/types/region';

type Props = {
  visible: boolean;
  onClose: () => void;
  clues: ClueDef[];
};

export default function CluesModal({ visible, onClose, clues }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={styles.box}>
          <View style={styles.header}>
            <View style={styles.dividerLine} />
            <Text style={styles.headerStar}>✦</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={[styles.title, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
            Pistas Encontradas
          </Text>

          {clues.length === 0 ? (
            <Text style={styles.empty}>Nenhuma pista encontrada ainda.</Text>
          ) : (
            <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
              {clues.map((clue) => (
                <View key={clue.id} style={styles.item}>
                  <Text style={styles.icone}>{clue.icone}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitulo, { fontFamily: TYPOGRAPHY.fontFamily.xilosa }]}>
                      {clue.titulo}
                    </Text>
                    <Text
                      style={[
                        styles.itemDesc,
                        { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular },
                      ]}>
                      {clue.descricao}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity onPress={onClose} style={styles.fechar}>
            <Text style={[styles.fecharTexto, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
              Fechar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: APP_COLORS.background.vignetteStrong,
    justifyContent: 'flex-end',
  },
  box: {
    backgroundColor: APP_COLORS.background.base,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 28,
    paddingBottom: 40,
    borderTopWidth: 3,
    borderTopColor: APP_COLORS.text.primary,
    maxHeight: '76%',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: APP_COLORS.text.primary, opacity: 0.25 },
  headerStar: { fontSize: 10, color: APP_COLORS.text.primary, opacity: 0.4 },
  title: { fontSize: 22, color: APP_COLORS.text.primary, marginBottom: 20, letterSpacing: 2 },
  empty: { color: APP_COLORS.text.muted, fontSize: 14, fontStyle: 'italic' },
  lista: { marginBottom: 8 },
  item: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'flex-start' },
  icone: { fontSize: 22, marginTop: 2 },
  itemTitulo: { fontSize: 15, color: APP_COLORS.text.primary, marginBottom: 3 },
  itemDesc: { fontSize: 13, color: APP_COLORS.text.secondary, lineHeight: 19 },
  fechar: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: APP_COLORS.buttons.primary,
    borderRadius: 6,
  },
  fecharTexto: { color: APP_COLORS.text.onDark, fontSize: 15, letterSpacing: 1.5 },
});
