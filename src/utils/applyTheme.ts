import { ThemeSettings } from "@/types";

export const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "");

    const bigint = parseInt(cleanHex, 16);

    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
};

export const applyTheme = (theme: ThemeSettings) => {
    const root = document.documentElement;

    // Primary
    root.style.setProperty("--primary", theme.bgColor);

    root.style.setProperty(
        "--primary-rgb",
        hexToRgb(theme.bgColor)
    );

    root.style.setProperty(
        "--primary-bg-subtle",
        `rgba(${hexToRgb(theme.bgColor)}, 0.15)`
    );

    root.style.setProperty(
        "--primary-border-subtle",
        `rgba(${hexToRgb(theme.bgColor)}, 0.30)`
    );

    root.style.setProperty(
        "--primary-text-emphasis",
        theme.bgHoverColor
    );

    // Button
    root.style.setProperty(
        "--btn-bg",
        theme.buttonBgColor
    );

    root.style.setProperty(
        "--btn-color",
        theme.buttonTextColor
    );

    root.style.setProperty(
        "--btn-hover-bg",
        theme.buttonHoverBgColor
    );

    root.style.setProperty(
        "--btn-hover-color",
        theme.buttonHoverTextColor
    );

    // Link
    root.style.setProperty(
        "--link-color",
        theme.linkColor
    );

    // Custom
    root.style.setProperty(
        "--customtheme-bg-color",
        theme.bgColor
    );

    root.style.setProperty(
        "--customtheme-bg-hover-color",
        theme.bgHoverColor
    );

    root.style.setProperty(
        "--customtheme-hover-color",
        theme.hoverColor
    );

    root.style.setProperty(
        "--customtheme-front-color",
        theme.frontColor
    );
};