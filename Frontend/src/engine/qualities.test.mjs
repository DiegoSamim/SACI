import test from 'node:test';
import assert from 'node:assert/strict';
import { bandOf, clamp, indexQualities, moodBand, readQuality } from './qualities.ts';

const HUMOR = {
  key: 'humor.raimundo',
  default: 0,
  min: -3,
  max: 3,
  label: 'Seu Raimundo',
  faixas: {
    hostil: [-3, -2],
    fechado: [-1, -1],
    neutro: [0, 0],
    receptivo: [1, 2],
    cumplice: [3, 3],
  },
};

test('chave ausente vale zero', () => {
  assert.equal(readQuality({}, 'qualquer'), 0);
  assert.equal(readQuality({ x: 5 }, 'x'), 5);
  assert.equal(readQuality({ x: 0 }, 'x'), 0);
});

test('clamp segura as duas pontas e ignora limites ausentes', () => {
  assert.equal(clamp(99, HUMOR), 3);
  assert.equal(clamp(-99, HUMOR), -3);
  assert.equal(clamp(2, HUMOR), 2);
  assert.equal(clamp(99, { key: 'k', default: 0 }), 99, 'sem min/max nao ha clamp');
  assert.equal(clamp(99, undefined), 99, 'qualidade nao declarada nao e clampada');
  assert.equal(clamp(5, { key: 'k', default: 0, min: 2 }), 5, 'so min');
  assert.equal(clamp(5, { key: 'k', default: 0, max: 2 }), 2, 'so max');
});

test('bordas de faixa: cada intervalo e inclusivo nas duas pontas', () => {
  const esperado = [
    [-3, 'hostil'],
    [-2, 'hostil'],
    [-1, 'fechado'],
    [0, 'neutro'],
    [1, 'receptivo'],
    [2, 'receptivo'],
    [3, 'cumplice'],
  ];
  for (const [valor, faixa] of esperado) {
    assert.equal(bandOf(HUMOR, valor), faixa, `valor ${valor}`);
  }
});

test('valor fora de toda faixa devolve undefined em vez de inventar faixa', () => {
  // Buraco de autoria: cobre -3..3, mas o valor escapou. Melhor o inspetor
  // mostrar o buraco do que a UI exibir uma faixa vizinha errada.
  assert.equal(bandOf(HUMOR, 7), undefined);
  assert.equal(bandOf(HUMOR, -7), undefined);
  const semFaixas = { key: 'mundo.nordeste.ato', default: 0 };
  assert.equal(bandOf(semFaixas, 1), undefined, 'qualidade sem faixas');
  assert.equal(bandOf(undefined, 1), undefined, 'qualidade nao declarada');
});

test('faixa com buraco no meio nao escorrega para a vizinha', () => {
  const comBuraco = { key: 'k', default: 0, faixas: { baixo: [0, 1], alto: [3, 4] } };
  assert.equal(bandOf(comBuraco, 1), 'baixo');
  assert.equal(bandOf(comBuraco, 2), undefined);
  assert.equal(bandOf(comBuraco, 3), 'alto');
});

test('moodBand le o estado; chave ausente cai na faixa do zero', () => {
  assert.equal(moodBand(HUMOR, { 'humor.raimundo': -2 }), 'hostil');
  assert.equal(moodBand(HUMOR, {}), 'neutro', 'ausente vale 0, e 0 e neutro');
});

test('indexQualities monta o mapa por chave', () => {
  const indice = indexQualities([HUMOR, { key: 'pista.a', default: 0 }]);
  assert.equal(indice['humor.raimundo'].label, 'Seu Raimundo');
  assert.equal(indice['pista.a'].default, 0);
  assert.equal(indice['nao.existe'], undefined);
});
