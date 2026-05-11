import { ThemeSettings } from "@/types";

export const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
};

export const defaultTheme: ThemeSettings = {
    button: {
        bg: "#000000",
        text: "#ffffff",
        bgHover: "#1f2937",
        textHover: "#ffffff",
    },

    colors: {
        bg: "#103332",
        link: "#385b5a",
        text: "#e9ebec",
        bgHover: "#4c6f6e",
        textHover: "#ffffff",
    },
};

export const applyTheme = (theme?: Partial<ThemeSettings>) => {
    const root = document.documentElement;

    console.log("Applying theme:", theme);
    /* Button */
    root.style.setProperty(
        "--btn-bg",
        theme?.button?.bg || defaultTheme.button.bg
    );

    root.style.setProperty(
        "--btn-text",
        theme?.button?.text || defaultTheme.button.text
    );

    root.style.setProperty(
        "--btn-bg-hover",
        theme?.button?.bgHover || defaultTheme.button.bgHover
    );

    root.style.setProperty(
        "--btn-text-hover",
        theme?.button?.textHover || defaultTheme.button.textHover
    );

    /* App Theme */
    root.style.setProperty(
        "--app-bg",
        theme?.colors?.bg || defaultTheme.colors.bg
    );

    root.style.setProperty(
        "--app-link",
        theme?.colors?.link || defaultTheme.colors.link
    );

    root.style.setProperty(
        "--app-text",
        theme?.colors?.text || defaultTheme.colors.text
    );

    root.style.setProperty(
        "--app-bg-hover",
        theme?.colors?.bgHover || defaultTheme.colors.bgHover
    );

    root.style.setProperty(
        "--app-text-hover",
        theme?.colors?.textHover || defaultTheme.colors.textHover
    );
};