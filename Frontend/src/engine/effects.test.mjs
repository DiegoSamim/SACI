import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEffects, isTerminal, parseNavigateTarget } from './effects.ts';
import { indexQualities } from './qualities.ts';

const REGISTRY = indexQualities([
  { key: 'pista.cabra_voz', default: 0, min: 0, max: 1 },
  { key: 'pista.cabra_reza', default: 0, min: 0, max: 1 },
  {
    key: 'humor.raimundo',
    default: 0,
    min: -3,
    max: 3,
    faixas: { hostil: [-3, -2], fechado: [-1, -1], neutro: [0, 0], receptivo: [1, 2], cumplice: [3, 3] },
  },
  { key: 'mundo.nordeste.ato', default: 0, min: 0, max: 2 },
  { key: 'mundo.nordeste.medo_vila', default: 0, min: 0, max: 3 },
]);

const ctx = { qualities: REGISTRY, atoKey: 'mundo.nordeste.ato', sceneId: 'nordeste_praca' };
const aplicar = (effects, state = {}) => applyEffects(state, effects, ctx);

test('efeitos rodam na ordem do array', () => {
  const r = aplicar([
    { type: 'set', key: 'mundo.nordeste.medo_vila', value: 3 },
    { type: 'adjust', key: 'mundo.nordeste.medo_vila', by: -1 },
  ]);
  assert.equal(r.qualities['mundo.nordeste.medo_vila'], 2);
});

test('chave ausente vale zero no adjust', () => {
  const r = aplicar([{ type: 'adjust', key: 'mundo.nordeste.medo_vila', by: 2 }]);
  assert.equal(r.qualities['mundo.nordeste.medo_vila'], 2);
});

test('clamp vale para adjust E para set', () => {
  assert.equal(aplicar([{ type: 'adjust', key: 'humor.raimundo', by: 99 }]).qualities['humor.raimundo'], 3);
  assert.equal(aplicar([{ type: 'adjust', key: 'humor.raimundo', by: -99 }]).qualities['humor.raimundo'], -3);
  // Um `set` fora da faixa seria uma forma silenciosa de furar o limite declarado.
  assert.equal(aplicar([{ type: 'set', key: 'humor.raimundo', value: 99 }]).qualities['humor.raimundo'], 3);
  assert.equal(aplicar([{ type: 'set', key: 'humor.raimundo', value: -99 }]).qualities['humor.raimundo'], -3);
});

test('qualidade nao declarada nao e clampada, mas tambem nao quebra', () => {
  const r = aplicar([{ type: 'set', key: 'feito.nordeste.qualquer', value: 42 }]);
  assert.equal(r.qualities['feito.nordeste.qualquer'], 42);
});

test('applyEffects e puro: o estado de entrada nao e mutado', () => {
  const entrada = { 'humor.raimundo': 1 };
  const r = aplicar([{ type: 'adjust', key: 'humor.raimundo', by: 1 }], entrada);
  assert.equal(entrada['humor.raimundo'], 1, 'entrada intacta');
  assert.equal(r.qualities['humor.raimundo'], 2);
});

test('newClues registra pista saindo de zero, por set E por adjust', () => {
  assert.deepEqual(aplicar([{ type: 'set', key: 'pista.cabra_voz', value: 1 }]).newClues, ['cabra_voz']);
  assert.deepEqual(aplicar([{ type: 'adjust', key: 'pista.cabra_voz', by: 1 }]).newClues, ['cabra_voz']);
});

test('pista ja descoberta nao entra de novo em newClues', () => {
  const r = aplicar([{ type: 'set', key: 'pista.cabra_voz', value: 1 }], { 'pista.cabra_voz': 1 });
  assert.deepEqual(r.newClues, [], 'valor nao mudou, nada a registrar');
});

test('newClues preserva a ordem de descoberta e numera os eventos', () => {
  const r = aplicar([
    { type: 'set', key: 'pista.cabra_reza', value: 1 },
    { type: 'set', key: 'pista.cabra_voz', value: 1 },
  ]);
  assert.deepEqual(r.newClues, ['cabra_reza', 'cabra_voz']);
  assert.deepEqual(
    r.events.filter((e) => e.type === 'clueFound').map((e) => [e.clueKey, e.ordem]),
    [['pista.cabra_reza', 1], ['pista.cabra_voz', 2]]
  );
});

test('moodChanged so dispara quando a faixa muda de fato', () => {
  const moods = (effects, state) => aplicar(effects, state).events.filter((e) => e.type === 'moodChanged');

  assert.deepEqual(moods([{ type: 'adjust', key: 'humor.raimundo', by: 1 }], {}), [
    { type: 'moodChanged', npcId: 'raimundo', de: 'neutro', para: 'receptivo' },
  ]);
  // 1 -> 2 continua "receptivo": nao ha evento.
  assert.deepEqual(moods([{ type: 'adjust', key: 'humor.raimundo', by: 1 }], { 'humor.raimundo': 1 }), []);
});

test('actAdvanced dispara na chave declarada em atoKey, nao numa convencao', () => {
  const r = aplicar([{ type: 'set', key: 'mundo.nordeste.ato', value: 1 }]);
  assert.deepEqual(r.events.filter((e) => e.type === 'actAdvanced'), [{ type: 'actAdvanced', ato: 1 }]);
  // Outra chave de mundo nao dispara.
  const outra = aplicar([{ type: 'set', key: 'mundo.nordeste.medo_vila', value: 1 }]);
  assert.deepEqual(outra.events.filter((e) => e.type === 'actAdvanced'), []);
});

test('emit vira evento custom sem a engine saber quem escuta', () => {
  const r = aplicar([{ type: 'emit', event: 'vigilia_iniciada', tag: 'nordeste' }]);
  assert.deepEqual(r.events, [{ type: 'custom', event: 'vigilia_iniciada', tag: 'nordeste' }]);
});

test('navigate e end_region sao descritos, nao executados', () => {
  assert.deepEqual(aplicar([{ type: 'navigate', to: 'nordeste_curral' }]).navigation, {
    sceneId: 'nordeste_curral',
  });
  assert.deepEqual(aplicar([{ type: 'navigate', to: 'dialogo#abertura' }]).navigation, {
    sceneId: 'dialogo',
    lineId: 'abertura',
  });
  assert.deepEqual(aplicar([{ type: 'end_region', endingId: 'x' }]).endRegion, { endingId: 'x' });
  assert.deepEqual(aplicar([{ type: 'end_region' }]).endRegion, { endingId: undefined });
});

test('array bem formado nao gera warning', () => {
  const r = aplicar([
    { type: 'set', key: 'pista.cabra_voz', value: 1 },
    { type: 'navigate', to: 'nordeste_praca' },
  ]);
  assert.deepEqual(r.warnings, []);
  assert.equal(r.qualities['pista.cabra_voz'], 1);
});

test('efeito depois de um terminal e ignorado E denunciado', () => {
  // Comportamento de producao: nao quebrar. Mas o validador so chega na etapa 5,
  // e um bug de autoria nao pode atravessar mudo ate la.
  const r = aplicar([
    { type: 'navigate', to: 'nordeste_praca' },
    { type: 'set', key: 'pista.cabra_voz', value: 1 },
  ]);
  assert.equal(r.qualities['pista.cabra_voz'], undefined, 'efeito orfao nao aplicado');
  assert.equal(r.warnings.length, 1);
  assert.match(r.warnings[0], /depois de um terminal/);
  assert.match(r.warnings[0], /nordeste_praca/, 'o warning aponta onde');
});

test('end_region tambem encerra o array', () => {
  const r = aplicar([{ type: 'end_region' }, { type: 'emit', event: 'tarde_demais' }]);
  assert.deepEqual(r.events, []);
  assert.equal(r.warnings.length, 1);
});

test('parseNavigateTarget e isTerminal', () => {
  assert.deepEqual(parseNavigateTarget('a'), { sceneId: 'a' });
  assert.deepEqual(parseNavigateTarget('a#b'), { sceneId: 'a', lineId: 'b' });
  assert.equal(isTerminal({ type: 'navigate', to: 'x' }), true);
  assert.equal(isTerminal({ type: 'end_region' }), true);
  assert.equal(isTerminal({ type: 'set', key: 'pista.a', value: 1 }), false);
});
