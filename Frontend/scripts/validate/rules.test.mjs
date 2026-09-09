// Um fixture quebrado por regra. Um validador que so passa nao prova nada — o
// que interessa e a prova de que ele PEGA cada coisa que promete pegar.
//
// Toda quebra e feita em memoria, sobre uma copia de NORDESTE_V2. A fatia em
// disco nao e tocada.

import test from 'node:test';
import assert from 'node:assert/strict';
import { CODIGOS, validarRegiao, validarRegistry } from './rules.ts';
import { REGION_REGISTRY } from '@/data/regions';

const BASE = REGION_REGISTRY.nordeste;

/** Codigos exercitados por este arquivo — conferidos no fim contra CODIGOS. */
const exercitados = new Set();

function pega(codigo, regiao, ondeEsperado) {
  exercitados.add(codigo);
  const problemas = Array.isArray(regiao) ? regiao : validarRegiao(regiao);
  const achado = problemas.filter((p) => p.codigo === codigo);
  assert.ok(
    achado.length > 0,
    `${codigo} nao disparou. Problemas: ${problemas.map((p) => p.codigo).join(',') || '(nenhum)'}`
  );
  if (ondeEsperado) {
    assert.ok(
      achado.some((p) => p.onde.includes(ondeEsperado)),
      `${codigo} disparou, mas nenhum "onde" contem "${ondeEsperado}": ${achado.map((p) => p.onde).join(', ')}`
    );
  }
  return achado[0];
}

// ─── Auxiliares de mutacao ──────────────────────────────────────────────────

const comCena = (sceneId, fn) => ({
  ...BASE,
  scenes: { ...BASE.scenes, [sceneId]: fn(BASE.scenes[sceneId]) },
});

const comEscolha = (sceneId, choiceId, fn) =>
  comCena(sceneId, (s) => ({
    ...s,
    escolhas: s.escolhas.map((c) => (c.id === choiceId ? fn(c) : c)),
  }));

const comLinha = (sceneId, lineId, fn) =>
  comCena(sceneId, (s) => ({ ...s, linhas: { ...s.linhas, [lineId]: fn(s.linhas[lineId]) } }));

const DIALOGO = 'nordeste_dialogo_raimundo';

// ─── Linha de base ──────────────────────────────────────────────────────────

test('a fatia real passa sem erro E sem aviso', () => {
  const problemas = validarRegistry(REGION_REGISTRY);
  assert.deepEqual(
    problemas.map((p) => `${p.codigo} ${p.onde}: ${p.mensagem}`),
    [],
    'a fatia deve passar limpa inclusive em --strict'
  );
});

// ─── Erros ──────────────────────────────────────────────────────────────────

test('C1 pega navigate para cena inexistente', () => {
  const r = comEscolha('nordeste_praca', 'praca_ir_curral', (c) => ({
    ...c,
    effects: [{ type: 'navigate', to: 'nordeste_lugar_nenhum' }],
  }));
  pega('C1', r, 'praca_ir_curral');
});

test('C1 pega navigate para linha inexistente dentro de um dialogo', () => {
  const r = comEscolha('nordeste_praca', 'praca_ir_bar', (c) => ({
    ...c,
    effects: [{ type: 'navigate', to: `${DIALOGO}#linha_que_nao_existe` }],
  }));
  assert.match(pega('C1', r, 'praca_ir_bar').mensagem, /linha inexistente/);
});

test('C2 pega cena inalcancavel a partir da entrada', () => {
  const r = comEscolha('nordeste_praca', 'praca_ir_curral', (c) => ({
    ...c,
    effects: [{ type: 'navigate', to: 'nordeste_praca' }],
  }));
  pega('C2', r, 'nordeste_curral');
});

test('C3 pega cena local sem saida incondicional', () => {
  const r = comEscolha('nordeste_curral', 'curral_voltar', (c) => ({
    ...c,
    when: { all: [{ key: 'pista.cabra_voz', op: 'gte', value: 1 }] },
  }));
  pega('C3', r, 'nordeste_curral');
});

test('C3 trata `once` como desqualificante — saida que some nao e saida', () => {
  const r = comEscolha('nordeste_curral', 'curral_voltar', (c) => ({ ...c, once: true }));
  pega('C3', r, 'nordeste_curral');
});

test('C4 pega linhaDeDespedida inexistente', () => {
  const r = comCena(DIALOGO, (s) => ({ ...s, linhaDeDespedida: 'nao_existe' }));
  pega('C4', r, DIALOGO);
});

test('C4 pega despedida sem saida autorada — o laco da rede de seguranca', () => {
  const r = comLinha(DIALOGO, 'despedida', (l) => ({ ...l, escolhas: [] }));
  assert.match(pega('C4', r, 'despedida').mensagem, /laço/);
});

test('C4 pega linhaDeDespedida inalcancavel', () => {
  const r = comLinha(DIALOGO, 'abertura', (l) => ({
    ...l,
    escolhas: l.escolhas.filter((c) => c.id !== 'raimundo_sair'),
  }));
  pega('C4', r, DIALOGO);
});

test('C5 pega condicao lendo chave que nenhum efeito escreve', () => {
  const r = {
    ...comEscolha('nordeste_praca', 'praca_ir_capela', (c) => ({
      ...c,
      when: { all: [{ key: 'mundo.nordeste.lua_cheia', op: 'gte', value: 1 }] },
    })),
    qualities: [...BASE.qualities, { key: 'mundo.nordeste.lua_cheia', default: 0 }],
  };
  pega('C5', r, 'praca_ir_capela');
});

test('C6 pega chave usada mas nao declarada no registro', () => {
  const r = { ...BASE, qualities: BASE.qualities.filter((q) => q.key !== 'laco.raimundo') };
  assert.match(pega('C6', r).mensagem, /laco\.raimundo/);
});

test('C6 pega atoKey nao declarada', () => {
  const r = { ...BASE, meta: { ...BASE.meta, atoKey: 'mundo.nordeste.inexistente' } };
  assert.match(pega('C6', r).mensagem, /atoKey/);
});

test('C7 pega efeito depois de um terminal', () => {
  const r = comEscolha('nordeste_praca', 'praca_ir_curral', (c) => ({
    ...c,
    effects: [
      { type: 'navigate', to: 'nordeste_curral' },
      { type: 'set', key: 'pista.cabra_voz', value: 1 },
    ],
  }));
  pega('C7', r, 'praca_ir_curral');
});

test('C8 pega sceneId sem o prefixo da regiao', () => {
  const r = { ...BASE, scenes: { ...BASE.scenes, praca_sem_prefixo: { ...BASE.scenes['nordeste_praca'], id: 'praca_sem_prefixo' } } };
  pega('C8', r, 'praca_sem_prefixo');
});

test('C8 pega dialogueId fora do padrao {regionId}_dialogo_{npcId}', () => {
  const r = comCena(DIALOGO, (s) => ({ ...s, npcId: 'conceicao' }));
  assert.match(pega('C8', r, DIALOGO).mensagem, /dialogueId/);
});

test('C8 pega id fora da forma snake_case', () => {
  const r = { ...BASE, npcs: { ...BASE.npcs, 'Raimundo-Velho': { id: 'Raimundo-Velho', nome: 'x', papel: 'y' } } };
  pega('C8', r, 'Raimundo-Velho');
});

test('C9 pega pista declarada que nenhum efeito concede', () => {
  const r = {
    ...BASE,
    clues: { ...BASE.clues, cabra_orfa: { id: 'cabra_orfa', titulo: 'x', descricao: 'y', icone: 'z' } },
  };
  pega('C9', r, 'cabra_orfa');
});

test('C10 pega regiao sem final bom', () => {
  const r = { ...BASE, endings: BASE.endings.map((e) => ({ ...e, tags: ['neutro'] })) };
  assert.match(pega('C10', r).mensagem, /"bom"/);
});

test('C10 pega mais de um fallback', () => {
  const r = { ...BASE, endings: BASE.endings.map((e) => ({ ...e, when: undefined })) };
  assert.match(pega('C10', r).mensagem, /exatamente 1/);
});

test('C10 pega nenhum fallback', () => {
  const r = {
    ...BASE,
    endings: BASE.endings.map((e) =>
      e.when ? e : { ...e, when: { all: [{ key: 'pista.cabra_voz', op: 'gte', value: 1 }] } }
    ),
  };
  assert.match(pega('C10', r).mensagem, /exatamente 1/);
});

test('C11 pega slot de epilogo sem fragmento fallback', () => {
  const r = { ...BASE, epilogue: BASE.epilogue.filter((f) => f.when) };
  assert.match(pega('C11', r).mensagem, /sem "when"/);
});

test('C11 pega slot nao declarado em meta.epilogueSlots', () => {
  const r = { ...BASE, meta: { ...BASE.meta, epilogueSlots: [] } };
  assert.match(pega('C11', r).mensagem, /epilogueSlots/);
});

test('C12 pega ficha sem lenda — a secao factual nunca e parcial', () => {
  const r = { ...BASE, dex: { ...BASE.dex, lenda: '   ' } };
  pega('C12', r, 'cabra_cabriola');
});

test('C12 pega ficha sem moral fallback', () => {
  const r = { ...BASE, dex: { ...BASE.dex, morais: BASE.dex.morais.filter((m) => m.tags) } };
  assert.match(pega('C12', r).mensagem, /fallback/);
});

test('C13 pega mundo.* sem prefixo de regiao', () => {
  const r = { ...BASE, qualities: [...BASE.qualities, { key: 'mundo.ato_solto', default: 0 }] };
  assert.match(pega('C13', r).mensagem, /prefixo de região/);
});

test('C15 pega conteudo escrevendo em chave derivada', () => {
  const r = comEscolha('nordeste_praca', 'praca_ir_curral', (c) => ({
    ...c,
    effects: [{ type: 'set', key: 'meta.tag_bom', value: 1 }, ...c.effects],
  }));
  pega('C15', r, 'praca_ir_curral');
});

test('C16 pega bloco de variantes sem nenhuma incondicional', () => {
  const r = comCena('nordeste_curral', (s) => ({
    ...s,
    textos: s.textos.map((t) => ({ ...t, when: { all: [{ key: 'pista.cabra_voz', op: 'gte', value: 1 }] } })),
  }));
  pega('C16', r, 'nordeste_curral');
});

test('C21 pega final que nenhum caminho alcanca', () => {
  const r = {
    ...BASE,
    endings: BASE.endings.map((e) =>
      e.id === 'nordeste_reza_na_soleira'
        ? { ...e, when: { all: [{ key: 'mundo.nordeste.ato', op: 'gte', value: 9 }] } }
        : e
    ),
  };
  assert.match(pega('C21', r, 'nordeste_reza_na_soleira').mensagem, /mundo\.nordeste\.ato gte 9/);
});

test('C21 respeita anyOf: basta UM grupo viavel', () => {
  const comGrupoViavel = {
    ...BASE,
    endings: BASE.endings.map((e) =>
      e.id === 'nordeste_reza_na_soleira'
        ? {
            ...e,
            when: {
              anyOf: [
                [{ key: 'mundo.nordeste.ato', op: 'gte', value: 9 }],
                [{ key: 'pista.cabra_voz', op: 'gte', value: 1 }],
              ],
            },
          }
        : e
    ),
  };
  assert.equal(
    validarRegiao(comGrupoViavel).filter((p) => p.codigo === 'C21').length,
    0,
    'um grupo inviavel nao condena o final se outro e viavel'
  );

  const semGrupoViavel = {
    ...BASE,
    endings: BASE.endings.map((e) =>
      e.id === 'nordeste_reza_na_soleira'
        ? {
            ...e,
            when: {
              anyOf: [
                [{ key: 'mundo.nordeste.ato', op: 'gte', value: 9 }],
                [{ key: 'pista.cabra_voz', op: 'gte', value: 7 }],
              ],
            },
          }
        : e
    ),
  };
  pega('C21', semGrupoViavel, 'nordeste_reza_na_soleira');
});

test('C22 pega ramo de onde nao se chega a final nenhum', () => {
  // A capela deixa de encerrar e so volta para a praca... e a praca perde a
  // saida, entao o grafo inteiro circula sem nunca terminar.
  const semFim = {
    ...BASE,
    scenes: {
      ...BASE.scenes,
      nordeste_praca: {
        ...BASE.scenes['nordeste_praca'],
        escolhas: BASE.scenes['nordeste_praca'].escolhas.filter((c) => c.id !== 'praca_ir_embora'),
      },
      nordeste_noite: {
        ...BASE.scenes['nordeste_noite'],
        escolhas: BASE.scenes['nordeste_noite'].escolhas.filter(
          (c) => !c.effects.some((e) => e.type === 'end_region')
        ),
      },
      nordeste_capela: {
        ...BASE.scenes['nordeste_capela'],
        escolhas: BASE.scenes['nordeste_capela'].escolhas.filter(
          (c) => !c.effects.some((e) => e.type === 'end_region')
        ),
      },
    },
  };
  pega('C22', semFim, 'nordeste_praca');
});

test('C23 pega buraco entre faixas', () => {
  const r = {
    ...BASE,
    qualities: BASE.qualities.map((q) =>
      q.key === 'humor.raimundo'
        ? { ...q, faixas: { ...q.faixas, fechado: undefined, hostil: [-3, -2], neutro: [0, 0] } }
        : q
    ),
  };
  // Remove a faixa `fechado`, abrindo um buraco em -1.
  r.qualities = r.qualities.map((q) => {
    if (q.key !== 'humor.raimundo') return q;
    const faixas = { ...q.faixas };
    delete faixas.fechado;
    return { ...q, faixas };
  });
  assert.match(pega('C23', r, 'humor.raimundo').mensagem, /buraco em -1/);
});

test('C23 pega sobreposicao de faixas', () => {
  const r = {
    ...BASE,
    qualities: BASE.qualities.map((q) =>
      q.key === 'humor.raimundo' ? { ...q, faixas: { ...q.faixas, fechado: [-2, -1] } } : q
    ),
  };
  assert.match(pega('C23', r, 'humor.raimundo').mensagem, /sobrep/);
});

test('C23 pega faixa que nao chega ate o max', () => {
  const r = {
    ...BASE,
    qualities: BASE.qualities.map((q) => {
      if (q.key !== 'humor.raimundo') return q;
      const faixas = { ...q.faixas };
      delete faixas.cumplice;
      return { ...q, faixas };
    }),
  };
  assert.match(pega('C23', r, 'humor.raimundo').mensagem, /descoberto em 3\.\.3/);
});

test('C24 pega chave prefixada com a regiao ERRADA', () => {
  // O jeito como isso vai acontecer de verdade: copiar e colar entre regioes.
  const r = { ...BASE, qualities: [...BASE.qualities, { key: 'mundo.norte.ato', default: 0 }] };
  assert.match(pega('C24', r).mensagem, /região "norte".*"nordeste"/);
});

test('C14 pega npcId repetido entre regioes', () => {
  const clone = { ...BASE, meta: { ...BASE.meta, regionId: 'norte' } };
  pega('C14', validarRegistry({ nordeste: BASE, norte: clone }), 'raimundo');
});

// ─── Avisos ─────────────────────────────────────────────────────────────────

test('A17 avisa qualidade declarada e nunca lida', () => {
  const r = { ...BASE, qualities: [...BASE.qualities, { key: 'laco.conceicao', default: 0 }] };
  const p = pega('A17', r, 'laco.conceicao');
  assert.equal(p.severidade, 'aviso', 'higiene nao derruba a autoria pela metade');
});

test('A18 avisa qualidade declarada e nunca escrita', () => {
  const r = { ...BASE, qualities: [...BASE.qualities, { key: 'laco.conceicao', default: 0 }] };
  assert.equal(pega('A18', r, 'laco.conceicao').severidade, 'aviso');
});

test('A19 avisa linha de dialogo inalcancavel', () => {
  const r = comCena(DIALOGO, (s) => ({
    ...s,
    linhas: { ...s.linhas, orfa: { id: 'orfa', variantes: [{ texto: 'x' }], escolhas: [] } },
  }));
  assert.equal(pega('A19', r, 'orfa').severidade, 'aviso');
});

test('A20 avisa lockedWhen sem lockedText', () => {
  const r = comLinha(DIALOGO, 'abertura', (l) => ({
    ...l,
    escolhas: l.escolhas.map((c) =>
      c.id === 'raimundo_perguntar_reza' ? { ...c, lockedText: undefined } : c
    ),
  }));
  assert.equal(pega('A20', r, 'raimundo_perguntar_reza').severidade, 'aviso');
});

// ─── A regra que guarda as regras ───────────────────────────────────────────

test('toda regra declarada em CODIGOS tem fixture que a faz disparar', () => {
  const semFixture = CODIGOS.filter((c) => !exercitados.has(c));
  assert.deepEqual(
    semFixture,
    [],
    `regra sem prova de que dispara: ${semFixture.join(', ')}. Uma regra nova precisa de um fixture quebrado.`
  );
});
