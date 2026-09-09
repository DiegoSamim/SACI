// ─── npm run validate ────────────────────────────────────────────────────────
// A CLI: carrega o registry, imprime e decide o código de saída. **Não conhece
// nenhuma regra** — todas vivem em scripts/validate/rules.ts.
//
//   npm run validate
//   npm run validate -- --strict                  avisos também derrubam
//   npm run validate -- --registry <especificador>  valida outro registry

import { validarRegistry, type Problema } from './validate/rules';
import type { RegionRegistry } from '@/types/region';

const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const indiceRegistry = argv.indexOf('--registry');
const especificador = indiceRegistry >= 0 ? argv[indiceRegistry + 1] : '@/data/regions';

if (indiceRegistry >= 0 && !especificador) {
  console.error('--registry precisa de um especificador de módulo.');
  process.exit(2);
}

let registry: RegionRegistry;
try {
  const modulo = (await import(especificador)) as { REGION_REGISTRY?: RegionRegistry };
  if (!modulo.REGION_REGISTRY) {
    console.error(`"${especificador}" não exporta REGION_REGISTRY.`);
    process.exit(2);
  }
  registry = modulo.REGION_REGISTRY;
} catch (erro) {
  console.error(`Falha ao carregar "${especificador}":`, erro);
  process.exit(2);
}

const problemas = validarRegistry(registry);
const erros = problemas.filter((p) => p.severidade === 'erro');
const avisos = problemas.filter((p) => p.severidade === 'aviso');

function imprimir(titulo: string, lista: Problema[]) {
  if (lista.length === 0) return;
  console.log(`\n${titulo}`);
  for (const p of lista) {
    console.log(`  ${p.codigo.padEnd(4)} ${p.onde}`);
    console.log(`       ${p.mensagem}`);
  }
}

const regioes = Object.keys(registry).length;
console.log(`Validando ${regioes} ${regioes === 1 ? 'região' : 'regiões'} de "${especificador}"…`);

// Erros antes de avisos: é o que precisa ser consertado primeiro.
imprimir('ERROS', erros);
imprimir('AVISOS', avisos);

const resumo = [
  `${erros.length} ${erros.length === 1 ? 'erro' : 'erros'}`,
  `${avisos.length} ${avisos.length === 1 ? 'aviso' : 'avisos'}`,
].join(', ');

if (erros.length === 0 && avisos.length === 0) {
  console.log('\nConteúdo válido — nenhum problema encontrado.');
} else {
  console.log(`\n${resumo}${strict && avisos.length > 0 ? ' (--strict: avisos derrubam)' : ''}`);
}

process.exit(erros.length > 0 || (strict && avisos.length > 0) ? 1 : 0);
