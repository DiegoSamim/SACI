import test from 'node:test';
import assert from 'node:assert/strict';
import { countPredicates, evaluateCondition, failedPredicate } from './conditions.ts';

const estado = { 'pista.a': 1, 'humor.x': -2 };

test('os quatro operadores comparam contra o estado', () => {
  const casos = [
    ['gte', 1, true],
    ['gte', 2, false],
    ['lte', 1, true],
    ['lte', 0, false],
    ['eq', 1, true],
    ['eq', 2, false],
    ['neq', 2, true],
    ['neq', 1, false],
  ];
  for (const [op, value, esperado] of casos) {
    assert.equal(
      evaluateCondition({ all: [{ key: 'pista.a', op, value }] }, estado),
      esperado,
      `${op} ${value}`
    );
  }
});

test('chave ausente vale zero, nunca undefined', () => {
  assert.equal(evaluateCondition({ all: [{ key: 'nao.existe', op: 'eq', value: 0 }] }, {}), true);
  assert.equal(evaluateCondition({ all: [{ key: 'nao.existe', op: 'gte', value: 1 }] }, {}), false);
  assert.equal(evaluateCondition({ all: [{ key: 'nao.existe', op: 'lte', value: 0 }] }, {}), true);
});

test('condicao ausente ou vazia e sempre verdadeira', () => {
  assert.equal(evaluateCondition(undefined, {}), true);
  assert.equal(evaluateCondition({}, {}), true);
  assert.equal(evaluateCondition({ all: [] }, {}), true);
});

test('all exige todos os predicados', () => {
  const cond = {
    all: [
      { key: 'pista.a', op: 'gte', value: 1 },
      { key: 'humor.x', op: 'lte', value: -1 },
    ],
  };
  assert.equal(evaluateCondition(cond, estado), true);
  assert.equal(evaluateCondition(cond, { 'pista.a': 1, 'humor.x': 3 }), false);
});

test('anyOf e OR de grupos AND: um grupo inteiro precisa passar', () => {
  const cond = {
    anyOf: [
      [
        { key: 'pista.a', op: 'gte', value: 5 },
        { key: 'humor.x', op: 'gte', value: 0 },
      ],
      [{ key: 'humor.x', op: 'lte', value: -2 }],
    ],
  };
  assert.equal(evaluateCondition(cond, estado), true, 'segundo grupo passa inteiro');
  // Meio de um grupo passando nao basta.
  assert.equal(evaluateCondition(cond, { 'pista.a': 9, 'humor.x': -1 }), false);
});

test('all e anyOf juntos: os dois precisam passar', () => {
  const cond = {
    all: [{ key: 'pista.a', op: 'gte', value: 1 }],
    anyOf: [[{ key: 'humor.x', op: 'lte', value: -2 }]],
  };
  assert.equal(evaluateCondition(cond, estado), true);
  assert.equal(evaluateCondition(cond, { 'pista.a': 0, 'humor.x': -2 }), false, 'all reprova');
  assert.equal(evaluateCondition(cond, { 'pista.a': 1, 'humor.x': 0 }), false, 'anyOf reprova');
});

test('failedPredicate aponta o predicado que reprovou, para o inspetor de dev', () => {
  const cond = {
    all: [
      { key: 'pista.a', op: 'gte', value: 1 },
      { key: 'pista.b', op: 'gte', value: 1 },
    ],
  };
  assert.deepEqual(failedPredicate(cond, estado), { key: 'pista.b', op: 'gte', value: 1 });
  assert.equal(failedPredicate(cond, { 'pista.a': 1, 'pista.b': 1 }), undefined);
});

test('countPredicates soma all e anyOf — e a especificidade desempata variantes', () => {
  assert.equal(countPredicates(undefined), 0);
  assert.equal(countPredicates({}), 0);
  assert.equal(
    countPredicates({
      all: [{ key: 'a', op: 'eq', value: 0 }],
      anyOf: [[{ key: 'b', op: 'eq', value: 0 }], [{ key: 'c', op: 'eq', value: 0 }]],
    }),
    3
  );
});
