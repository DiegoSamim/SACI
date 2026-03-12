export const TYPOGRAPHY = {
    fontFamily: {
        serif: "serif",
        sans: "System",
    },
    fontSize: {
        xs: 10,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 26,
        display: 36,
    },
    letterSpacing: {
        tight: 0.3,
        normal: 1,
        wide: 1.5,
        ultraWide: 4,
    },
    fontWeight: {
        regular: "400",
        semibold: "600",
        bold: "700",
    },
} as const

export type Typography = typeof TYPOGRAPHY