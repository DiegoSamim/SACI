// A CLI inteira, por subprocesso: parsing de flag, formatacao e — o que mais
// importa — o codigo de saida. Automatizado em vez de quebrar a fatia no disco
// e depender de alguem lembrar de desfazer.

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const RAIZ = new URL('../../', import.meta.url).pathname;

function validar(args = []) {
  const r = spawnSync(
    process.execPath,
    ['--import', './scripts/node-loader.mjs', 'scripts/validate-content.ts', ...args],
    { cwd: RAIZ, encoding: 'utf8' }
  );
  return { status: r.status, saida: (r.stdout ?? '') + (r.stderr ?? '') };
}

/** Escreve um registry derivado da fatia num diretorio temporario. */
function fixture(corpo) {
  const dir = mkdtempSync(join(tmpdir(), 'saci-validate-'));
  const arquivo = join(dir, 'registry.ts');
  writeFileSync(
    arquivo,
    `import type { RegionRegistry } from '@/types/region';\n` +
      `import { NORDESTE_V2 } from '@/data/regions/nordeste';\n\n${corpo}\n`
  );
  return pathToFileURL(arquivo).href;
}

test('a fatia real passa: exit 0 e mensagem de conteudo valido', () => {
  const { status, saida } = validar();
  assert.equal(status, 0);
  assert.match(saida, /Conteúdo válido/);
});

test('a fatia real passa tambem em --strict — nao ha aviso pendente', () => {
  const { status, saida } = validar(['--strict']);
  assert.equal(status, 0, saida);
});

test('conteudo quebrado: exit 1, com codigo e id na saida', () => {
  const url = fixture(`
const praca = NORDESTE_V2.scenes['nordeste_praca'];
export const REGION_REGISTRY: RegionRegistry = {
  nordeste: {
    ...NORDESTE_V2,
    scenes: {
      ...NORDESTE_V2.scenes,
      nordeste_praca: {
        ...praca,
        escolhas: praca.escolhas.map((c) =>
          c.id === 'praca_ir_curral'
            ? { ...c, effects: [{ type: 'navigate' as const, to: 'nordeste_lugar_nenhum' }] }
            : c
        ),
      },
    },
  },
};`);

  const { status, saida } = validar(['--registry', url]);
  assert.equal(status, 1, saida);
  assert.match(saida, /ERROS/);
  assert.match(saida, /C1/);
  assert.match(saida, /praca_ir_curral/);
  assert.match(saida, /nordeste_lugar_nenhum/);
});

test('aviso sozinho passa sem --strict e derruba com --strict', () => {
  const url = fixture(`
export const REGION_REGISTRY: RegionRegistry = {
  nordeste: {
    ...NORDESTE_V2,
    qualities: [...NORDESTE_V2.qualities, { key: 'laco.conceicao' as const, default: 0 }],
  },
};`);

  const solto = validar(['--registry', url]);
  assert.equal(solto.status, 0, solto.saida);
  assert.match(solto.saida, /AVISOS/);
  assert.match(solto.saida, /A17/);
  assert.doesNotMatch(solto.saida, /ERROS/);

  const estrito = validar(['--registry', url, '--strict']);
  assert.equal(estrito.status, 1, estrito.saida);
  assert.match(estrito.saida, /--strict/);
});

test('registry inexistente sai com 2 — falha de uso, nao de conteudo', () => {
  const { status, saida } = validar(['--registry', '@/nao/existe']);
  assert.equal(status, 2);
  assert.match(saida, /Falha ao carregar/);
});

test('modulo sem REGION_REGISTRY tambem sai com 2', () => {
  const url = fixture(`export const OUTRA_COISA = 1;`);
  const { status, saida } = validar(['--registry', url]);
  assert.equal(status, 2);
  assert.match(saida, /não exporta REGION_REGISTRY/);
});
