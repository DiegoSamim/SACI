// Loader de resolução para rodar engine, conteúdo e testes em node puro.
//
// Existe porque o código do app segue duas convenções que o node ESM não conhece:
//   1. alias `@/x` → `src/x` (CLAUDE.md proíbe `../../`)
//   2. imports sem extensão (`./clues`), enquanto ESM exige `./clues.ts`
//
// Metro e Expo nunca veem este arquivo — ele só entra via `node --import` nos
// scripts de teste e de validação. O bundle do app não muda em nada.

import { existsSync } from 'node:fs';
import module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// `module.registerHooks` chegou no Node 22.15; type-stripping por padrão, no 22.18.
// Sem esta checagem, uma máquina com node antigo quebra com erro incompreensível.
const MINIMO = [22, 18];
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < MINIMO[0] || (major === MINIMO[0] && minor < MINIMO[1])) {
  console.error(
    `\nEste projeto exige Node >= ${MINIMO.join('.')} (encontrado: ${process.versions.node}).\n` +
      'Os testes rodam TypeScript direto, sem build, e dependem de:\n' +
      '  - module.registerHooks (Node 22.15+)\n' +
      '  - type-stripping habilitado por padrão (Node 22.18+)\n'
  );
  process.exit(1);
}

const SRC = pathToFileURL(new URL('../src/', import.meta.url).pathname).href;
const TEM_EXTENSAO = /\.[cm]?[jt]sx?$/;
const CANDIDATOS = ['.ts', '.tsx', '/index.ts'];

module.registerHooks({
  resolve(specifier, context, nextResolve) {
    let alvo = specifier.startsWith('@/') ? SRC + specifier.slice(2) : specifier;

    const ehCaminho = alvo.startsWith('.') || alvo.startsWith('file:');
    if (ehCaminho && !TEM_EXTENSAO.test(alvo)) {
      const base = new URL(alvo, context.parentURL).href;
      for (const extensao of CANDIDATOS) {
        if (existsSync(fileURLToPath(base + extensao))) {
          alvo = base + extensao;
          break;
        }
      }
    }

    return nextResolve(alvo, context);
  },
});
