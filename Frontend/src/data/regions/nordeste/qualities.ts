// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
import type { QualityRegistry } from '@/types/qualities';

export const NORDESTE_QUALITIES: QualityRegistry = [
  // ── Pistas ────────────────────────────────────────────────────────────────
  { key: 'pista.cabra_rastros', default: 0, min: 0, max: 1, label: 'Rastros estranhos' },
  { key: 'pista.cabra_voz', default: 0, min: 0, max: 1, label: 'A voz enganosa' },
  { key: 'pista.cabra_reza', default: 0, min: 0, max: 1, label: 'Fraqueza: oração' },

  // ── NPC ───────────────────────────────────────────────────────────────────
  {
    key: 'humor.raimundo',
    default: 0,
    min: -3,
    max: 3,
    label: 'Seu Raimundo',
    faixas: {
      hostil: [-3, -2],
      fechado: [-1, -1],
      neutro: [0, 0],
      receptivo: [1, 2],
      cumplice: [3, 3],
    },
  },
  { key: 'laco.raimundo', default: 0, min: 0, max: 3, label: 'Confiança de Raimundo' },

  // ── Mundo ─────────────────────────────────────────────────────────────────
  // Prefixado por região: um save atravessa as cinco e `mundo.ato` colidiria.
  { key: 'mundo.nordeste.ato', default: 0, min: 0, max: 2, label: 'Ato' },
  { key: 'mundo.nordeste.medo_vila', default: 0, min: 0, max: 3, label: 'Medo na vila' },

  // ── Feitos ────────────────────────────────────────────────────────────────
  { key: 'feito.nordeste.mentiu_para_raimundo', default: 0, min: 0, max: 1 },
  { key: 'feito.nordeste.fugiu', default: 0, min: 0, max: 1 },
  { key: 'feito.nordeste.chamou_no_escuro', default: 0, min: 0, max: 1 },
];
