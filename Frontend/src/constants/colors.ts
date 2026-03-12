export const APP_COLORS = {
    background: {
        base: "#F3E6C9",       // papel claro
        baseSoft: "#E8D8B0",   // variação
        baseDark: "#D7C39A",   // papel envelhecido
        tabBar: "#1E1812",        // fundo das abas
        vignetteStrong: "rgba(58,41,24,0.50)",
        vignetteSoft: "rgba(58,41,24,0.30)",
    },
    text: {
        primary: "#2B1E12",     // tinta principal
        secondary: "#5B4631",
        muted: "#7B6246",
        onDark: "#F7F1DE",
    },
    buttons: {
        primary: "#2B3A3F",
        secondary: "#3E4C50",
        battle: "#A3362A",
        inventory: "#3A5F7D",
        text: "#FFFFFF",
        pin: {
            norte: "#5F7A4A",
            nordeste: "#9A6A32",
            centroOeste: "#7D6B3E",
            sudeste: "#8B4A3D",
            sul: "#4E6773",
        },
    },
} as const

export type AppColors = typeof APP_COLORS