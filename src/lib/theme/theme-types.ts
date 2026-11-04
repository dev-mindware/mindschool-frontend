export type BaseColorPreset =
  | "neutral"
  | "stone"
  | "zinc"
  | "mauve"
  | "olive"
  | "mist"
  | "taupe";

export type UIMode = "default" | "apple" | "vintage";

export type UIDensity = "compact" | "comfortable" | "spacious";

export interface SchoolBrandConfig {
  name: string;
  logo?: string;
  logoDark?: string;
  crest?: string;
  favicon?: string;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily?: string;
}

export interface AppearanceConfig {
  defaultMode: "light" | "dark" | "system";
}

/**
 * Vocabulário que separa a linguagem visual (UI Mode) dos componentes.
 * Nenhum componente decide arbitrariamente se tem contorno ou translucidez:
 * consome estes tokens e o modo (Standard, Apple ou Vintage) decide os valores.
 */
export interface UIDesignTokens {
  mode: UIMode;
  density: UIDensity;

  /** Raio base do modo. Alimenta `--radius`. */
  radius: string;
  /** Raio compacto do modo. Alimenta `--radius-xs`. No modo Vintage vale 0.125rem, no modo Apple e Standard volta ao normal. */
  radiusXs: string;

  /** Superfície de conteúdo: cartões, tabelas, painéis operacionais. */
  surface: string;
  /** Camadas flutuantes: popover, dropdown, dialog, tooltip. */
  surfaceElevated: string;
  /** Crómio da aplicação (topbar, sidebar). */
  surfaceChrome: string;
  /** Véu por trás dos diálogos. */
  surfaceOverlay: string;

  /** Blur do crómio e das camadas flutuantes (ex: 20px no Apple, 0px no Standard/Vintage). */
  backdropBlur: string;

  cardShadow: string;
  elevatedShadow: string;
  cardBorderColor: string;

  motionFast: string;
  motionNormal: string;
  motionSlow: string;

  paddingY: string;
  paddingX: string;
  gap: string;
}

/**
 * Entradas configuráveis pela escola no Brand Studio.
 */
export interface ThemeInput {
  version: number;
  brand: SchoolBrandConfig;
  uiMode?: UIMode;
  density?: UIDensity;
  baseColor: BaseColorPreset;
  primary: string; // HEX (ex: "#9956F6")
  secondary: string; // HEX (ex: "#6366F1")
  typography: TypographyConfig;
  radius?: string; // Fixo internamente — ajustado pelo UI Mode
  appearance: AppearanceConfig;
}

export interface NeutralTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;

  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;

  // Escala completa primária 50 a 900
  primary50: string;
  primary100: string;
  primary200: string;
  primary300: string;
  primary400: string;
  primary500: string;
  primary600: string;
  primary700: string;
  primary800: string;
  primary900: string;

  accent: string;
  accentForeground: string;
  ring: string;

  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;

  rail: string;
  railForeground: string;
  railActive: string;
  railActiveBg: string;
  railHover: string;

  brandbox: string;
  brandboxForeground: string;

  topbar: string;

  destructive: string;
  destructiveForeground: string;
}

export interface ExtendedThemeColors {
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  info: string;
  infoSoft: string;
  violet: string;
  violetSoft: string;
  destructiveSoft: string;
}

/**
 * Estrutura completa e expandida gerada por resolveTheme(input).
 */
export interface ThemeConfig {
  version: number;
  brand: SchoolBrandConfig;
  uiMode: UIMode;
  density: UIDensity;
  uiTokens: UIDesignTokens;
  colors: ThemeColors;
  extendedColors: ExtendedThemeColors;
  typography: TypographyConfig;
  radius?: string;
  appearance: AppearanceConfig;
}

