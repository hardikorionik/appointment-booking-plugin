import { ThemeSettings } from "@/types";

export const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
};


export const applyTheme = (theme?: Partial<ThemeSettings>) => {
    if (!theme) return;
    console.log("------15", theme)
    const root = document.documentElement;

    /* Button */
    if (theme.button?.bg) {
        root.style.setProperty("--btn-bg", theme.button.bg);
    }

    if (theme.button?.text) {
        root.style.setProperty("--btn-text", theme.button.text);
    }

    if (theme.button?.bgHover) {
        root.style.setProperty(
            "--btn-bg-hover",
            theme.button.bgHover
        );
    }

    if (theme.button?.textHover) {
        root.style.setProperty(
            "--btn-text-hover",
            theme.button.textHover
        );
    }

    /* App */
    if (theme.colors?.bg) {
        root.style.setProperty("--app-bg", theme.colors.bg);
    }

    if (theme.colors?.link) {
        root.style.setProperty("--app-link", theme.colors.link);
    }

    if (theme.colors?.text) {
        root.style.setProperty("--app-text", theme.colors.text);
    }

    if (theme.colors?.bgHover) {
        root.style.setProperty(
            "--app-bg-hover",
            theme.colors.bgHover
        );
    }

    if (theme.colors?.textHover) {
        root.style.setProperty(
            "--app-text-hover",
            theme.colors.textHover
        );
    }
};