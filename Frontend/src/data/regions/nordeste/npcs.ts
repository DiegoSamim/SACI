// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
import type { NpcDef } from '@/types/region';

export const NORDESTE_NPCS: Record<string, NpcDef> = {
  raimundo: {
    id: 'raimundo',
    nome: 'Seu Raimundo',
    papel: 'Dono do bar',
    // Chave de asset, não `require()` — a resolução vive na apresentação.
    retrato: 'raimundo',
    humorKey: 'humor.raimundo',
  },
};
