import test from 'node:test';
import assert from 'node:assert/strict';
import { podeCatalogar, resolveEnding, resolveEpilogue, resolveMoral } from './endings.ts';
import { buildRegionCompletion } from './completion.ts';
import { buildDexRecord, computeCompletude } from './dex.ts';
import { NORDESTE_V2 as REGIAO } from '@/data/regions/nordeste';

const acharFinal = (id) => REGIAO.endings.find((e) => e.id === id);

// Estado do caminho bom: as tres pistas e o ato no fim.
const ESTADO_BOM = {
  'pista.cabra_rastros': 1,
  'pista.cabra_voz': 1,
  'pista.cabra_reza': 1,
  'mundo.nordeste.ato': 2,
  'mundo.nordeste.medo_vila': 2,
};

test('resolveEnding escolhe por condicao', () => {
  assert.equal(resolveEnding(REGIAO, ESTADO_BOM).ending.id, 'nordeste_reza_na_soleira');
  assert.equal(
    resolveEnding(REGIAO, { 'feito.nordeste.fugiu': 1 }).ending.id,
    'nordeste_estrada_antes_da_noite'
  );
});

test('sem condicao satisfeita, cai no fallback — o unico final sem when', () => {
  assert.equal(resolveEnding(REGIAO, {}).ending.id, 'nordeste_silencio_que_ficou');
  const semWhen = REGIAO.endings.filter((e) => !e.when);
  assert.equal(semWhen.length, 1, 'exatamente um fallback por regiao');
});

test('prioridade decide quando mais de um final casa', () => {
  // O bom (10) e o de fuga (5) casam ao mesmo tempo; vence o de maior prioridade.
  const ambos = { ...ESTADO_BOM, 'feito.nordeste.fugiu': 1 };
  assert.equal(resolveEnding(REGIAO, ambos).ending.id, 'nordeste_reza_na_soleira');
});

test('endingId explicito forca o final e ignora a condicao', () => {
  assert.equal(resolveEnding(REGIAO, {}, 'nordeste_reza_na_soleira').ending.id, 'nordeste_reza_na_soleira');
  assert.equal(resolveEnding(REGIAO, {}, 'nao_existe'), undefined);
});

test('a regiao tem ao menos um final com tag bom', () => {
  assert.ok(REGIAO.endings.some((e) => e.tags.includes('bom')));
});

test('resolveEpilogue devolve um fragmento por slot, o de maior prioridade', () => {
  const bom = acharFinal('nordeste_reza_na_soleira');
  assert.deepEqual(
    resolveEpilogue(REGIAO, bom, ESTADO_BOM).map((f) => f.id),
    ['vila_apavorada'],
    'medo_vila >= 2 vence a reza'
  );
  assert.deepEqual(
    resolveEpilogue(REGIAO, bom, { 'pista.cabra_reza': 1 }).map((f) => f.id),
    ['vila_com_reza']
  );
});

test('todo slot referenciado tem fragmento fallback', () => {
  const bom = acharFinal('nordeste_reza_na_soleira');
  assert.deepEqual(resolveEpilogue(REGIAO, bom, {}).map((f) => f.id), ['vila_sem_mudanca']);
  for (const slot of REGIAO.meta.epilogueSlots) {
    const fallbacks = REGIAO.epilogue.filter((f) => f.slot === slot && !f.when);
    assert.ok(fallbacks.length >= 1, `slot ${slot} sem fallback`);
  }
});

test('final sem epilogo declarado nao resolve fragmento nenhum', () => {
  assert.deepEqual(resolveEpilogue(REGIAO, { ...acharFinal('nordeste_silencio_que_ficou'), epilogo: undefined }, {}), []);
});

test('resolveMoral casa por tags do final e cai no fallback sem tags', () => {
  assert.equal(resolveMoral(REGIAO.dex, ['bom'], {}).id, 'moral_bom');
  assert.equal(resolveMoral(REGIAO.dex, ['ruim'], {}).id, 'moral_ruim');
  assert.equal(resolveMoral(REGIAO.dex, ['fuga'], {}).id, 'moral_fallback');
  assert.equal(resolveMoral(REGIAO.dex, ['neutro'], {}).id, 'moral_neutro');
  // Final com varias tags casa com todos os fragmentos cujas tags ele contem;
  // a prioridade decide, e a leitura mais dura ganha.
  assert.equal(resolveMoral(REGIAO.dex, ['neutro', 'ruim'], {}).id, 'moral_ruim');
});

test('resolveEnding entrega o veredito de catalogacao junto — a engine e dona da regra', () => {
  assert.equal(resolveEnding(REGIAO, ESTADO_BOM).podeCatalogar, true);
  assert.equal(resolveEnding(REGIAO, { 'feito.nordeste.fugiu': 1 }).podeCatalogar, false, 'fuga');
  assert.equal(resolveEnding(REGIAO, {}).podeCatalogar, true, 'fallback neutro/ruim cataloga');
});

test('podeCatalogar: fuga e a unica tag que impede', () => {
  assert.equal(podeCatalogar(['bom']), true);
  assert.equal(podeCatalogar(['neutro', 'ruim']), true, 'ruim cataloga com relato parcial');
  assert.equal(podeCatalogar(['fuga']), false);
});

// ─── Espelhos meta.* ────────────────────────────────────────────────────────

test('buildRegionCompletion incrementa um contador por tag e o total', () => {
  const bom = acharFinal('nordeste_reza_na_soleira');
  const r = buildRegionCompletion(bom, {});
  assert.equal(r.qualities['meta.tag_bom'], 1);
  assert.equal(r.qualities['meta.regioes_concluidas'], 1);
  assert.equal(r.qualities['meta.tag_fuga'], undefined, 'tag ausente nao e criada');
});

test('final com duas tags incrementa os dois contadores', () => {
  const fallback = acharFinal('nordeste_silencio_que_ficou');
  const r = buildRegionCompletion(fallback, {});
  assert.equal(r.qualities['meta.tag_neutro'], 1);
  assert.equal(r.qualities['meta.tag_ruim'], 1);
  assert.equal(r.qualities['meta.regioes_concluidas'], 1, 'a regiao conta uma vez so');
});

test('os espelhos acumulam entre regioes — e a composicao que o Saci vai ler', () => {
  const bom = acharFinal('nordeste_reza_na_soleira');
  const fuga = acharFinal('nordeste_estrada_antes_da_noite');
  let estado = {};
  estado = buildRegionCompletion(bom, estado).qualities;
  estado = buildRegionCompletion(fuga, estado).qualities;
  estado = buildRegionCompletion(bom, estado).qualities;
  assert.equal(estado['meta.tag_bom'], 2);
  assert.equal(estado['meta.tag_fuga'], 1);
  assert.equal(estado['meta.regioes_concluidas'], 3);
});

test('tag repetida no mesmo final conta uma vez so', () => {
  const r = buildRegionCompletion({ id: 'x', nome: 'X', tags: ['ruim', 'ruim'], priority: 0, texto: '' }, {});
  assert.equal(r.qualities['meta.tag_ruim'], 1);
});

test('buildRegionCompletion e puro e emite endingReached', () => {
  const bom = acharFinal('nordeste_reza_na_soleira');
  const entrada = {};
  const r = buildRegionCompletion(bom, entrada);
  assert.deepEqual(entrada, {}, 'entrada intacta');
  assert.deepEqual(r.events, [
    { type: 'endingReached', endingId: 'nordeste_reza_na_soleira', tags: ['bom'] },
  ]);
});

// ─── Completude e ficha ─────────────────────────────────────────────────────

test('completude nos extremos: nenhuma pista e todas', () => {
  assert.equal(Object.keys(REGIAO.clues).length, 3, 'denominador da fatia');
  assert.equal(computeCompletude(REGIAO, {}), 0);
  assert.equal(computeCompletude(REGIAO, ESTADO_BOM), 1);
});

test('completude e arredondada a duas casas para ficar estavel no save', () => {
  assert.equal(computeCompletude(REGIAO, { 'pista.cabra_voz': 1 }), 0.33);
  assert.equal(computeCompletude(REGIAO, { 'pista.cabra_voz': 1, 'pista.cabra_reza': 1 }), 0.67);
});

test('regiao sem pista declarada devolve 0, nao NaN', () => {
  assert.equal(computeCompletude({ ...REGIAO, clues: {} }, {}), 0);
});

test('pista de outra regiao nao entra na completude nem no relato', () => {
  const comIntrusa = { ...ESTADO_BOM, 'pista.boitata_fogo': 1 };
  assert.equal(computeCompletude(REGIAO, comIntrusa), 1, 'denominador so conta as declaradas');

  const registro = buildDexRecord({
    region: REGIAO,
    ending: acharFinal('nordeste_reza_na_soleira'),
    state: comIntrusa,
    clueOrder: ['boitata_fogo', 'cabra_voz', 'cabra_reza'],
    slot: 1,
    savedAt: 1000,
  });
  assert.deepEqual(registro.pistas, ['cabra_voz', 'cabra_reza'], 'so as desta regiao');
});

test('buildDexRecord preserva a ordem de descoberta e resolve a moral', () => {
  const registro = buildDexRecord({
    region: REGIAO,
    ending: acharFinal('nordeste_reza_na_soleira'),
    state: ESTADO_BOM,
    clueOrder: ['cabra_rastros', 'cabra_voz', 'cabra_reza'],
    slot: 2,
    savedAt: 1234,
  });
  assert.deepEqual(registro, {
    savedAt: 1234,
    slot: 2,
    endingId: 'nordeste_reza_na_soleira',
    tags: ['bom'],
    pistas: ['cabra_rastros', 'cabra_voz', 'cabra_reza'],
    completude: 1,
    moral: REGIAO.dex.morais.find((m) => m.id === 'moral_bom').texto,
  });
});

test('ficha de fuga ainda e construida — quem decide catalogar e podeCatalogar', () => {
  const fuga = acharFinal('nordeste_estrada_antes_da_noite');
  const registro = buildDexRecord({
    region: REGIAO,
    ending: fuga,
    state: {},
    clueOrder: [],
    slot: 1,
    savedAt: 1,
  });
  assert.equal(registro.completude, 0);
  assert.equal(podeCatalogar(registro.tags), false);
  assert.ok(REGIAO.dex.textoNaoRegistrado.length > 0, 'ha explicacao diegetica');
});

test('a secao factual da ficha nunca e parcial', () => {
  assert.ok(REGIAO.dex.lenda.length > 0);
  assert.equal(REGIAO.dex.creatureId, 'cabra_cabriola');
});
