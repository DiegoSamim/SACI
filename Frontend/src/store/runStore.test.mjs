// Testa a partida ativa de ponta a ponta, com persistencia. O driver puro da
// engine continua em engine/playthrough.test.mjs; aqui o foco e o que e NOVO:
// slots, gravacao em marcos, e o save sobrevivendo ao fechamento do app.

import test from 'node:test';
import assert from 'node:assert/strict';
import { useRunStore } from './runStore.ts';
import { useProgressStore } from './progressStore.ts';
import { memoryBackend, novoProgresso } from '@/services/storage.ts';
import { REGION_REGISTRY } from '@/data/regions';

/** Backend em memoria que expoe o mapa de bytes e conta as escritas. */
function backendEspiao(inicial = {}) {
  const dados = new Map(Object.entries(inicial));
  const espiao = {
    escritas: 0,
    bytes: () => Object.fromEntries(dados),
    get: async (key) => dados.get(key) ?? null,
    set: async (key, value) => {
      // So conta gravacao de slot: o progresso global grava por conta propria.
      if (key.startsWith('saci.slot.')) espiao.escritas++;
      dados.set(key, value);
    },
    remove: async (key) => void dados.delete(key),
  };
  return espiao;
}

async function novoJogo(backend = backendEspiao()) {
  useProgressStore.setState({ progresso: novoProgresso(), slots: [], hidratado: true, backend });
  useRunStore.setState({ run: null, desfecho: null, backend });
  await useRunStore.getState().createRun(1);
  return backend;
}

const run = () => useRunStore.getState();

async function jogar(sequencia) {
  for (const id of sequencia) await run().choose(id);
}

const CAMINHO_BOM = [
  'praca_ir_curral',
  'curral_voltar',
  'praca_ir_bar',
  'raimundo_pagar_dose',
  'raimundo_perguntar_reza',
  'a_reza_voltar',
  'raimundo_perguntar_voz',
  'a_voz_voltar',
  'raimundo_sair',
  'despedida_sair',
  'praca_ir_capela',
  'capela_rezar_na_porta',
];

// ─── Paridade com o driver puro da engine ───────────────────────────────────

test('o store chega ao mesmo final que o driver da engine', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(CAMINHO_BOM);

  assert.equal(run().desfecho.endingId, 'nordeste_reza_na_soleira');
  assert.equal(run().desfecho.podeCatalogar, true);
  assert.deepEqual(run().desfecho.epilogo.length, 1);
  assert.deepEqual(run().run.clueOrder, ['cabra_rastros', 'cabra_reza', 'cabra_voz']);
  assert.deepEqual(run().run.regioesConcluidas.nordeste, {
    endingId: 'nordeste_reza_na_soleira',
    tags: ['bom'],
  });
});

test('escolha travada nao altera estado nenhum', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_bar']);

  const antes = { ...run().run.qualities };
  await run().choose('raimundo_perguntar_reza'); // travada: humor ainda e 0
  assert.deepEqual(run().run.qualities, antes, 'nada mudou');
  assert.equal(run().run.qualities['pista.cabra_reza'], undefined);
});

test('escolha inexistente e ignorada sem quebrar', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  const antes = { ...run().run };
  await run().choose('escolha_que_nao_existe');
  assert.deepEqual(run().run.qualities, antes.qualities);
});

// ─── A prova de que o B1 caiu ───────────────────────────────────────────────

test('B1: fechar e reabrir o app preserva a partida inteira', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_curral', 'curral_voltar', 'praca_ir_bar', 'raimundo_pagar_dose']);

  const antes = run().run;

  // Simula reabrir o app: processo novo, store zerado, mesmo mapa de bytes.
  const disco = backendEspiao(backend.bytes());
  useRunStore.setState({ run: null, desfecho: null, backend: disco });
  useProgressStore.setState({ progresso: novoProgresso(), slots: [], hidratado: false, backend: disco });

  assert.equal(run().run, null, 'nenhuma partida ativa antes do menu mandar');
  assert.equal(await run().loadRun(1), true);

  const depois = run().run;
  assert.deepEqual(depois.qualities, antes.qualities);
  assert.deepEqual(depois.clueOrder, antes.clueOrder);
  assert.deepEqual(depois.takenChoices, antes.takenChoices);
  assert.deepEqual(depois.regioesConcluidas, antes.regioesConcluidas);
  assert.equal(depois.currentSceneId, antes.currentSceneId);
  assert.equal(depois.currentRegionId, 'nordeste');
});

test('once sobrevive ao save: a chave composta persistida continua valendo', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_bar', 'raimundo_pagar_dose']);

  const disco = backendEspiao(backend.bytes());
  useRunStore.setState({ run: null, desfecho: null, backend: disco });
  await run().loadRun(1);

  const ids = run().current().escolhas.map((r) => r.choice.id);
  assert.ok(!ids.includes('raimundo_pagar_dose'), 'a dose ja foi paga, e continua paga');
});

test('carregar slot inexistente devolve false e nao ativa partida', async () => {
  await novoJogo();
  useRunStore.setState({ run: null });
  assert.equal(await run().loadRun(3), false);
  assert.equal(run().run, null);
});

// ─── Marcos de autosave ─────────────────────────────────────────────────────

test('marco: troca de cena grava', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');

  const antes = backend.escritas;
  await run().choose('praca_ir_curral'); // praca -> curral
  assert.equal(backend.escritas, antes + 1);
});

test('marco: linha de dialogo COM efeito grava', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_bar']);

  const antes = backend.escritas;
  await run().choose('raimundo_pagar_dose'); // mesma cena, mas mexe no humor
  assert.equal(run().run.currentSceneId, 'nordeste_dialogo_raimundo', 'nao trocou de cena');
  assert.equal(backend.escritas, antes + 1, 'gravou mesmo assim');
});

test('marco: linha de dialogo SEM efeito nao grava', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_bar', 'raimundo_perguntar_voz']);

  const antes = backend.escritas;
  // So navega entre linhas do mesmo dialogo, sem tocar em qualidade nenhuma.
  await run().choose('a_voz_voltar');
  assert.equal(run().run.currentSceneId, 'nordeste_dialogo_raimundo');
  assert.equal(backend.escritas, antes, 'nada mudou, nada gravou');
});

test('flush grava mesmo sem marco — e o gancho do AppState', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');
  const antes = backend.escritas;
  await run().flush();
  assert.equal(backend.escritas, antes + 1);
});

// ─── Regras de entrada ──────────────────────────────────────────────────────

test('canEnterRegion enumera os motivos como uniao fechada', async () => {
  useRunStore.setState({ run: null, backend: memoryBackend() });
  assert.deepEqual(run().canEnterRegion('nordeste'), {
    permitido: false,
    motivo: 'save_inexistente',
  });

  await novoJogo();
  assert.deepEqual(run().canEnterRegion('nordeste'), { permitido: true });
  assert.deepEqual(run().canEnterRegion('norte'), {
    permitido: false,
    motivo: 'regiao_desconhecida',
  });
});

test('nao e permitido rejogar uma regiao no mesmo save', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_embora']); // fuga: encerra a regiao

  assert.deepEqual(run().canEnterRegion('nordeste'), { permitido: false, motivo: 'ja_concluida' });

  await run().enterRegion('nordeste');
  assert.equal(run().run.currentRegionId, null, 'a entrada foi recusada');
});

test('a mesma regiao continua livre em outro save', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_embora']);

  await run().createRun(2);
  assert.deepEqual(run().canEnterRegion('nordeste'), { permitido: true });
});

test('enterRegion e uma escrita so, com a regiao e a cena ja prontas', async () => {
  const backend = await novoJogo();
  const antes = backend.escritas;
  await run().enterRegion('nordeste');

  assert.equal(backend.escritas, antes + 1, 'uma escrita, nao duas');
  const gravado = JSON.parse(backend.bytes()['saci.slot.1']);
  assert.equal(gravado.currentRegionId, 'nordeste');
  assert.equal(gravado.currentSceneId, 'nordeste_praca');
  assert.equal(gravado.qualities['visita.nordeste_praca'], 1, 'a visita ja esta no disco');
});

test('a pista por exploracao entra no caderno AO CHEGAR, nao ao sair', async () => {
  // Regressao: os efeitos da variante eram aplicados na escolha seguinte, entao
  // a lupa marcava zero enquanto a tela dizia que rastros haviam sido achados.
  await novoJogo();
  await run().enterRegion('nordeste');
  await run().choose('praca_ir_curral');

  assert.equal(run().run.currentSceneId, 'nordeste_curral');
  assert.deepEqual(run().run.clueOrder, ['cabra_rastros'], 'ja esta no caderno');
  assert.equal(run().run.qualities['pista.cabra_rastros'], 1);
  assert.match(run().current().texto, /cascos bifurcados/, 'e o texto que a concede');
});

test('a revisita nao reconcede a pista nem duplica o caderno', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_curral', 'curral_voltar', 'praca_ir_curral']);

  assert.deepEqual(run().run.clueOrder, ['cabra_rastros'], 'uma vez so');
  assert.equal(run().run.qualities['visita.nordeste_curral'], 2);
});

// ─── Ferramentas de autoria (consumidas pelo DevInspector) ──────────────────

test('jumpToScene passa por enterScene: incrementa visita e dispara a variante', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');

  // Pular direto para o curral tem de contar como visita, senao a variante de
  // primeira vez nao dispara e o autor depura um bug de conteudo que nao existe.
  run().jumpToScene('nordeste_curral');

  assert.equal(run().run.currentSceneId, 'nordeste_curral');
  assert.equal(run().run.qualities['visita.nordeste_curral'], 1);
  assert.equal(run().current().visitas, 1);

  const primeiroTexto = run().current().texto;
  run().jumpToScene('nordeste_curral');
  assert.equal(run().run.qualities['visita.nordeste_curral'], 2);
  assert.notEqual(run().current().texto, primeiroTexto, 'a revisita muda o texto');
});

test('jumpToScene nao grava — o salto nao contamina o save de verdade', async () => {
  const backend = await novoJogo();
  await run().enterRegion('nordeste');

  const antes = backend.escritas;
  run().jumpToScene('nordeste_capela');
  assert.equal(backend.escritas, antes, 'nenhuma escrita');

  const emDisco = JSON.parse(backend.bytes()['saci.slot.1']);
  assert.equal(emDisco.currentSceneId, 'nordeste_praca', 'o disco segue no caminho real');
});

test('jumpToScene ignora cena inexistente e limpa a linha de dialogo', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_bar', 'raimundo_perguntar_voz']);
  assert.equal(run().run.currentLineId, 'a_voz');

  run().jumpToScene('nordeste_lugar_nenhum');
  assert.equal(run().run.currentSceneId, 'nordeste_dialogo_raimundo', 'nada mudou');

  run().jumpToScene('nordeste_praca');
  assert.equal(run().run.currentLineId, undefined, 'a linha antiga nao vaza');
});

test('percurso: escritas acumulam o que a partida de fato moveu', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_curral']);

  const { escritas } = run().percurso;
  assert.ok(escritas.includes('pista.cabra_rastros'), 'a pista por exploracao entrou');
  assert.ok(escritas.includes('mundo.nordeste.medo_vila'));
  assert.ok(!escritas.includes('humor.raimundo'), 'ninguem falou com Raimundo ainda');
});

test('percurso: lidas sao as chaves do conteudo que o jogador VIU', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');

  // So a praca foi vista: as condicoes dela entram, as do dialogo nao.
  const naPraca = run().percurso.lidas;
  assert.ok(naPraca.includes('mundo.nordeste.ato'), 'hiddenWhen do curral');
  assert.ok(naPraca.includes('pista.cabra_reza'), 'when da capela');
  assert.ok(!naPraca.includes('humor.raimundo'), 'a trava do Raimundo ainda nao foi vista');

  await jogar(['praca_ir_bar']);
  assert.ok(run().percurso.lidas.includes('humor.raimundo'), 'agora foi');
});

test('percurso: uma qualidade que nenhum caminho move fica de fora das escritas', async () => {
  // E exatamente o que o painel revela: humor autorado que ninguem alcanca.
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_embora']);

  const declaradas = REGION_REGISTRY.nordeste.qualities.map((q) => q.key);
  const intocadas = declaradas.filter((k) => !run().percurso.escritas.includes(k));
  assert.ok(intocadas.includes('laco.raimundo'), 'fugir de cara nao constroi laco nenhum');
});

test('percurso zera ao trocar de partida', async () => {
  await novoJogo();
  await run().enterRegion('nordeste');
  await jogar(['praca_ir_curral']);
  assert.ok(run().percurso.escritas.length > 0);

  await run().createRun(2);
  assert.deepEqual(run().percurso, { escritas: [], lidas: [] });
});
