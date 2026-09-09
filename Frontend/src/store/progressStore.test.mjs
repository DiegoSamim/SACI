import test from 'node:test';
import assert from 'node:assert/strict';
import { useProgressStore } from './progressStore.ts';
import { useRunStore } from './runStore.ts';
import { loadProgress, loadSlot, memoryBackend, novoProgresso } from '@/services/storage.ts';
import { REGION_REGISTRY } from '@/data/regions';

const NORDESTE = REGION_REGISTRY.nordeste;
const acharFinal = (id) => NORDESTE.endings.find((e) => e.id === id);

function preparar(backend = memoryBackend()) {
  useProgressStore.setState({ progresso: novoProgresso(), slots: [], hidratado: true, backend });
  useRunStore.setState({ run: null, desfecho: null, backend });
  return backend;
}

const progresso = () => useProgressStore.getState();
const run = () => useRunStore.getState();

const registrar = (overrides = {}) =>
  progresso().registrarFinal({
    region: NORDESTE,
    ending: acharFinal('nordeste_reza_na_soleira'),
    podeCatalogar: true,
    state: { 'pista.cabra_voz': 1, 'pista.cabra_reza': 1, 'pista.cabra_rastros': 1 },
    clueOrder: ['cabra_rastros', 'cabra_reza', 'cabra_voz'],
    slot: 1,
    savedAt: 1000,
    ...overrides,
  });

// ─── Caderno de campo ───────────────────────────────────────────────────────

test('a ficha guarda as tres secoes', async () => {
  preparar();
  await registrar();

  const entrada = progresso().entradaDex('cabra_cabriola');
  assert.equal(entrada.lenda, NORDESTE.dex.lenda, 'factual, fixa');
  assert.equal(entrada.registros[0].completude, 1, 'relato do investigador');
  assert.ok(entrada.registros[0].moral.length > 0, 'o que ficou');
});

test('registros empilham e ficam ordenados por completude', async () => {
  preparar();
  await registrar({ slot: 1, savedAt: 1 });
  await registrar({
    slot: 2,
    savedAt: 2,
    state: { 'pista.cabra_voz': 1 },
    clueOrder: ['cabra_voz'],
    ending: acharFinal('nordeste_silencio_que_ficou'),
  });

  const registros = progresso().entradaDex('cabra_cabriola').registros;
  assert.equal(registros.length, 2, 'empilham, nao sobrescrevem');
  assert.deepEqual(
    registros.map((r) => r.completude),
    [1, 0.33],
    'o mais completo em destaque'
  );
  assert.deepEqual(registros.map((r) => r.slot), [1, 2], 'duas vozes na mesma pagina');
});

test('fuga nao cataloga, mas entra na galeria', async () => {
  preparar();
  await registrar({
    ending: acharFinal('nordeste_estrada_antes_da_noite'),
    podeCatalogar: false,
    state: {},
    clueOrder: [],
  });

  assert.equal(progresso().entradaDex('cabra_cabriola'), undefined, 'ficha nao registrada');
  assert.deepEqual(progresso().progresso.finaisVistos, ['nordeste_estrada_antes_da_noite']);
  assert.ok(NORDESTE.dex.textoNaoRegistrado.length > 0, 'ha explicacao diegetica');
});

test('finaisVistos nao duplica o mesmo final', async () => {
  preparar();
  await registrar();
  await registrar({ slot: 2 });
  assert.deepEqual(progresso().progresso.finaisVistos, ['nordeste_reza_na_soleira']);
});

// ─── O global sobrevive ao slot ─────────────────────────────────────────────

test('apagar um save nao apaga o caderno nem a galeria', async () => {
  const backend = preparar();
  await run().createRun(1);
  await run().enterRegion('nordeste');
  await run().choose('praca_ir_embora');

  const galeriaAntes = [...progresso().progresso.finaisVistos];
  assert.ok(galeriaAntes.length > 0);

  await run().deleteRun(1);

  assert.equal(await loadSlot(backend, 1, REGION_REGISTRY), null, 'save apagado');
  assert.deepEqual((await loadProgress(backend)).finaisVistos, galeriaAntes, 'galeria intacta');
});

// ─── Espelhos meta.* ────────────────────────────────────────────────────────

test('os espelhos meta.tag_* acumulam no slot ao concluir regioes', async () => {
  preparar();
  await run().createRun(1);
  await run().enterRegion('nordeste');
  await run().choose('praca_ir_embora');

  assert.equal(run().run.qualities['meta.tag_fuga'], 1);
  assert.equal(run().run.qualities['meta.regioes_concluidas'], 1);
});

// ─── Atomicidade ao encerrar ────────────────────────────────────────────────

test('ordem de escrita ao encerrar: global antes do slot', async () => {
  const ordem = [];
  const dados = new Map();
  const backend = {
    get: async (k) => dados.get(k) ?? null,
    set: async (k, v) => {
      ordem.push(k.startsWith('saci.slot.') ? 'slot' : 'global');
      dados.set(k, v);
    },
    remove: async (k) => void dados.delete(k),
  };
  preparar(backend);
  await run().createRun(1);
  await run().enterRegion('nordeste');
  ordem.length = 0;

  await run().choose('praca_ir_embora');

  const global = ordem.indexOf('global');
  const slot = ordem.lastIndexOf('slot');
  assert.ok(global !== -1 && slot !== -1);
  assert.ok(global < slot, `global deve vir antes do slot, veio: ${ordem.join(' -> ')}`);
});

test('falha ao gravar o slot deixa o estado recuperavel, nao o irrecuperavel', async () => {
  // Uma falha entre as duas escritas tem de deixar registro orfao no caderno —
  // o jogador rejoga e o registro melhor empilha por cima. O inverso (regiao
  // marcada como concluida sem ficha) e irrecuperavel: canEnterRegion bloqueia
  // a rejogada para sempre.
  const dados = new Map();
  let global_ok = false;
  const backend = {
    get: async (k) => dados.get(k) ?? null,
    set: async (k, v) => {
      if (k === 'saci.progress') global_ok = true;
      // Falha so na gravacao do slot que acontece DEPOIS do global.
      if (k.startsWith('saci.slot.') && global_ok) throw new Error('disco cheio');
      dados.set(k, v);
    },
    remove: async (k) => void dados.delete(k),
  };
  preparar(backend);
  await run().createRun(1);
  await run().enterRegion('nordeste');

  await run().choose('praca_ir_embora');

  // O caderno e a galeria ficaram gravados...
  assert.deepEqual((await loadProgress(backend)).finaisVistos, ['nordeste_estrada_antes_da_noite']);
  // ...e o slot em disco NAO marcou a regiao como concluida.
  const emDisco = await loadSlot(backend, 1, REGION_REGISTRY);
  assert.deepEqual(emDisco.regioesConcluidas, {}, 'regiao segue rejogavel — recuperavel');
});

// ─── Boot ───────────────────────────────────────────────────────────────────

test('hydrate carrega o global e os slots, sem ativar partida', async () => {
  const backend = preparar();
  await run().createRun(2);
  await run().enterRegion('nordeste');

  useProgressStore.setState({ progresso: novoProgresso(), slots: [], hidratado: false, backend });
  useRunStore.setState({ run: null, backend });

  await progresso().hydrate();

  assert.equal(progresso().hidratado, true);
  assert.equal(progresso().progresso.ultimoSlotJogado, 2, 'o menu sabe o que Continuar carrega');
  assert.equal(progresso().slots.find((s) => s.slot === 2).vazio, false);
  assert.equal(progresso().slots.find((s) => s.slot === 1).vazio, true);
  assert.equal(run().run, null, 'nenhuma partida ativa');
});

test('storage falhando no boot inicia vazio com aviso, nunca tela branca', async () => {
  const backend = {
    get: async () => {
      throw new Error('storage indisponivel');
    },
    set: async () => {},
    remove: async () => {},
  };
  useProgressStore.setState({ progresso: novoProgresso(), slots: [], hidratado: false, backend });

  const avisos = [];
  const original = console.warn;
  console.warn = (...args) => avisos.push(args.join(' '));
  try {
    await progresso().hydrate();
  } finally {
    console.warn = original;
  }

  assert.equal(progresso().hidratado, true, 'o app abre');
  assert.deepEqual(progresso().progresso, novoProgresso());
  assert.deepEqual(progresso().slots, []);
  assert.equal(avisos.length, 1, 'e avisa');
  assert.match(avisos[0], /progresso salvo/);
});
