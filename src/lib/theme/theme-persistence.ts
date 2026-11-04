import { themeInputSchema } from "./theme-validation";
import type { ThemeInput } from "./theme-types";

const THEME_STORAGE_PREFIX = "mindschool:school-theme:";
const THEME_COOKIE_PREFIX = "mindschool-theme-";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function normalizeSchoolId(schoolId: string): string {
  return schoolId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

export function getSchoolThemeStorageKey(schoolId: string): string {
  return `${THEME_STORAGE_PREFIX}${normalizeSchoolId(schoolId)}`;
}

export function getSchoolThemeCookieName(schoolId: string): string {
  return `${THEME_COOKIE_PREFIX}${normalizeSchoolId(schoolId)}`;
}

export function parsePersistedSchoolTheme(value: string | null | undefined): ThemeInput | null {
  if (!value) return null;

  const candidates = [value];

  try {
    candidates.push(decodeURIComponent(value));
  } catch {
    // Valor já descodificado
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const result = themeInputSchema.safeParse(parsed);
      if (result.success) {
        return result.data as ThemeInput;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function readSchoolThemeFromBrowserStorage(schoolId: string): ThemeInput | null {
  if (typeof window === "undefined") return null;

  try {
    return parsePersistedSchoolTheme(
      window.localStorage.getItem(getSchoolThemeStorageKey(schoolId))
    );
  } catch {
    return null;
  }
}

export function persistSchoolThemeInBrowser(schoolId: string, input: ThemeInput): void {
  if (typeof window === "undefined") return;

  const serialized = JSON.stringify(input);

  try {
    window.localStorage.setItem(getSchoolThemeStorageKey(schoolId), serialized);
  } catch {
    // LocalStorage indisponível
  }

  document.cookie = [
    `${getSchoolThemeCookieName(schoolId)}=${encodeURIComponent(serialized)}`,
    "Path=/",
    `Max-Age=${THEME_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ].join("; ");
}
