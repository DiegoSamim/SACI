// As pistas da partida, na ordem de **descoberta** — não na de declaração.
// Compartilhado entre Scenario e Dialogue, que mostram o mesmo caderno.

import { useRunStore } from '@/store/runStore';
import type { ClueDef } from '@/types/region';

export function useCluesDescobertas(): ClueDef[] {
  const run = useRunStore((estado) => estado.run);
  const regiao = useRunStore((estado) => estado.regiaoAtual());
  if (!run || !regiao) return [];
  return run.clueOrder.map((clueId) => regiao.clues[clueId]).filter(Boolean);
}
