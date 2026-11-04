export const FONT_FAMILY_VARIABLES: Record<string, string> = {
  Outfit: '"Outfit Variable", "Outfit"',
  Inter: '"Inter Variable", "Inter"',
  "Plus Jakarta Sans": '"Plus Jakarta Sans Variable", "Plus Jakarta Sans"',
  Roboto: "Roboto, sans-serif",
  Sistema: "system-ui",
};

export const DEFAULT_FONT_FAMILY = "Outfit";

export function resolveFontStack(fontFamily?: string): string {
  const chosen = fontFamily && FONT_FAMILY_VARIABLES[fontFamily] ? FONT_FAMILY_VARIABLES[fontFamily] : FONT_FAMILY_VARIABLES[DEFAULT_FONT_FAMILY];
  return `${chosen}, ui-sans-serif, system-ui, -apple-system, sans-serif`;
}

