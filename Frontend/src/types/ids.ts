// ─── Identificadores canônicos ───────────────────────────────────────────────
// Fonte única de ids do projeto. Ver SYSTEM_DESIGN.md §4.1.
// Ids são a API pública entre conteúdo e engine: quebrar um id quebra saves.

/**
 * Identificador canônico de região. Circula por toda a stack — rotas, store,
 * engine, data e assets. Nome de exibição vive só na apresentação.
 *
 * Nunca derive um `RegionId` de um label com `toLowerCase()`/`replace()`.
 */
export type RegionId = 'nordeste' | 'norte' | 'sudeste' | 'sul' | 'centro_oeste';

/** Slug sem acento, minúsculo. Único entre **todas** as regiões. */
export type NpcId = string;

/** `{regionId}_{slug}` — ex.: `nordeste_curral`. */
export type SceneId = string;

/** Slug curto, único dentro do diálogo — ex.: `abertura`. */
export type LineId = string;

/** `{criatura}_{fato}` — ex.: `cabra_voz`. Único entre **todas** as regiões. */
export type ClueId = string;

/** `snake_case` — ex.: `cabra_cabriola`. */
export type CreatureId = string;

/**
 * Destino de `navigate`: `"sceneId"` ou `"sceneId#lineId"`.
 * Quem parte o `#` é a engine, nunca a tela — ver `NavigationIntent`.
 */
export type NavigateTarget = string;
