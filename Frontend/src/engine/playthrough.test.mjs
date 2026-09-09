// Percorre a fatia vertical de ponta a ponta a partir de uma sequencia fixa de
// ids de escolha, afirmando em que final ela desemboca. E o teste mais valioso
// do projeto: trava regressao no comportamento composto, nao numa funcao isolada.
//
// O driver abaixo e, de proposito, o rascunho do que o store fara na etapa 3 —
// escreve-lo aqui valida o formato da API antes de existir store.

import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEffects } from './effects.ts';
import { buildRegionCompletion } from './completion.ts';
import { enterScene, resolveLine, resolveScene } from './scenes.ts';
import { indexQualities } from './qualities.ts';
import { resolveEnding, resolveEpilogue } from './endings.ts';
import { NORDESTE_V2 as REGIAO } from '@/data/regions/nordeste';

const INDICE = indexQualities(REGIAO.qualities);

function jogar(sequencia) {
  let qualities = {};
  const takenChoices = [];
  const clueOrder = [];
  const eventos = [];
  const warnings = [];

  let sceneId = REGIAO.meta.entrySceneId;
  let lineId;
  let endRegion;

  const aplicar = (effects, ctxSceneId) => {
    const r = applyEffects(qualities, effects, {
      qualities: INDICE,
      atoKey: REGIAO.meta.atoKey,
      sceneId: ctxSceneId,
    });
    qualities = r.qualities;
    eventos.push(...r.events);
    warnings.push(...r.warnings);
    clueOrder.push(...r.newClues);
    return r;
  };

  const entrar = (id) => {
    const r = enterScene(qualities, id);
    qualities = r.qualities;
    eventos.push(...r.events);
  };

  entrar(sceneId);

  for (const escolhaId of sequencia) {
    const scene = REGIAO.scenes[sceneId];
    assert.ok(scene, `cena inexistente: ${sceneId}`);

    const resolvida =
      scene.type === 'dialogo'
        ? resolveLine(scene, scene.linhas[lineId ?? scene.linhaInicial], qualities, takenChoices)
        : resolveScene(scene, qualities, takenChoices);

    // Efeitos da variante exibida (a pista obtida por exploracao chega por aqui).
    if (resolvida.pendingEffects.length > 0) aplicar(resolvida.pendingEffects, sceneId);

    const alvo = resolvida.escolhas.find((r) => r.choice.id === escolhaId);
    assert.ok(alvo, `escolha "${escolhaId}" indisponivel em ${sceneId}${lineId ? '#' + lineId : ''}`);
    assert.equal(alvo.estado, 'disponivel', `escolha "${escolhaId}" esta travada`);

    // A chave vem resolvida da engine: remonta-la aqui foi o que quebrou o
    // `once` na primeira versao deste driver.
    takenChoices.push(alvo.key);
    eventos.push({ type: 'choiceTaken', choiceId: escolhaId, sceneId });

    const r = aplicar(alvo.choice.effects, sceneId);

    if (r.endRegion) {
      endRegion = r.endRegion;
      break;
    }
    if (r.navigation) {
      const mudouDeCena = r.navigation.sceneId !== sceneId;
      sceneId = r.navigation.sceneId;
      lineId = r.navigation.lineId;
      if (mudouDeCena) entrar(sceneId);
    }
  }

  assert.ok(endRegion, 'a sequencia terminou sem encerrar a regiao');
  const resolucao = resolveEnding(REGIAO, qualities, endRegion.endingId);
  assert.ok(resolucao, 'nenhum final resolveu — nem o fallback');
  const { ending, podeCatalogar } = resolucao;

  const conclusao = buildRegionCompletion(ending, qualities);
  qualities = conclusao.qualities;
  eventos.push(...conclusao.events);

  return {
    ending,
    podeCatalogar,
    qualities,
    clueOrder,
    warnings,
    eventos,
    epilogo: resolveEpilogue(REGIAO, ending, qualities).map((f) => f.id),
  };
}

// ─── Final bom ──────────────────────────────────────────────────────────────

test('playthrough: caminho bom termina em nordeste_reza_na_soleira', () => {
  const r = jogar([
    'praca_ir_curral', //            praca -> curral (pista por exploracao)
    'curral_voltar', //              curral -> praca
    'praca_ir_bar', //               praca -> dialogo
    'raimundo_pagar_dose', //        humor 0 -> 1, destrava a reza
    'raimundo_perguntar_reza', //    pista.cabra_reza
    'a_reza_voltar',
    'raimundo_perguntar_voz', //     pista.cabra_voz, ato -> 1
    'a_voz_voltar',
    'raimundo_sair',
    'despedida_sair', //             dialogo -> praca
    'praca_ir_capela', //            so aparece com a reza
    'capela_rezar_na_porta', //      ato -> 2, end_region
  ]);

  assert.deepEqual(r.warnings, [], 'nenhum efeito orfao no conteudo');
  assert.equal(r.ending.id, 'nordeste_reza_na_soleira');
  assert.deepEqual(r.ending.tags, ['bom']);
  assert.equal(r.podeCatalogar, true);
  assert.deepEqual(r.clueOrder, ['cabra_rastros', 'cabra_reza', 'cabra_voz']);
  assert.equal(r.qualities['meta.tag_bom'], 1);
  assert.deepEqual(r.epilogo, ['vila_apavorada'], 'medo_vila chegou a 2');
});

// ─── Final de fuga ──────────────────────────────────────────────────────────

test('playthrough: ir embora de cara termina em fuga, sem catalogar', () => {
  const r = jogar(['praca_ir_embora']);

  assert.deepEqual(r.warnings, []);
  assert.equal(r.ending.id, 'nordeste_estrada_antes_da_noite');
  assert.deepEqual(r.ending.tags, ['fuga']);
  assert.equal(r.podeCatalogar, false, 'fuga nao cataloga');
  assert.deepEqual(r.clueOrder, [], 'saiu sem descobrir nada');
  assert.equal(r.qualities['meta.tag_fuga'], 1);
  assert.deepEqual(r.epilogo, ['vila_sem_mudanca']);
});

// ─── Fallback ───────────────────────────────────────────────────────────────

test('playthrough: entender pela metade cai no fallback', () => {
  // Descobre a voz mas nunca a reza: a capela nunca abre, e o ato para em 1.
  const r = jogar([
    'praca_ir_bar',
    'raimundo_perguntar_voz',
    'a_voz_voltar',
    'raimundo_sair',
    'despedida_sair',
    'praca_ir_embora',
  ]);

  assert.deepEqual(r.warnings, []);
  // `feito.nordeste.fugiu` foi setado, mas o final de fuga tem prioridade 5 e
  // casa — entao o fallback so venceria se a fuga nao casasse. Confirma-se que
  // sair pela praca e sempre uma fuga, tenha o jogador descoberto algo ou nao.
  assert.equal(r.ending.id, 'nordeste_estrada_antes_da_noite');
  assert.deepEqual(r.clueOrder, ['cabra_voz']);
});

test('playthrough: passar a noite sem a reza cai no fallback — jogando, nao em teoria', () => {
  // O fallback era inalcancavel ate a etapa 4: toda saida setava `fugiu`, e o
  // final de fuga (p5) sempre batia o fallback (p0). A cena da noite abre um
  // jeito de encerrar sem fugir e sem vencer.
  const r = jogar([
    'praca_ir_bar',
    'raimundo_perguntar_voz', // ato -> 1, abre a noite
    'a_voz_voltar',
    'raimundo_sair',
    'despedida_sair',
    'praca_ir_noite',
    'noite_esperar', // end_region sem id: resolve por condicao
  ]);

  assert.deepEqual(r.warnings, []);
  assert.equal(r.ending.id, 'nordeste_silencio_que_ficou');
  assert.deepEqual(r.ending.tags, ['neutro', 'ruim']);
  assert.equal(r.qualities['feito.nordeste.fugiu'], undefined, 'ninguem fugiu');
  assert.equal(r.podeCatalogar, true, 'ruim cataloga, com relato parcial');
});

test('playthrough: end_region com id explicito forca o final, sem passar por condicao', () => {
  const r = jogar([
    'praca_ir_bar',
    'raimundo_perguntar_voz',
    'a_voz_voltar',
    'raimundo_sair',
    'despedida_sair',
    'praca_ir_noite',
    'noite_chamar_nome',
  ]);

  assert.deepEqual(r.warnings, []);
  assert.equal(r.ending.id, 'nordeste_nome_na_escuridao');
  assert.deepEqual(r.ending.tags, ['neutro']);
});

test('playthrough: anyOf abre a noite pelo laco, sem a pista da voz', () => {
  // O segundo grupo do `anyOf` e uma rota inteira: confiar em Raimundo o
  // bastante substitui saber o que escutar. Se o `anyOf` fosse decorativo, este
  // caminho nao existiria.
  const r = jogar([
    'praca_ir_bar',
    'raimundo_pagar_dose', // humor 1, laco 1
    'raimundo_perguntar_reza', // laco 2 — e o ato continua em 0
    'a_reza_voltar',
    'raimundo_sair',
    'despedida_sair',
    'praca_ir_noite', // abriu pelo laco, nao pelo ato
    'noite_chamar_nome', // idem
  ]);

  assert.equal(r.qualities['mundo.nordeste.ato'], undefined, 'nunca soube da voz');
  assert.equal(r.qualities['laco.raimundo'], 2);
  assert.equal(r.ending.id, 'nordeste_nome_na_escuridao');
});

test('a noite nao existe antes de haver motivo para ela', () => {
  assert.throws(() => jogar(['praca_ir_noite']), /indisponivel/);
});

test('o fallback tambem resolve por condicao com estado vazio', () => {
  assert.equal(resolveEnding(REGIAO, {}).ending.id, 'nordeste_silencio_que_ficou');
  assert.deepEqual(resolveEnding(REGIAO, {}).ending.tags, ['neutro', 'ruim']);
});

// ─── Invariantes do grafo ───────────────────────────────────────────────────

test('a escolha travada bloqueia mesmo o caminho bom se o humor nao subir', () => {
  assert.throws(
    () => jogar(['praca_ir_bar', 'raimundo_perguntar_reza']),
    /travada/,
    'sem pagar a dose, a reza continua fechada'
  );
});

test('once: pagar a dose duas vezes e impossivel', () => {
  assert.throws(
    () => jogar(['praca_ir_bar', 'raimundo_pagar_dose', 'raimundo_pagar_dose']),
    /indisponivel/
  );
});

test('o curral some depois que o ato avanca', () => {
  assert.throws(
    () =>
      jogar([
        'praca_ir_bar',
        'raimundo_perguntar_voz', // ato -> 1
        'a_voz_voltar',
        'raimundo_sair',
        'despedida_sair',
        'praca_ir_curral',
      ]),
    /indisponivel/
  );
});

test('a variante por visita muda o texto na revisita, sem duplicar cena', () => {
  const curral = REGIAO.scenes['nordeste_curral'];
  const primeira = enterScene({}, 'nordeste_curral');
  const segunda = enterScene(primeira.qualities, 'nordeste_curral');

  assert.equal(primeira.events[0].primeiraVez, true);
  assert.equal(segunda.events[0].primeiraVez, false);
  assert.notEqual(
    resolveScene(curral, primeira.qualities, []).texto,
    resolveScene(curral, segunda.qualities, []).texto
  );
  assert.equal(resolveScene(curral, segunda.qualities, []).visitas, 2);
});

test('a pista por exploracao so e concedida na primeira visita', () => {
  const curral = REGIAO.scenes['nordeste_curral'];
  const primeira = enterScene({}, 'nordeste_curral');
  const segunda = enterScene(primeira.qualities, 'nordeste_curral');

  assert.ok(resolveScene(curral, primeira.qualities, []).pendingEffects.length > 0);
  assert.deepEqual(
    resolveScene(curral, segunda.qualities, []).pendingEffects,
    [],
    'a revisita nao reconcede a pista'
  );
});

test('toda cena local tem ao menos uma escolha incondicional — nenhum beco', () => {
  for (const scene of Object.values(REGIAO.scenes)) {
    if (scene.type !== 'local') continue;
    const incondicionais = scene.escolhas.filter(
      (c) => !c.when && !c.hiddenWhen && !c.lockedWhen && !c.once
    );
    assert.ok(incondicionais.length >= 1, `${scene.id} nao tem saida garantida`);
  }
});
