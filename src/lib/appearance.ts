/** Fontes disponíveis em Definições › Aparência. Outfit é a principal; todas são servidas localmente (fontsource). */
export const FONT_OPTIONS = {
  Outfit: '"Outfit Variable", "Outfit"',
  Inter: '"Inter Variable", "Inter"',
  Sistema: "system-ui",
} as const;

export type FontName = keyof typeof FONT_OPTIONS;
export const DEFAULT_FONT: FontName = "Outfit";
export const DEFAULT_PRIMARY = "#9956F6";

const FONT_KEY = "font-family";
const COLOR_KEY = "primary-color";

const isFontName = (v: string | null): v is FontName => v !== null && v in FONT_OPTIONS;

/** Lê o nome guardado, aceitando o formato antigo (`'Inter', sans-serif`). Qualquer valor desconhecido volta a Outfit. */
export function readFont(): FontName {
  try {
    const raw = localStorage.getItem(FONT_KEY);
    if (isFontName(raw)) return raw;
    const legacy = raw?.match(/^'([^']+)'/)?.[1] ?? null;
    return isFontName(legacy) ? legacy : DEFAULT_FONT;
  } catch {
    return DEFAULT_FONT;
  }
}

export function applyFont(name: FontName): void {
  document.documentElement.style.setProperty("--font-family", `${FONT_OPTIONS[name]}, ui-sans-serif, system-ui, sans-serif`);
}

export function saveFont(name: FontName): void {
  applyFont(name);
  try { localStorage.setItem(FONT_KEY, name); } catch { /* armazenamento indisponível: a escolha vale só nesta sessão */ }
}

export function readPrimary(): string {
  try { return localStorage.getItem(COLOR_KEY) ?? DEFAULT_PRIMARY; } catch { return DEFAULT_PRIMARY; }
}

export function applyPrimary(hex: string): void {
  document.documentElement.style.setProperty("--primary", hex);
  document.documentElement.style.setProperty("--ring", hex);
  document.documentElement.style.setProperty("--sidebar-primary", hex);
  document.documentElement.style.setProperty("--sidebar-ring", hex);
}

export function savePrimary(hex: string): void {
  applyPrimary(hex);
  try { localStorage.setItem(COLOR_KEY, hex); } catch { /* idem */ }
}

export function resetAppearance(): void {
  applyFont(DEFAULT_FONT);
  applyPrimary(DEFAULT_PRIMARY);
  try { localStorage.removeItem(FONT_KEY); localStorage.removeItem(COLOR_KEY); } catch { /* idem */ }
}
