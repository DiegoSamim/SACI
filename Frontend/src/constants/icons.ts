export const ICONS = {
    mapa: require("../assets/icons/Mapa.png"),
    batalha: require("../assets/icons/Batalha.png"),
    chat: require("../assets/icons/Chat.png"),
    fogo: require("../assets/icons/Fogo.png"),
    garra: require("../assets/icons/Garra.png"),
    lança: require("../assets/icons/Lança.png"),
    livro: require("../assets/icons/Livro.png"),
    lupa: require("../assets/icons/Lupa.png"),
    pegada: require("../assets/icons/Pegada.png"),
    pegadaMula: require("../assets/icons/PegadaMula.png"),
    seta: require("../assets/icons/Seta.png"),
    vela: require("../assets/icons/Vela.png"),
    cadeado: require("../assets/icons/Cadeado.png"),

} as const

export const ICONS_DARK = {
    mapa: require("../assets/icons/MapaDark.png"),
    batalha: require("../assets/icons/BatalhaDark.png"),
    chat: require("../assets/icons/ChatDark.png"),
    fogo: require("../assets/icons/FogoDark.png"),
    garra: require("../assets/icons/GarraDark.png"),
    lança: require("../assets/icons/LançaDark.png"),
    livro: require("../assets/icons/LivroDark.png"),
    lupa: require("../assets/icons/LupaDark.png"),
    pegada: require("../assets/icons/PegadaDark.png"),
    pegadaMula: require("../assets/icons/PegadaMulaDark.png"),
    seta: require("../assets/icons/SetaDark.png"),
    vela: require("../assets/icons/VelaDark.png"),
    cadeado: require("../assets/icons/CadeadoDark.png"),
} as const

export type Icons = typeof ICONS
export type IconsDark = typeof ICONS_DARK