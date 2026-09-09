// As duas seções da ficha que **variam por save** (§8): o relato do investigador
// e "o que ficou". A terceira — a lenda — é factual e nunca parcial, e vive na
// própria tela do catálogo.
//
// O caderno é herdado: registros **empilham**, não sobrescrevem. O mais completo
// fica em destaque e os anteriores aparecem assinados — duas investigações da
// mesma criatura com finais diferentes viram duas vozes discordando na página.

import { StyleSheet, Text, View } from 'react-native';
import { APP_COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import { REGION_REGISTRY } from '@/data/regions';
import { useProgressStore } from '@/store/progressStore';

type Props = { creatureId: string; accent: string };

export default function DexRegistros({ creatureId, accent }: Props) {
  const entrada = useProgressStore((estado) => estado.progresso.dex[creatureId]);
  if (!entrada || entrada.registros.length === 0) return null;

  const regiao = REGION_REGISTRY[entrada.regionId];
  const [principal, ...anteriores] = entrada.registros;
  const tituloDaPista = (clueId: string) => regiao?.clues[clueId]?.titulo ?? clueId;

  return (
    <>
      <View style={styles.section}>
        <Text style={[styles.titulo, { color: APP_COLORS.text.muted }]}>
          Relato do investigador
        </Text>
        <Text style={[styles.completude, { color: accent }]}>
          {Math.round(principal.completude * 100)}% do que havia para descobrir
        </Text>
        {principal.pistas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma pista anotada.</Text>
        ) : (
          principal.pistas.map((clueId, i) => (
            <View key={clueId} style={[styles.pista, { borderLeftColor: accent }]}>
              <Text style={styles.pistaOrdem}>{i + 1}</Text>
              <Text style={styles.pistaTexto}>{tituloDaPista(clueId)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.titulo, { color: APP_COLORS.text.muted }]}>O que ficou</Text>
        <Text style={[styles.moral, { fontFamily: TYPOGRAPHY.fontFamily.cordelRegular }]}>
          {principal.moral}
        </Text>
      </View>

      {anteriores.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.titulo, { color: APP_COLORS.text.muted }]}>
            Registros anteriores
          </Text>
          {anteriores.map((registro) => (
            <Text key={`${registro.slot}-${registro.savedAt}`} style={styles.anterior}>
              caderno {registro.slot} · {Math.round(registro.completude * 100)}% · {registro.moral}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 22 },
  titulo: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  completude: { fontSize: 12, letterSpacing: 0.6, marginBottom: 10 },
  vazio: { fontSize: 13, color: APP_COLORS.text.muted, fontStyle: 'italic' },
  pista: { borderLeftWidth: 2, paddingLeft: 10, marginBottom: 8, flexDirection: 'row', gap: 10 },
  pistaOrdem: { fontSize: 12, color: APP_COLORS.text.muted, minWidth: 14 },
  pistaTexto: { fontSize: 14, color: APP_COLORS.text.secondary, flex: 1 },
  moral: { fontSize: 15, lineHeight: 24, color: APP_COLORS.text.secondary, fontStyle: 'italic' },
  anterior: { fontSize: 12, lineHeight: 20, color: APP_COLORS.text.muted, marginBottom: 8 },
});
