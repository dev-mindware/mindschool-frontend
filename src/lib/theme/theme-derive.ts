import type {
  ThemeInput,
  ThemeConfig,
  ThemeColors,
  ExtendedThemeColors,
} from "./theme-types";
import { baseColorPresets } from "./theme-presets";
import { resolveUIModeTokens } from "./ui-mode-resolver";

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r / 255, g / 255, b / 255];
  }
  if (clean.length !== 6) return [0.6, 0.34, 0.96]; // fallback #9956F6
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return [r / 255, g / 255, b / 255];
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToOklch(colorHex: string): OklchColor {
  const [r, g, b] = parseHex(colorHex);
  const rL = srgbToLinear(r);
  const gL = srgbToLinear(g);
  const bL = srgbToLinear(b);

  const l_ = Math.cbrt(0.4122214708 * rL + 0.5363325363 * gL + 0.0514459929 * bL);
  const m_ = Math.cbrt(0.2119034982 * rL + 0.6806995451 * gL + 0.1073969566 * bL);
  const s_ = Math.cbrt(0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720403 * s_;
  const a = 1.9779984951 * l_ - 2.4285922 * m_ + 0.4505937099 * s_;
  const bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757973 * s_;

  const C = Math.sqrt(a * a + bVal * bVal);
  let H = (Math.atan2(bVal, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return {
    l: Math.max(0, Math.min(1, L)),
    c: Math.max(0, C),
    h: isNaN(H) ? 0 : H,
  };
}

export function oklchToString(c: OklchColor): string {
  const l = Number(c.l.toFixed(4));
  const chroma = Number(c.c.toFixed(4));
  const h = Number(c.h.toFixed(2));
  return `oklch(${l} ${chroma} ${h})`;
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  const rL = srgbToLinear(r);
  const gL = srgbToLinear(g);
  const bL = srgbToLinear(b);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function pickReadableForeground(bg: OklchColor, hex?: string): OklchColor {
  if (hex) {
    const whiteRatio = calculateContrastRatio(hex, "#ffffff");
    // Em componentes de UI (especialmente botões primários), o texto branco é o padrão
    // legível esperado para todas as cores vivas/escuras. Só passa a escuro em tons extremamente claros (ex: amarelo puro).
    if (whiteRatio >= 3.0) {
      return { l: 0.99, c: 0, h: 0 };
    }
    return { l: 0.145, c: 0.005, h: bg.h };
  }

  // No espaço OKLCH, cores com L < 0.78 (roxo, azul, verde, vermelho, etc.) mantêm texto branco
  if (bg.l >= 0.78) {
    return { l: 0.145, c: 0.005, h: bg.h };
  }
  return { l: 0.99, c: 0, h: 0 };
}

export function deriveSupportColors(
  primary: OklchColor,
  mode: "light" | "dark" = "light"
) {
  const isLight = mode === "light";

  const accent: OklchColor = isLight
    ? { l: 0.95, c: Math.min(primary.c * 0.25, 0.05), h: primary.h }
    : { l: 0.25, c: Math.min(primary.c * 0.35, 0.08), h: primary.h };

  const accentForeground = pickReadableForeground(accent);

  const ring: OklchColor = {
    l: primary.l,
    c: primary.c * 0.6,
    h: primary.h,
  };

  const chartHueOffsets = [0, 45, 120, 190, 280];
  const chart: OklchColor[] = chartHueOffsets.map((offset) => ({
    l: isLight ? 0.62 : 0.72,
    c: Math.min(Math.max(primary.c, 0.12), 0.22),
    h: (primary.h + offset) % 360,
  }));

  return {
    accent,
    accentForeground,
    ring,
    chart,
  };
}

const RAIL_MIN_INK_CONTRAST = 3;
const RAIL_INK_LIGHT: OklchColor = { l: 0.985, c: 0, h: 0 };
const RAIL_INK_DARK: OklchColor = { l: 0.16, c: 0.012, h: 0 };

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function towardInkFromInk(ink: OklchColor, slab: OklchColor, t: number): OklchColor {
  return {
    l: clamp01(ink.l + (slab.l - ink.l) * t),
    c: ink.c,
    h: slab.h,
  };
}

export function deriveRailColors(
  primary: OklchColor,
  primaryHex: string,
  _secondaryHex: string,
  mode: "light" | "dark" = "light"
) {
  const isLight = mode === "light";

  // Na sidebar modular (rail de navegação flutuante):
  // No modo claro: coloração rica com a identidade de marca da escola (color-mix 62% com preto)
  // No modo escuro: cápsula translúcida suave de vidro escurecido
  const slab = isLight
    ? `color-mix(in oklab, ${primaryHex} 62%, black)`
    : "rgba(0, 0, 0, 0.45)";

  return {
    rail: slab,
    railForeground: "#ffffff",
    railActive: "#ffffff",
    railActiveBg: "rgba(255, 255, 255, 0.20)",
    railHover: "rgba(255, 255, 255, 0.10)",
    brandbox: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.10)",
    brandboxForeground: isLight ? primaryHex : "#ffffff",
  };
}

export function deriveExtendedColors(
  primary: OklchColor,
  _primaryHex: string,
  mode: "light" | "dark" = "light"
): ExtendedThemeColors {
  const isLight = mode === "light";

  return {
    success: isLight ? "oklch(0.6 0.17 145)" : "oklch(0.7 0.17 145)",
    successSoft: isLight
      ? "color-mix(in oklab, oklch(0.6 0.17 145) 12%, transparent)"
      : "color-mix(in oklab, oklch(0.7 0.17 145) 18%, transparent)",
    warning: isLight ? "oklch(0.7 0.16 65)" : "oklch(0.78 0.16 65)",
    warningSoft: isLight
      ? "color-mix(in oklab, oklch(0.7 0.16 65) 14%, transparent)"
      : "color-mix(in oklab, oklch(0.78 0.16 65) 20%, transparent)",
    info: oklchToString({ l: isLight ? 0.6 : 0.7, c: 0.15, h: primary.h }),
    infoSoft: `color-mix(in oklab, oklch(${isLight ? 0.6 : 0.7} 0.15 ${primary.h.toFixed(2)}) 12%, transparent)`,
    violet: "oklch(0.62 0.2 295)",
    violetSoft: isLight
      ? "color-mix(in oklab, oklch(0.62 0.2 295) 12%, transparent)"
      : "color-mix(in oklab, oklch(0.62 0.2 295) 18%, transparent)",
    destructiveSoft: isLight
      ? "color-mix(in oklab, oklch(0.58 0.22 25) 12%, transparent)"
      : "color-mix(in oklab, oklch(0.65 0.22 25) 20%, transparent)",
  };
}

export function resolveTheme(
  input: ThemeInput,
  colorMode: "light" | "dark" = "light"
): ThemeConfig {
  const isLight = colorMode === "light";
  const primaryOklch = hexToOklch(input.primary);
  const secondaryOklch = hexToOklch(input.secondary);

  const primaryForeground = pickReadableForeground(primaryOklch, input.primary);
  const brandSecondaryForeground = pickReadableForeground(secondaryOklch, input.secondary);

  const primaryFgStr =
    calculateContrastRatio(input.primary, "#ffffff") >= 3.0
      ? "#ffffff"
      : oklchToString(primaryForeground);

  const secondaryFgStr =
    calculateContrastRatio(input.secondary, "#ffffff") >= 3.0
      ? "#ffffff"
      : oklchToString(brandSecondaryForeground);

  const neutrals =
    baseColorPresets[input.baseColor]?.[colorMode] ??
    baseColorPresets.zinc[colorMode];

  const support = deriveSupportColors(primaryOklch, colorMode);
  const rail = deriveRailColors(
    primaryOklch,
    input.primary,
    input.secondary,
    colorMode
  );
  const extendedColors = deriveExtendedColors(
    primaryOklch,
    input.primary,
    colorMode
  );

  const uiTokens = resolveUIModeTokens(
    input.uiMode ?? "default",
    input.density ?? "comfortable",
    colorMode,
    input.radius ?? "0.5rem"
  );

  const topbar = isLight ? neutrals.card : neutrals.background;

  // Escala primaria de 50 a 900
  const primaryH = primaryOklch.h;
  const primaryC = primaryOklch.c;

  // No sistema de design, a cor secundária de interface (--secondary) corresponde
  // à superfície neutra de botões/elementos secundários (neutrals.muted),
  // enquanto input.secondary é a identidade de marca (brand-secondary).
  const secondary = neutrals.muted;
  const secondaryForeground = neutrals.foreground;

  const colors: ThemeColors = {
    ...neutrals,
    primary: input.primary,
    primaryForeground: primaryFgStr,
    secondary,
    secondaryForeground,

    primary50: `color-mix(in oklab, ${input.primary} 8%, white)`,
    primary100: `color-mix(in oklab, ${input.primary} 16%, white)`,
    primary200: `color-mix(in oklab, ${input.primary} 30%, white)`,
    primary300: `color-mix(in oklab, ${input.primary} 50%, white)`,
    primary400: `color-mix(in oklab, ${input.primary} 75%, white)`,
    primary500: input.primary,
    primary600: `color-mix(in oklab, ${input.primary} 88%, black)`,
    primary700: `color-mix(in oklab, ${input.primary} 76%, black)`,
    primary800: `color-mix(in oklab, ${input.primary} 64%, black)`,
    primary900: `color-mix(in oklab, ${input.primary} 52%, black)`,

    accent: neutrals.muted,
    accentForeground: neutrals.foreground,
    ring: input.primary,

    chart1: input.primary,
    chart2: isLight ? "#34a853" : "#34a853",
    chart3: isLight ? "#fbbc05" : "#fbbc05",
    chart4: isLight ? "#ea4335" : "#ea4335",
    chart5: isLight ? "color-mix(in oklab, var(--primary) 40%, black)" : "color-mix(in oklab, var(--primary) 65%, white)",

    sidebar: isLight ? "#ffffff" : neutrals.card,
    sidebarForeground: neutrals.foreground,
    sidebarPrimary: input.primary,
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent: neutrals.muted,
    sidebarAccentForeground: neutrals.foreground,
    sidebarBorder: neutrals.border,
    sidebarRing: input.primary,

    rail: rail.rail,
    railForeground: rail.railForeground,
    railActive: rail.railActive,
    railActiveBg: rail.railActiveBg,
    railHover: rail.railHover,
    brandbox: rail.brandbox,
    brandboxForeground: rail.brandboxForeground,

    topbar,

    destructive: isLight ? "hsl(0 84.2% 60.2%)" : "#ef4444",
    destructiveForeground: "#ffffff",
  };

  return {
    version: input.version || 1,
    brand: input.brand,
    uiMode: input.uiMode ?? "default",
    density: input.density ?? "comfortable",
    uiTokens,
    colors,
    extendedColors,
    typography: input.typography,
    radius: uiTokens.radius,
    appearance: input.appearance,
  };
}

