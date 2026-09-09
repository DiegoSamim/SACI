// ─── Inspetor de autoria ─────────────────────────────────────────────────────
// Só em `__DEV__`. É **este componente** que restringe as ferramentas de autoria
// ao build de desenvolvimento — o store não conhece flag de build, e é por isso
// que `jumpToScene` e o percurso continuam testáveis em node.
//
// A razão de existir é o painel "por que não aparece". No modelo v1 dava para
// ler a condição na própria escolha (`requiresClues: ["cabra_voz"]`). Com estado
// numérico e `anyOf` sobre dez chaves, não dá — e um bug de conteúdo fica
// indistinguível de um bug de engine sem uma janela para o estado.

import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { APP_COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import {
  evaluateCondition,
  indexQualities,
  moodBand,
  resolveEnding,
  whyHidden,
  type ChoiceContext,
} from '@/engine';
import { useRunStore } from '@/store/runStore';
import type { RegionContent } from '@/types/region';
import type { SaveSlot } from '@/types/save';
import type { Choice, ResolvedLine, ResolvedScene } from '@/types/scene';

const NAMESPACES = ['pista.', 'humor.', 'laco.', 'mundo.', 'feito.', 'visita.', 'meta.'];

export default function DevInspector() {
  const [aberto, setAberto] = useState(false);
  const [destino, setDestino] = useState('');
  const [porQue, setPorQue] = useState<string | null>(null);

  const run = useRunStore((estado) => estado.run);
  const percurso = useRunStore((estado) => estado.percurso);
  const regiao = useRunStore((estado) => estado.regiaoAtual());
  const jumpToScene = useRunStore((estado) => estado.jumpToScene);

  const resolvida = useMemo(() => (run ? useRunStore.getState().current() : null), [run]);

  if (!aberto) {
    return (
      <Pressable
        style={styles.gatilho}
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir inspetor de autoria">
        <Text style={styles.gatilhoTexto}>◆</Text>
      </Pressable>
    );
  }

  const fechar = () => {
    setAberto(false);
    setPorQue(null);
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={fechar}>
      <View style={styles.fundo}>
        <View style={styles.painel}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>Inspetor</Text>
            <Pressable onPress={fechar} accessibilityRole="button">
              <Text style={styles.fechar}>fechar</Text>
            </Pressable>
          </View>

          {!run || !regiao ? (
            <Text style={styles.vazio}>Nenhuma partida em curso.</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Cena run={run} regiao={regiao} resolvida={resolvida} />
              <PorQue
                run={run}
                regiao={regiao}
                resolvida={resolvida}
                porQue={porQue}
                setPorQue={setPorQue}
              />
              <Qualidades run={run} regiao={regiao} />
              <Percurso regiao={regiao} percurso={percurso} />
              <Finais run={run} regiao={regiao} />
              <Pular
                regiao={regiao}
                destino={destino}
                setDestino={setDestino}
                onPular={jumpToScene}
              />
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Painéis ─────────────────────────────────────────────────────────────────

type Run = SaveSlot;
type Regiao = RegionContent;
type Resolvida = ResolvedScene | ResolvedLine | null;

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function Linha({ chave, valor }: { chave: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaChave} numberOfLines={1}>
        {chave}
      </Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

function Cena({ run, regiao, resolvida }: { run: Run; regiao: Regiao; resolvida: Resolvida }) {
  const scene = regiao.scenes[run.currentSceneId];
  const visitas = run.qualities[`visita.${run.currentSceneId}`] ?? 0;
  return (
    <Secao titulo="Cena">
      <Linha chave="cena" valor={run.currentSceneId || '—'} />
      {run.currentLineId && <Linha chave="linha" valor={run.currentLineId} />}
      <Linha chave="tipo" valor={scene?.type ?? '—'} />
      <Linha chave="visitas" valor={String(visitas)} />
      <Linha chave="escolhas visíveis" valor={String(resolvida?.escolhas.length ?? 0)} />
      <Linha chave="escolhas já usadas" valor={String(run.takenChoices.length)} />
    </Secao>
  );
}

/**
 * O painel que justifica o inspetor. Ao tocar numa escolha, diz qual predicado
 * a segura — e lista também as **ocultas**, que por definição não chegam à tela.
 */
function PorQue({
  run,
  regiao,
  resolvida,
  porQue,
  setPorQue,
}: {
  run: Run;
  regiao: Regiao;
  resolvida: Resolvida;
  porQue: string | null;
  setPorQue: (v: string | null) => void;
}) {
  const scene = regiao.scenes[run.currentSceneId];
  if (!scene) return null;

  const ctx: ChoiceContext = { sceneId: scene.id, lineId: run.currentLineId };
  const autoradas: Choice[] =
    scene.type === 'local'
      ? scene.escolhas
      : (scene.linhas[run.currentLineId ?? scene.linhaInicial]?.escolhas ?? []);

  const visiveis = new Map((resolvida?.escolhas ?? []).map((r) => [r.choice.id, r]));

  return (
    <Secao titulo="Por que não aparece">
      {porQue && <Text style={styles.explicacao}>{porQue}</Text>}
      {autoradas.map((choice) => {
        const resolvidaEscolha = visiveis.get(choice.id);
        const estado = resolvidaEscolha?.estado ?? 'oculta';
        return (
          <Pressable
            key={choice.id}
            style={styles.escolha}
            onPress={() => {
              if (estado === 'travada') {
                const p = resolvidaEscolha?.predicadoQueFalhou;
                setPorQue(
                  p
                    ? `travada por lockedWhen: ${p.key} ${p.op} ${p.value} (atual: ${run.qualities[p.key] ?? 0})`
                    : 'travada por lockedWhen'
                );
              } else if (estado === 'oculta') {
                setPorQue(
                  whyHidden(choice, run.qualities, run.takenChoices, ctx) ??
                    'oculta, motivo desconhecido'
                );
              } else {
                setPorQue(`"${choice.id}" está disponível.`);
              }
            }}>
            <Text style={[styles.escolhaEstado, ESTADO_COR[estado]]}>{estado}</Text>
            <Text style={styles.escolhaId} numberOfLines={1}>
              {choice.id}
            </Text>
          </Pressable>
        );
      })}
    </Secao>
  );
}

function Qualidades({ run, regiao }: { run: Run; regiao: Regiao }) {
  const indice = indexQualities(regiao.qualities);
  const chaves = Object.keys(run.qualities).sort();

  return (
    <Secao titulo="Qualidades">
      {NAMESPACES.map((ns) => {
        const doNamespace = chaves.filter((k) => k.startsWith(ns));
        if (doNamespace.length === 0) return null;
        return (
          <View key={ns} style={styles.namespace}>
            <Text style={styles.namespaceNome}>{ns}</Text>
            {doNamespace.map((chave) => {
              const def = indice[chave];
              // Humor chega em palavra, nunca em número — é o contrato do §3.
              const faixa = def ? moodBand(def, run.qualities) : undefined;
              const valor = String(run.qualities[chave]);
              return (
                <Linha
                  key={chave}
                  chave={def?.label ? `${chave}  ·  ${def.label}` : chave}
                  valor={faixa ? `${valor}  (${faixa})` : valor}
                />
              );
            })}
          </View>
        );
      })}
    </Secao>
  );
}

/**
 * O par em runtime dos avisos 17 e 18 do validador. O validador vê o conteúdo
 * estático; isto mostra o que **esta partida** moveu — revelando humor autorado
 * que nenhum caminho real alcança.
 */
function Percurso({
  regiao,
  percurso,
}: {
  regiao: Regiao;
  percurso: { escritas: string[]; lidas: string[] };
}) {
  const declaradas = regiao.qualities.map((q) => q.key);
  const nuncaEscritas = declaradas.filter((k) => !percurso.escritas.includes(k));
  const nuncaLidas = declaradas.filter((k) => !percurso.lidas.includes(k));

  return (
    <Secao titulo="Tocadas neste percurso">
      <Text style={styles.nota}>
        &quot;lidas&quot; = aparecem em condição de conteúdo que o jogador viu — não
        &quot;avaliadas&quot;.
      </Text>
      <Text style={styles.subrotulo}>nunca escritas ({nuncaEscritas.length})</Text>
      {nuncaEscritas.length === 0 ? (
        <Text style={styles.nota}>nenhuma — tudo que a região declara foi movido</Text>
      ) : (
        nuncaEscritas.map((k) => (
          <Text key={k} style={styles.chaveSolta}>
            {k}
          </Text>
        ))
      )}
      <Text style={styles.subrotulo}>nunca lidas ({nuncaLidas.length})</Text>
      {nuncaLidas.length === 0 ? (
        <Text style={styles.nota}>nenhuma</Text>
      ) : (
        nuncaLidas.map((k) => (
          <Text key={k} style={styles.chaveSolta}>
            {k}
          </Text>
        ))
      )}
    </Secao>
  );
}

function Finais({ run, regiao }: { run: Run; regiao: Regiao }) {
  const agora = resolveEnding(regiao, run.qualities);
  return (
    <Secao titulo="Simular final">
      <Text style={styles.destaque}>
        agora resolveria: {agora ? agora.ending.id : '— nenhum'}
        {agora && !agora.podeCatalogar ? '  (não cataloga)' : ''}
      </Text>
      {regiao.endings.map((ending) => {
        const casa = evaluateCondition(ending.when, run.qualities);
        return (
          <Linha
            key={ending.id}
            chave={`${ending.id}  p${ending.priority}`}
            valor={ending.when ? (casa ? 'casa' : '—') : 'fallback'}
          />
        );
      })}
    </Secao>
  );
}

function Pular({
  regiao,
  destino,
  setDestino,
  onPular,
}: {
  regiao: Regiao;
  destino: string;
  setDestino: (v: string) => void;
  onPular: (sceneId: string) => void;
}) {
  const ids = Object.keys(regiao.scenes);
  return (
    <Secao titulo="Pular para cena">
      <TextInput
        value={destino}
        onChangeText={setDestino}
        placeholder="sceneId"
        placeholderTextColor={APP_COLORS.text.muted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={() => onPular(destino)}
      />
      <View style={styles.chips}>
        {ids.map((id) => (
          <Pressable key={id} style={styles.chip} onPress={() => onPular(id)}>
            <Text style={styles.chipTexto}>{id.replace(`${regiao.meta.regionId}_`, '')}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.nota}>
        O salto conta a visita e dispara os efeitos da variante — mas não grava.
      </Text>
    </Secao>
  );
}

const ESTADO_COR = StyleSheet.create({
  disponivel: { color: APP_COLORS.dev.disponivel },
  travada: { color: APP_COLORS.dev.travada },
  oculta: { color: APP_COLORS.dev.oculta },
});

const styles = StyleSheet.create({
  gatilho: {
    position: 'absolute',
    left: 8,
    bottom: 28,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: APP_COLORS.background.tabBar,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  gatilhoTexto: { color: APP_COLORS.text.onDark, fontSize: 12 },
  fundo: { flex: 1, backgroundColor: 'rgba(10,6,2,0.7)', justifyContent: 'flex-end' },
  painel: {
    backgroundColor: APP_COLORS.background.tabBar,
    maxHeight: '86%',
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: APP_COLORS.text.onDark,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titulo: {
    color: APP_COLORS.text.onDark,
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: TYPOGRAPHY.fontFamily.xilosa,
  },
  fechar: { color: APP_COLORS.text.onDark, fontSize: 12, opacity: 0.7 },
  vazio: { color: APP_COLORS.text.onDark, opacity: 0.6, paddingVertical: 24, fontSize: 13 },
  secao: { marginBottom: 20 },
  secaoTitulo: {
    color: APP_COLORS.text.onDark,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    opacity: 0.55,
    marginBottom: 8,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 2 },
  linhaChave: { color: APP_COLORS.text.onDark, fontSize: 11, opacity: 0.75, flex: 1 },
  linhaValor: { color: APP_COLORS.text.onDark, fontSize: 11, fontVariant: ['tabular-nums'] },
  namespace: { marginBottom: 10 },
  namespaceNome: { color: APP_COLORS.text.onDark, fontSize: 10, opacity: 0.4, marginBottom: 2 },
  escolha: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 4 },
  escolhaEstado: { fontSize: 10, width: 72, letterSpacing: 0.5 },
  escolhaId: { color: APP_COLORS.text.onDark, fontSize: 11, opacity: 0.8, flex: 1 },
  explicacao: {
    color: APP_COLORS.text.onDark,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
    padding: 8,
    borderLeftWidth: 2,
    borderLeftColor: APP_COLORS.text.onDark,
    opacity: 0.9,
  },
  subrotulo: { color: APP_COLORS.text.onDark, fontSize: 10, opacity: 0.5, marginTop: 10 },
  chaveSolta: { color: APP_COLORS.text.onDark, fontSize: 11, opacity: 0.8, paddingVertical: 1 },
  nota: {
    color: APP_COLORS.text.onDark,
    fontSize: 10,
    opacity: 0.45,
    lineHeight: 15,
    marginTop: 6,
  },
  destaque: { color: APP_COLORS.text.onDark, fontSize: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(237,225,196,0.3)',
    borderRadius: 4,
    color: APP_COLORS.text.onDark,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(237,225,196,0.3)',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipTexto: { color: APP_COLORS.text.onDark, fontSize: 10, opacity: 0.85 },
});
