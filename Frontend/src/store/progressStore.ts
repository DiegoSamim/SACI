// ─── Progresso global ────────────────────────────────────────────────────────
// O que atravessa saves: o caderno de campo e a galeria de finais. Apagar um
// save **não** apaga nem um nem outro.

import { create } from 'zustand';
import { buildDexRecord } from '@/engine';
import { REGION_REGISTRY } from '@/data/regions';
import { asyncStorageBackend } from '@/services/asyncStorageBackend';
import {
  loadProgress,
  listSlots,
  novoProgresso,
  saveProgress,
  type StorageBackend,
} from '@/services/storage';
import type { DexEntry, DexRecord, SaveSlotId } from '@/types/dex';
import type { Ending } from '@/types/ending';
import type { Qualities } from '@/types/qualities';
import type { RegionContent } from '@/types/region';
import type { GlobalProgress, SlotSummary } from '@/types/save';

type ProgressStore = {
  progresso: GlobalProgress;
  slots: SlotSummary[];
  hidratado: boolean;
  backend: StorageBackend;

  setBackend: (backend: StorageBackend) => void;
  hydrate: () => Promise<void>;
  refreshSlots: () => Promise<void>;
  marcarSlotJogado: (slot: SaveSlotId) => Promise<void>;
  registrarFinal: (params: RegistrarFinalParams) => Promise<void>;
  entradaDex: (creatureId: string) => DexEntry | undefined;
};

export type RegistrarFinalParams = {
  region: RegionContent;
  ending: Ending;
  podeCatalogar: boolean;
  state: Qualities;
  clueOrder: string[];
  slot: SaveSlotId;
  savedAt: number;
};

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progresso: novoProgresso(),
  slots: [],
  hidratado: false,
  backend: asyncStorageBackend,

  setBackend: (backend) => set({ backend }),

  /**
   * Carrega só o progresso global e o resumo dos slots. **Nenhuma partida fica
   * ativa** — quem manda carregar é o menu.
   *
   * Falha de storage no boot não pode dar tela branca: o jogo inicia com
   * progresso vazio e um aviso em log. Perder a galeria é ruim; não abrir é pior.
   */
  hydrate: async () => {
    const { backend } = get();
    try {
      const progresso = await loadProgress(backend);
      const slots = await listSlots(backend, REGION_REGISTRY);
      set({ progresso, slots, hidratado: true });
    } catch (erro) {
      console.warn('[SACI] falha ao ler o progresso salvo; iniciando vazio.', erro);
      set({ progresso: novoProgresso(), slots: [], hidratado: true });
    }
  },

  refreshSlots: async () => {
    const { backend } = get();
    try {
      set({ slots: await listSlots(backend, REGION_REGISTRY) });
    } catch (erro) {
      console.warn('[SACI] falha ao listar os saves.', erro);
    }
  },

  marcarSlotJogado: async (slot) => {
    const { backend, progresso } = get();
    const atualizado = { ...progresso, ultimoSlotJogado: slot };
    set({ progresso: atualizado });
    await saveProgress(backend, atualizado);
  },

  /**
   * Escrito **antes** do slot, ao encerrar uma região — ver a ordem documentada
   * em `runStore.encerrarRegiao`.
   *
   * A tag `fuga` não cataloga: o registro não entra no caderno e a ficha fica
   * marcada como não registrada, com explicação diegética. Mas o `endingId`
   * entra na galeria de qualquer jeito — o jogador viu aquele final.
   */
  registrarFinal: async ({ region, ending, podeCatalogar, state, clueOrder, slot, savedAt }) => {
    const { backend, progresso } = get();

    const finaisVistos = progresso.finaisVistos.includes(ending.id)
      ? progresso.finaisVistos
      : [...progresso.finaisVistos, ending.id];

    let dex = progresso.dex;

    if (podeCatalogar) {
      const registro: DexRecord = buildDexRecord({
        region,
        ending,
        state,
        clueOrder,
        slot,
        savedAt,
      });

      const anterior = progresso.dex[region.dex.creatureId];
      const entrada: DexEntry = {
        creatureId: region.dex.creatureId,
        regionId: region.dex.regionId,
        lenda: region.dex.lenda,
        // Registros empilham, nunca sobrescrevem: é um caderno de campo passado
        // adiante. O mais completo em destaque, os anteriores como registros
        // passados — duas investigações discordando na mesma página.
        registros: [...(anterior?.registros ?? []), registro].sort(
          (a, b) => b.completude - a.completude
        ),
      };

      dex = { ...progresso.dex, [region.dex.creatureId]: entrada };
    }

    const atualizado: GlobalProgress = {
      ...progresso,
      dex,
      finaisVistos,
      ultimoSlotJogado: slot,
    };

    set({ progresso: atualizado });
    await saveProgress(backend, atualizado);
  },

  entradaDex: (creatureId) => get().progresso.dex[creatureId],
}));
