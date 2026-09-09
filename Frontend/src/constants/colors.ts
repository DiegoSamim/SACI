export const APP_COLORS = {
  background: {
    base: '#EDE1C4', // papel de cordel levemente mais quente
    baseSoft: '#E2D4B0', // variação envelhecida
    baseDark: '#CFC09A', // papel bem envelhecido
    tabBar: '#120D07', // preto quase tinta de xilogravura
    vignetteStrong: 'rgba(42,28,14,0.55)',
    vignetteSoft: 'rgba(42,28,14,0.28)',
  },
  text: {
    primary: '#1A0F06', // tinta de xilogravura — quase preto marrom
    secondary: '#4A3520',
    muted: '#7A5C38',
    onDark: '#EDE1C4', // papel no fundo escuro
  },
  // Estados do inspetor de dev (§7 do SYSTEM_DESIGN, DevInspector). Tons
  // dessaturados de tinta, coerentes com a paleta cordel — nunca são o único
  // portador de informação, sempre acompanhados do nome do estado por extenso.
  dev: {
    disponivel: '#6B7D45', // verde-oliva de tinta velha
    travada: '#8B5A1E', // ocre — mesmo tom do acento nordestino
    oculta: '#7A3828', // terracota — mesmo tom do acento sudeste
  },

  buttons: {
    // Primário: bloco preto de cordel — exatamente como na imagem
    primary: '#1A0F06',
    primaryText: '#EDE1C4',

    // Secundário: marrom escuro de couro
    secondary: '#3D2210',
    secondaryText: '#EDE1C4',

    // Batalha: vermelho de cordel — vivo, quente, xilogravura
    battle: '#B5311F',
    battleText: '#EDE1C4',

    // Inventário: azul esverdeado desbotado de tinta velha
    inventory: '#2E4A3E',
    inventoryText: '#EDE1C4',

    // Texto genérico legado (compatibilidade)
    text: '#EDE1C4',

    // Pinos do mapa — tons de tinta regional
    pin: {
      norte: '#4A6B35', // verde mata fechada
      nordeste: '#8B5A1E', // ocre seco do sertão
      centroOeste: '#6B5828', // terra dourada do cerrado
      sudeste: '#7A3828', // terracota colonial
      sul: '#385868', // azul frio das araucárias
    },
  },
} as const;

export type AppColors = typeof APP_COLORS;
