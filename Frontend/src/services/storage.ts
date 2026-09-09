// ─── Persistência versionada ─────────────────────────────────────────────────
// Fecha o bloqueador B1 do SYSTEM_DESIGN.md §7.1. Dois níveis, quatro chaves:
// três slots e o progresso global, cada um com sua própria `version`.
//
// **Este arquivo não importa AsyncStorage.** O backend é injetado — o app passa
// `asyncStorageBackend`, os testes passam `memoryBackend`. É o que mantém a
// persistência testável em node puro, sem módulo nativo.
//
// Regra que atravessa tudo aqui: **nada pode derrubar o app**. JSON corrompido,
// versão do futuro, campo faltando ou região que não existe mais devolvem `null`
// e o slot é tratado como vazio. Um save ilegível é um save perdido, não um crash.

import type { RegionRegistry } from '@/types/region';
import type { GlobalProgress, SaveSlot, SlotSummary } from '@/types/save';
import type { SaveSlotId } from '@/types/dex';

export const SAVE_VERSION = 1;
export const GLOBAL_PROGRESS_VERSION = 1;

export const SLOT_IDS: readonly SaveSlotId[] = [1, 2, 3];

export type StorageBackend = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
};

const slotKey = (slot: SaveSlotId) => `saci.slot.${slot}`;
const PROGRESS_KEY = 'saci.progress';

// ─── Migração ────────────────────────────────────────────────────────────────
// Hoje vazio: a versão 1 é a primeira. A máquina existe antes de precisar dela
// porque adicioná-la depois exigiria adivinhar o formato de saves já gravados.

type Migracao = (raw: Record<string, unknown>) => Record<string, unknown>;

const MIGRACOES_SLOT: Record<number, Migracao> = {};
const MIGRACOES_PROGRESS: Record<number, Migracao> = {};

/**
 * Aplica migrações em cadeia até `alvo`. Devolve `null` se a versão for do
 * futuro (save gravado por um app mais novo — não dá para adivinhar o formato)
 * ou se faltar um degrau da escada.
 */
function migrar(
  raw: Record<string, unknown>,
  alvo: number,
  migracoes: Record<number, Migracao>
): Record<string, unknown> | null {
  const versao = raw.version;
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 1) return null;
  if (versao > alvo) return null;

  let atual = raw;
  for (let v = versao; v < alvo; v++) {
    const passo = migracoes[v];
    if (!passo) return null;
    atual = passo(atual);
  }
  return { ...atual, version: alvo };
}

function parse(texto: string | null): Record<string, unknown> | null {
  if (!texto) return null;
  try {
    const valor: unknown = JSON.parse(texto);
    return valor && typeof valor === 'object' && !Array.isArray(valor)
      ? (valor as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

// ─── Validação de forma ──────────────────────────────────────────────────────

function ehSlotValido(raw: Record<string, unknown>): raw is SaveSlot & Record<string, unknown> {
  return (
    typeof raw.slot === 'number' &&
    typeof raw.currentSceneId === 'string' &&
    typeof raw.qualities === 'object' &&
    raw.qualities !== null &&
    Array.isArray(raw.takenChoices) &&
    Array.isArray(raw.clueOrder) &&
    typeof raw.regioesConcluidas === 'object' &&
    raw.regioesConcluidas !== null
  );
}

export function migrateSlot(texto: string | null): SaveSlot | null {
  const raw = parse(texto);
  if (!raw) return null;
  const migrado = migrar(raw, SAVE_VERSION, MIGRACOES_SLOT);
  if (!migrado || !ehSlotValido(migrado)) return null;
  return migrado as SaveSlot;
}

export function migrateProgress(texto: string | null): GlobalProgress | null {
  const raw = parse(texto);
  if (!raw) return null;
  const migrado = migrar(raw, GLOBAL_PROGRESS_VERSION, MIGRACOES_PROGRESS);
  if (!migrado) return null;
  if (typeof migrado.dex !== 'object' || migrado.dex === null) return null;
  if (!Array.isArray(migrado.finaisVistos)) return null;
  return migrado as GlobalProgress;
}

// ─── Save robusto ────────────────────────────────────────────────────────────

/**
 * Um save pode apontar para conteúdo que não existe mais — cena renomeada numa
 * atualização, ou região ainda não implementada. Em vez de crashar, volta para a
 * entrada da região; se nem a região existir, o save vira "sem partida em curso"
 * e o menu manda o jogador escolher outra.
 */
export function repararSlot(slot: SaveSlot, registry: RegionRegistry): SaveSlot {
  if (!slot.currentRegionId) return slot;

  const regiao = registry[slot.currentRegionId];
  if (!regiao) {
    return { ...slot, currentRegionId: null, currentSceneId: '', currentLineId: undefined };
  }

  if (!regiao.scenes[slot.currentSceneId]) {
    return {
      ...slot,
      currentSceneId: regiao.meta.entrySceneId,
      currentLineId: undefined,
    };
  }

  return slot;
}

// ─── Leitura e escrita ───────────────────────────────────────────────────────

export function novoSlot(slot: SaveSlotId, agora: number): SaveSlot {
  return {
    version: SAVE_VERSION,
    slot,
    criadoEm: agora,
    atualizadoEm: agora,
    qualities: {},
    currentRegionId: null,
    currentSceneId: '',
    takenChoices: [],
    clueOrder: [],
    regioesConcluidas: {},
  };
}

export function novoProgresso(): GlobalProgress {
  return { version: GLOBAL_PROGRESS_VERSION, dex: {}, finaisVistos: [] };
}

export async function loadSlot(
  backend: StorageBackend,
  slot: SaveSlotId,
  registry: RegionRegistry
): Promise<SaveSlot | null> {
  const bruto = await backend.get(slotKey(slot));
  const carregado = migrateSlot(bruto);
  return carregado ? repararSlot(carregado, registry) : null;
}

/** Propaga erro de escrita (disco cheio) para quem chamou decidir — não engole. */
export async function saveSlot(backend: StorageBackend, slot: SaveSlot): Promise<void> {
  await backend.set(slotKey(slot.slot), JSON.stringify(slot));
}

export async function deleteSlot(backend: StorageBackend, slot: SaveSlotId): Promise<void> {
  await backend.remove(slotKey(slot));
}

export async function loadProgress(backend: StorageBackend): Promise<GlobalProgress> {
  return migrateProgress(await backend.get(PROGRESS_KEY)) ?? novoProgresso();
}

export async function saveProgress(
  backend: StorageBackend,
  progresso: GlobalProgress
): Promise<void> {
  await backend.set(PROGRESS_KEY, JSON.stringify(progresso));
}

/** Resumo dos três slots para o menu, sem manter os saves inteiros em memória. */
export async function listSlots(
  backend: StorageBackend,
  registry: RegionRegistry
): Promise<SlotSummary[]> {
  const resumos: SlotSummary[] = [];
  for (const id of SLOT_IDS) {
    const save = await loadSlot(backend, id, registry);
    resumos.push(
      save
        ? {
            slot: id,
            vazio: false,
            regionId: save.currentRegionId ?? undefined,
            atualizadoEm: save.atualizadoEm,
            regioesConcluidas: Object.keys(save.regioesConcluidas).length,
          }
        : { slot: id, vazio: true }
    );
  }
  return resumos;
}

/** Backend em memória — testes, e fallback se AsyncStorage falhar de vez. */
export function memoryBackend(inicial: Record<string, string> = {}): StorageBackend {
  const dados = new Map(Object.entries(inicial));
  return {
    get: async (key) => dados.get(key) ?? null,
    set: async (key, value) => void dados.set(key, value),
    remove: async (key) => void dados.delete(key),
  };
}
