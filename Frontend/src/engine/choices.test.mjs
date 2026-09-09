import test from 'node:test';
import assert from 'node:assert/strict';
import { availableChoices, choiceKey, whyHidden } from './choices.ts';
import { ID_DESPEDIDA, resolveLine } from './scenes.ts';

const nav = (to) => [{ type: 'navigate', to }];
const ctx = { sceneId: 'nordeste_praca' };
const ids = (resolvidas) => resolvidas.map((r) => r.choice.id);

test('sem condicao nenhuma, a escolha esta disponivel', () => {
  const r = availableChoices([{ id: 'a', texto: 'A', effects: nav('x') }], {}, [], ctx);
  assert.deepEqual(ids(r), ['a']);
  assert.equal(r[0].estado, 'disponivel');
  assert.equal(r[0].predicadoQueFalhou, undefined);
});

test('when reprovado esconde a escolha', () => {
  const escolhas = [
    { id: 'capela', texto: 'Capela', when: { all: [{ key: 'pista.reza', op: 'gte', value: 1 }] }, effects: nav('x') },
  ];
  assert.deepEqual(ids(availableChoices(escolhas, {}, [], ctx)), []);
  assert.deepEqual(ids(availableChoices(escolhas, { 'pista.reza': 1 }, [], ctx)), ['capela']);
});

test('hiddenWhen esconde mesmo com when aprovado — oculta vence disponivel', () => {
  const escolhas = [
    {
      id: 'curral',
      texto: 'Curral',
      when: { all: [{ key: 'sempre', op: 'gte', value: 0 }] },
      hiddenWhen: { all: [{ key: 'mundo.nordeste.ato', op: 'gte', value: 1 }] },
      effects: nav('x'),
    },
  ];
  assert.deepEqual(ids(availableChoices(escolhas, {}, [], ctx)), ['curral']);
  assert.deepEqual(ids(availableChoices(escolhas, { 'mundo.nordeste.ato': 1 }, [], ctx)), []);
});

test('oculta vence travada: hiddenWhen e lockedWhen ativos ao mesmo tempo somem', () => {
  const escolhas = [
    {
      id: 'x',
      texto: 'X',
      hiddenWhen: { all: [{ key: 'h', op: 'gte', value: 1 }] },
      lockedWhen: { all: [{ key: 'l', op: 'gte', value: 1 }] },
      effects: nav('x'),
    },
  ];
  assert.deepEqual(ids(availableChoices(escolhas, { h: 1, l: 1 }, [], ctx)), []);
  assert.equal(availableChoices(escolhas, { l: 1 }, [], ctx)[0].estado, 'travada');
});

test('travada aparece, carrega o predicado que explica, e nao altera estado', () => {
  const escolhas = [
    {
      id: 'reza',
      texto: 'Perguntar da reza',
      lockedWhen: { all: [{ key: 'humor.raimundo', op: 'lte', value: 0 }] },
      lockedText: 'Ele nao vai falar da mae com um estranho.',
      effects: [{ type: 'set', key: 'pista.reza', value: 1 }],
    },
  ];
  const travada = availableChoices(escolhas, { 'humor.raimundo': 0 }, [], ctx)[0];
  assert.equal(travada.estado, 'travada');
  assert.deepEqual(travada.predicadoQueFalhou, { key: 'humor.raimundo', op: 'lte', value: 0 });
  assert.equal(travada.choice.lockedText, 'Ele nao vai falar da mae com um estranho.');

  const livre = availableChoices(escolhas, { 'humor.raimundo': 1 }, [], ctx)[0];
  assert.equal(livre.estado, 'disponivel');
});

test('once some depois de usada', () => {
  const escolhas = [{ id: 'dose', texto: 'Pagar uma dose', once: true, effects: nav('x') }];
  assert.deepEqual(ids(availableChoices(escolhas, {}, [], ctx)), ['dose']);
  assert.deepEqual(ids(availableChoices(escolhas, {}, [choiceKey(ctx, 'dose')], ctx)), []);
});

test('a chave composta impede que duas cenas com "voltar" se atrapalhem', () => {
  // Sem a chave composta, usar `voltar` no curral apagaria o `voltar` da capela.
  const voltar = [{ id: 'voltar', texto: 'Voltar', once: true, effects: nav('praca') }];
  const curral = { sceneId: 'nordeste_curral' };
  const capela = { sceneId: 'nordeste_capela' };
  const usadas = [choiceKey(curral, 'voltar')];

  assert.deepEqual(ids(availableChoices(voltar, {}, usadas, curral)), [], 'usada no curral');
  assert.deepEqual(ids(availableChoices(voltar, {}, usadas, capela)), ['voltar'], 'intacta na capela');
});

test('a chave composta distingue linhas dentro do mesmo dialogo', () => {
  const dialogo = 'nordeste_dialogo_raimundo';
  assert.equal(choiceKey({ sceneId: dialogo }, 'x'), `${dialogo}#x`);
  assert.equal(choiceKey({ sceneId: dialogo, lineId: 'abertura' }, 'x'), `${dialogo}#abertura#x`);
  assert.notEqual(
    choiceKey({ sceneId: dialogo, lineId: 'abertura' }, 'x'),
    choiceKey({ sceneId: dialogo, lineId: 'a_voz' }, 'x')
  );
});

test('a chave vem resolvida da engine — quem chama nunca a remonta', () => {
  // Regressao real: o driver de playthrough remontava a chave a partir do
  // caminho de navegacao. Um dialogo alcancado por `sceneId` e o mesmo dialogo
  // alcancado por `sceneId#linha` produziam chaves diferentes para a MESMA
  // escolha, e uma `once` reaparecia depois de usada.
  const dialogo = 'nordeste_dialogo_raimundo';
  const escolhas = [{ id: 'dose', texto: 'Pagar uma dose', once: true, effects: nav('x') }];

  // Entrando sem `#`: a engine resolve para a linha inicial.
  const semLinha = resolveLine(DIALOGO, DIALOGO.linhas.abertura, {}, []);
  // Entrando com `#abertura`: mesma linha, mesma chave.
  const comLinha = availableChoices(escolhas, {}, [], { sceneId: dialogo, lineId: 'abertura' });

  assert.equal(semLinha.escolhas[0].key, comLinha[0].key);
  assert.equal(comLinha[0].key, `${dialogo}#abertura#dose`);

  // E usar a chave devolvida realmente remove a escolha.
  assert.deepEqual(ids(availableChoices(escolhas, {}, [comLinha[0].key], { sceneId: dialogo, lineId: 'abertura' })), []);
});

test('a despedida injetada tambem carrega chave, e ela e da linha certa', () => {
  const usadas = [choiceKey({ sceneId: DIALOGO.id, lineId: 'abertura' }, 'dose')];
  const r = resolveLine(DIALOGO, DIALOGO.linhas.abertura, {}, usadas);
  assert.equal(r.escolhas[0].key, `${DIALOGO.id}#abertura#${ID_DESPEDIDA}`);
});

test('whyHidden explica a ausencia para o inspetor de dev', () => {
  const once = { id: 'dose', texto: 'D', once: true, effects: nav('x') };
  assert.match(whyHidden(once, {}, [choiceKey(ctx, 'dose')], ctx), /once/);

  const comWhen = { id: 'c', texto: 'C', when: { all: [{ key: 'pista.reza', op: 'gte', value: 1 }] }, effects: nav('x') };
  assert.equal(whyHidden(comWhen, {}, [], ctx), 'when: pista.reza gte 1');

  const oculta = { id: 'o', texto: 'O', hiddenWhen: { all: [{ key: 'ato', op: 'gte', value: 1 }] }, effects: nav('x') };
  assert.equal(whyHidden(oculta, { ato: 1 }, [], ctx), 'hiddenWhen: ato gte 1');

  assert.equal(whyHidden({ id: 'v', texto: 'V', effects: nav('x') }, {}, [], ctx), undefined);
});

// ─── Despedida injetada ─────────────────────────────────────────────────────

const DIALOGO = {
  type: 'dialogo',
  id: 'nordeste_dialogo_raimundo',
  npcId: 'raimundo',
  linhaInicial: 'abertura',
  linhaDeDespedida: 'despedida',
  linhas: {
    abertura: {
      id: 'abertura',
      variantes: [{ texto: 'O bar ta fechado.' }],
      escolhas: [{ id: 'dose', texto: 'Pagar uma dose', once: true, effects: nav('x') }],
    },
    despedida: { id: 'despedida', variantes: [{ texto: 'Vai com Deus.' }], escolhas: [] },
  },
};

test('linha sem escolha disponivel recebe a despedida injetada', () => {
  const usadas = [choiceKey({ sceneId: DIALOGO.id, lineId: 'abertura' }, 'dose')];
  const r = resolveLine(DIALOGO, DIALOGO.linhas.abertura, {}, usadas);

  assert.equal(r.escolhas.length, 1);
  assert.equal(r.escolhas[0].choice.id, ID_DESPEDIDA);
  assert.equal(r.escolhas[0].estado, 'disponivel');
  assert.deepEqual(r.escolhas[0].choice.effects, [
    { type: 'navigate', to: 'nordeste_dialogo_raimundo#despedida' },
  ]);
});

test('a despedida nao e filtrada por takenChoices — precisa funcionar sempre', () => {
  // Mesmo com a chave dela ja registrada, ela reaparece: e rede de seguranca.
  const usadas = [
    choiceKey({ sceneId: DIALOGO.id, lineId: 'abertura' }, 'dose'),
    choiceKey({ sceneId: DIALOGO.id, lineId: 'abertura' }, ID_DESPEDIDA),
  ];
  const r = resolveLine(DIALOGO, DIALOGO.linhas.abertura, {}, usadas);
  assert.equal(r.escolhas[0].choice.id, ID_DESPEDIDA);
});

test('a despedida nao aparece enquanto houver escolha autorada', () => {
  const r = resolveLine(DIALOGO, DIALOGO.linhas.abertura, {}, []);
  assert.deepEqual(ids(r.escolhas), ['dose']);
});

test('o id reservado da despedida nao colide com escolha autorada', () => {
  assert.ok(ID_DESPEDIDA.startsWith('__'), 'prefixo reservado');
  const autoradas = Object.values(DIALOGO.linhas).flatMap((l) => l.escolhas.map((c) => c.id));
  assert.ok(!autoradas.includes(ID_DESPEDIDA));
  // E a chave composta dela tambem e distinta da de qualquer escolha autorada.
  const linha = { sceneId: DIALOGO.id, lineId: 'abertura' };
  assert.ok(!autoradas.map((id) => choiceKey(linha, id)).includes(choiceKey(linha, ID_DESPEDIDA)));
});

test('caso degenerado: despedida sem saida autorada vira laco — e o validador que pega', () => {
  // A rede de seguranca garante "nunca zero escolhas", nao "nunca um laco".
  // Se a propria linhaDeDespedida for escrita sem saida, a injecao aponta para
  // ela mesma. A engine nao tem como inventar uma saida que o autor nao escreveu;
  // quem barra isso e a checagem 4 do validador (etapa 5).
  const r = resolveLine(DIALOGO, DIALOGO.linhas.despedida, {}, []);
  assert.equal(r.escolhas[0].choice.id, ID_DESPEDIDA);
  assert.deepEqual(r.escolhas[0].choice.effects, [
    { type: 'navigate', to: 'nordeste_dialogo_raimundo#despedida' },
  ]);
  assert.equal(r.texto, 'Vai com Deus.');
});
