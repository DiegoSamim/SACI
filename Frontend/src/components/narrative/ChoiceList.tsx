// Lista de escolhas com os dois estados que a engine devolve.
//
// **Travada não é desabilitada.** Ela é clicável, responde com `lockedText` e
// não altera estado nenhum — é o que ensina o sistema ao jogador: ele vê que
// existe caminho e entende o que falta. Oculta nem chega aqui: `availableChoices`
// não a devolve.

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { APP_COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import type { ResolvedChoice } from '@/types/scene';

type Props = {
  escolhas: ResolvedChoice[];
  onEscolher: (escolha: ResolvedChoice) => void;
};

export default function ChoiceList({ escolhas, onEscolher }: Props) {
  return (
    <View style={styles.grid}>
      {escolhas.map((resolvida, i) => {
        const travada = resolvida.estado === 'travada';
        return (
          <Animated.View
            key={resolvida.key}
            entering={FadeInUp.delay(i * 80).duration(350)}
            style={{ width: '100%' }}>
            <TouchableOpacity
              style={[styles.botao, travada && styles.botaoTravado]}
              onPress={() => onEscolher(resolvida)}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityState={{ disabled: travada }}
              accessibilityLabel={
                travada ? `${resolvida.choice.texto} — indisponível` : resolvida.choice.texto
              }>
              <View style={styles.bordaInterna}>
                <Text
                  style={[
                    styles.texto,
                    travada && styles.textoTravado,
                    { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular },
                  ]}>
                  {travada ? `✦ ${resolvida.choice.texto}` : resolvida.choice.texto}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: '100%', gap: 10 },
  botao: {
    backgroundColor: APP_COLORS.buttons.primary,
    borderRadius: 6,
    padding: 2,
    shadowColor: APP_COLORS.text.primary,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
    minHeight: 72,
    justifyContent: 'center',
  },
  // Travada some do primeiro plano sem sumir da página: continua legível e
  // clicável, só deixa de parecer o caminho óbvio.
  botaoTravado: { opacity: 0.55, shadowOpacity: 0.15, elevation: 1 },
  bordaInterna: {
    borderWidth: 1,
    borderColor: 'rgba(237,225,196,0.15)',
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  texto: {
    color: APP_COLORS.text.onDark,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  textoTravado: { fontStyle: 'italic' },
});
