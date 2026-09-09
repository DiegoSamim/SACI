import test from 'node:test';
import assert from 'node:assert/strict';
import { pickVariant } from './variants.ts';

const p = (key, value) => ({ all: [{ key, op: 'gte', value }] });

test('prioridade maior ganha, mesmo sendo menos especifica', () => {
  const variantes = [
    { when: { all: [{ key: 'a', op: 'gte', value: 1 }, { key: 'b', op: 'gte', value: 1 }] }, priority: 1, texto: 'especifica' },
    { when: p('a', 1), priority: 5, texto: 'prioritaria' },
  ];
  assert.equal(pickVariant(variantes, { a: 1, b: 1 }).texto, 'prioritaria');
});

test('empatada a prioridade, a mais especifica ganha', () => {
  const variantes = [
    { when: p('a', 1), texto: 'generica' },
    { when: { all: [{ key: 'a', op: 'gte', value: 1 }, { key: 'b', op: 'gte', value: 1 }] }, texto: 'especifica' },
  ];
  assert.equal(pickVariant(variantes, { a: 1, b: 1 }).texto, 'especifica');
});

test('empatados prioridade e especificidade, vence a ordem de declaracao', () => {
  const variantes = [
    { when: p('a', 1), texto: 'primeira' },
    { when: p('b', 1), texto: 'segunda' },
  ];
  assert.equal(pickVariant(variantes, { a: 1, b: 1 }).texto, 'primeira');
});

test('variante sem when serve de fallback e so perde para uma que casa', () => {
  const variantes = [
    { when: p('pista.x', 1), priority: 1, texto: 'com pista' },
    { texto: 'base' },
  ];
  assert.equal(pickVariant(variantes, {}).texto, 'base');
  assert.equal(pickVariant(variantes, { 'pista.x': 1 }).texto, 'com pista');
});

test('prioridade explicita zero nao perde para prioridade ausente', () => {
  // `priority` ausente vale 0: as duas empatam e a ordem decide.
  const variantes = [{ priority: 0, texto: 'explicita' }, { texto: 'ausente' }];
  assert.equal(pickVariant(variantes, {}).texto, 'explicita');
});

test('prioridade negativa e considerada quando e a unica que casa', () => {
  assert.equal(pickVariant([{ priority: -5, texto: 'unica' }], {}).texto, 'unica');
});

test('nenhuma variante casando devolve undefined', () => {
  assert.equal(pickVariant([{ when: p('x', 1), texto: 'nao' }], {}), undefined);
  assert.equal(pickVariant([], {}), undefined);
});

test('o desempate e deterministico: mesma entrada, mesma saida', () => {
  const variantes = [
    { when: p('a', 1), priority: 2, texto: 'A' },
    { when: p('b', 1), priority: 2, texto: 'B' },
    { when: p('c', 1), priority: 2, texto: 'C' },
  ];
  const estado = { a: 1, b: 1, c: 1 };
  for (let i = 0; i < 20; i++) assert.equal(pickVariant(variantes, estado).texto, 'A');
});
