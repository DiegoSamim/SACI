// ─── Registro único de conteúdo ──────────────────────────────────────────────
// Fonte única de cenas, pistas, NPCs e finais. Store, engine e telas leem daqui.
// Corrige a dívida C3: o v1 tem quatro registros paralelos — não crie um quinto.
//
// Uma região ausente aqui é uma região que ainda não existe: `canEnterRegion`
// devolve `regiao_desconhecida` e o mapa manda para `ComingSoonRegion`.

import type { RegionRegistry } from '@/types/region';
import { NORDESTE_V2 } from './nordeste';

export const REGION_REGISTRY: RegionRegistry = {
  nordeste: NORDESTE_V2,
};

export const REGION_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(REGION_REGISTRY)
    .filter((regiao) => regiao !== undefined)
    .map((regiao) => [regiao.meta.regionId, regiao.meta.label])
);
