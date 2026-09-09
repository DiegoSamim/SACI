// ─── Resolução de assets de cena ─────────────────────────────────────────────
// O **único** lugar do projeto com `require()` de imagem de cena. É isso que
// mantém `src/data/` carregável em node puro — condição para o validador e os
// testes de playthrough rodarem sem bundler.
//
// A cena declara uma chave de string (`LocalScene.imagem`); quem transforma
// chave em pixel é a apresentação.

const CENAS: Record<string, number> = {
  // ── Fatia vertical v2 ────────────────────────────────────────────────────
  // TEXTO PROVISÓRIO tem arte provisória: não existe ilustração para estas
  // cenas, então cada uma empresta a arte v1 mais plausível. A reescrita do
  // conteúdo traz a arte definitiva.
  nordeste_praca: require('@/assets/scenario/nordeste/nordeste_cidade.png'),
  nordeste_curral: require('@/assets/scenario/nordeste/nordeste_caatinga_dia.png'),
  nordeste_capela: require('@/assets/scenario/nordeste/nordeste_dialogo_senhora_casa.png'),
  nordeste_noite: require('@/assets/scenario/nordeste/nordeste_confronto_noite.png'),
  nordeste_dialogo_raimundo: require('@/assets/scenario/nordeste/nordeste_dialogo_raimundo.png'),
};

/**
 * `undefined` quando não há arte — a tela desenha o placeholder de cordel em vez
 * de quebrar. Chave ausente é caso normal durante a autoria, não erro.
 */
export function sceneAsset(chave: string | undefined): number | undefined {
  return chave ? CENAS[chave] : undefined;
}
