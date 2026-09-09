import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SAVE_VERSION,
  deleteSlot,
  listSlots,
  loadProgress,
  loadSlot,
  memoryBackend,
  migrateProgress,
  migrateSlot,
  novoProgresso,
  novoSlot,
  repararSlot,
  saveProgress,
  saveSlot,
} from './storage.ts';
import { REGION_REGISTRY } from '@/data/regions';

const slotCheio = () => ({
  ...novoSlot(1, 1000),
  currentRegionId: 'nordeste',
  currentSceneId: 'nordeste_curral',
  qualities: { 'pista.cabra_voz': 1 },
  takenChoices: ['nordeste_praca#praca_ir_curral'],
  clueOrder: ['cabra_voz'],
});

test('round-trip de slot preserva tudo', async () => {
  const backend = memoryBackend();
  const original = slotCheio();
  await saveSlot(backend, original);
  assert.deepEqual(await loadSlot(backend, 1, REGION_REGISTRY), original);
});

test('round-trip de progresso global', async () => {
  const backend = memoryBackend();
  const progresso = { ...novoProgresso(), finaisVistos: ['nordeste_reza_na_soleira'], ultimoSlotJogado: 2 };
  await saveProgress(backend, progresso);
  assert.deepEqual(await loadProgress(backend), progresso);
});

test('slot inexistente devolve null, nao erro', async () => {
  assert.equal(await loadSlot(memoryBackend(), 3, REGION_REGISTRY), null);
});

test('progresso inexistente devolve um progresso vazio, nao null', async () => {
  assert.deepEqual(await loadProgress(memoryBackend()), novoProgresso());
});

// ─── Robustez: nada aqui pode derrubar o app ────────────────────────────────

test('JSON corrompido devolve null sem estourar', () => {
  assert.equal(migrateSlot('{isso nao e json'), null);
  assert.equal(migrateSlot(''), null);
  assert.equal(migrateSlot(null), null);
  assert.equal(migrateSlot('[1,2,3]'), null, 'array nao e um slot');
  assert.equal(migrateSlot('"texto"'), null);
  assert.equal(migrateProgress('{quebrado'), null);
});

test('version ausente ou invalida devolve null', () => {
  assert.equal(migrateSlot(JSON.stringify({ slot: 1 })), null);
  assert.equal(migrateSlot(JSON.stringify({ ...slotCheio(), version: undefined })), null);
  assert.equal(migrateSlot(JSON.stringify({ ...slotCheio(), version: '1' })), null);
  assert.equal(migrateSlot(JSON.stringify({ ...slotCheio(), version: 0 })), null);
  assert.equal(migrateSlot(JSON.stringify({ ...slotCheio(), version: 1.5 })), null);
});

test('version do futuro devolve null — nao da para adivinhar o formato', () => {
  const doFuturo = JSON.stringify({ ...slotCheio(), version: SAVE_VERSION + 1 });
  assert.equal(migrateSlot(doFuturo), null);
  assert.equal(migrateProgress(JSON.stringify({ ...novoProgresso(), version: 99 })), null);
});

test('campo obrigatorio faltando devolve null', () => {
  const semQualities = { ...slotCheio() };
  delete semQualities.qualities;
  assert.equal(migrateSlot(JSON.stringify(semQualities)), null);

  const semTaken = { ...slotCheio(), takenChoices: 'nao e array' };
  assert.equal(migrateSlot(JSON.stringify(semTaken)), null);
});

test('save robusto: currentSceneId inexistente volta a entrada da regiao', () => {
  const quebrado = { ...slotCheio(), currentSceneId: 'nordeste_cena_que_sumiu', currentLineId: 'x' };
  const reparado = repararSlot(quebrado, REGION_REGISTRY);
  assert.equal(reparado.currentSceneId, REGION_REGISTRY.nordeste.meta.entrySceneId);
  assert.equal(reparado.currentLineId, undefined);
  assert.deepEqual(reparado.qualities, quebrado.qualities, 'o progresso e preservado');
});

test('save robusto: regionId que nao existe mais vira partida sem regiao', () => {
  const quebrado = { ...slotCheio(), currentRegionId: 'norte' };
  const reparado = repararSlot(quebrado, REGION_REGISTRY);
  assert.equal(reparado.currentRegionId, null);
  assert.equal(reparado.currentSceneId, '');
  assert.deepEqual(reparado.regioesConcluidas, quebrado.regioesConcluidas);
});

test('reparo passa direto quando a cena existe', () => {
  const ok = slotCheio();
  assert.deepEqual(repararSlot(ok, REGION_REGISTRY), ok);
});

test('backend.set que rejeita: saveSlot propaga erro tratavel, estado segue valido', async () => {
  const backend = {
    get: async () => null,
    set: async () => {
      throw new Error('disco cheio');
    },
    remove: async () => {},
  };
  const run = slotCheio();
  await assert.rejects(() => saveSlot(backend, run), /disco cheio/);
  // O objeto em memoria nao foi tocado pela falha de escrita.
  assert.deepEqual(run, slotCheio());
});

test('backend.get que rejeita propaga — quem chama e que decide (hydrate faz catch)', async () => {
  const backend = {
    get: async () => {
      throw new Error('leitura falhou');
    },
    set: async () => {},
    remove: async () => {},
  };
  await assert.rejects(() => loadSlot(backend, 1, REGION_REGISTRY), /leitura falhou/);
});

// ─── Slots e isolamento ─────────────────────────────────────────────────────

test('listSlots resume os tres, marcando os vazios', async () => {
  const backend = memoryBackend();
  await saveSlot(backend, { ...slotCheio(), regioesConcluidas: { nordeste: { endingId: 'x', tags: ['bom'] } } });

  const resumos = await listSlots(backend, REGION_REGISTRY);
  assert.equal(resumos.length, 3);
  assert.deepEqual(resumos[0], {
    slot: 1,
    vazio: false,
    regionId: 'nordeste',
    atualizadoEm: 1000,
    regioesConcluidas: 1,
  });
  assert.deepEqual(resumos[1], { slot: 2, vazio: true });
  assert.deepEqual(resumos[2], { slot: 3, vazio: true });
});

test('apagar um slot nao toca o progresso global nem os outros slots', async () => {
  const backend = memoryBackend();
  await saveSlot(backend, slotCheio());
  await saveSlot(backend, { ...slotCheio(), slot: 2 });
  await saveProgress(backend, { ...novoProgresso(), finaisVistos: ['nordeste_reza_na_soleira'] });

  await deleteSlot(backend, 1);

  assert.equal(await loadSlot(backend, 1, REGION_REGISTRY), null);
  assert.ok(await loadSlot(backend, 2, REGION_REGISTRY), 'slot 2 intacto');
  assert.deepEqual((await loadProgress(backend)).finaisVistos, ['nordeste_reza_na_soleira']);
});

test('os tres slots vivem em chaves separadas e nao se misturam', async () => {
  const backend = memoryBackend();
  await saveSlot(backend, { ...slotCheio(), slot: 1, clueOrder: ['cabra_voz'] });
  await saveSlot(backend, { ...slotCheio(), slot: 2, clueOrder: ['cabra_reza'] });
  await saveSlot(backend, { ...slotCheio(), slot: 3, clueOrder: [] });

  assert.deepEqual((await loadSlot(backend, 1, REGION_REGISTRY)).clueOrder, ['cabra_voz']);
  assert.deepEqual((await loadSlot(backend, 2, REGION_REGISTRY)).clueOrder, ['cabra_reza']);
  assert.deepEqual((await loadSlot(backend, 3, REGION_REGISTRY)).clueOrder, []);
});
