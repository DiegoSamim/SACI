export const FONT_FAMILY = {
  systemSerif: 'serif',
  systemSans: 'System',
  cordelRustikaRegular: 'CordelRustika-Regular',
  cordelRustikaItalic: 'CordelRustika-Italic',
  xilosa: 'Xilosa',
} as const;

export const FONT_ASSETS = {
  [FONT_FAMILY.cordelRustikaRegular]: require('../assets/fonts/cordel_rustika/CordelRustika-Regular.ttf'),
  [FONT_FAMILY.cordelRustikaItalic]: require('../assets/fonts/cordel_rustika/CordelRustika-Italic.ttf'),
  [FONT_FAMILY.xilosa]: require('../assets/fonts/xilosa/xilosa_.ttf'),
} as const;

export const AVAILABLE_CUSTOM_FONTS = [
  FONT_FAMILY.cordelRustikaRegular,
  FONT_FAMILY.cordelRustikaItalic,
  FONT_FAMILY.xilosa,
] as const;

export type FontFamily = typeof FONT_FAMILY;
