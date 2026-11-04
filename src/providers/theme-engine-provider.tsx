"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeInput, ThemeConfig } from "@/lib/theme";
import {
  resolveTheme,
  generateThemeCssVariables,
  defaultThemeInput,
  readSchoolThemeFromBrowserStorage,
  persistSchoolThemeInBrowser,
} from "@/lib/theme";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { patchSettings } from "@/services/school-settings-service";

interface ThemeEngineContextValue {
  schoolId: string;
  themeInput: ThemeInput;
  themeConfig: ThemeConfig;
  previewInput: ThemeInput;
  isPreviewing: boolean;
  setPreviewInput: (input: ThemeInput | ((prev: ThemeInput) => ThemeInput)) => void;
  resetPreview: () => void;
  publishChanges: () => Promise<void>;
}

const ThemeEngineContext = createContext<ThemeEngineContextValue | null>(null);

export function useThemeEngine(): ThemeEngineContextValue {
  const context = useContext(ThemeEngineContext);
  if (!context) {
    throw new Error("useThemeEngine must be used within a ThemeEngineProvider");
  }
  return context;
}

export interface ThemeEngineProviderProps {
  children: ReactNode;
  initialThemeInput?: ThemeInput;
}

export function ThemeEngineProvider({
  children,
  initialThemeInput = defaultThemeInput,
}: ThemeEngineProviderProps) {
  const activeSchoolId = useActiveSchoolStore((s) => s.schoolId) || "default-school";

  const getInitialInput = (): ThemeInput => {
    const cached = readSchoolThemeFromBrowserStorage(activeSchoolId);
    return cached ?? initialThemeInput;
  };

  const [activeThemeInput, setActiveThemeInput] = useState<ThemeInput>(getInitialInput);
  const [previewInput, setPreviewInputState] = useState<ThemeInput>(getInitialInput);

  // Sincronizar quando a escola ativa muda
  useEffect(() => {
    const cached = readSchoolThemeFromBrowserStorage(activeSchoolId);
    const nextInput = cached ?? initialThemeInput;
    setActiveThemeInput(nextInput);
    setPreviewInputState(nextInput);
  }, [activeSchoolId]);

  const isPreviewing = useMemo(() => {
    return JSON.stringify(activeThemeInput) !== JSON.stringify(previewInput);
  }, [activeThemeInput, previewInput]);

  const { resolvedTheme } = useTheme();
  const currentMode = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";

  const themeConfig = useMemo(() => {
    return resolveTheme(previewInput, currentMode);
  }, [previewInput, currentMode]);

  // Actualizar dinamicamente as variáveis CSS na tag <style> e atributos no <html>
  useEffect(() => {
    if (typeof document === "undefined") return;

    let styleTag = document.getElementById("mindschool-theme-vars");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "mindschool-theme-vars";
      document.head.appendChild(styleTag);
    }
    // Se estiver no modo padrão do sistema sem personalizações activas,
    // mantém a folha limpa para que o globals.css padrão de produção tenha precedência 1:1.
    const isStandardDefault =
      previewInput.uiMode === "default" &&
      previewInput.baseColor === "zinc" &&
      previewInput.primary.toUpperCase() === "#9956F6" &&
      previewInput.density === "comfortable" &&
      (!previewInput.radius || previewInput.radius === "0.5rem");

    if (isStandardDefault) {
      styleTag.innerHTML = "";
    } else {
      styleTag.innerHTML = generateThemeCssVariables(previewInput);
    }

    document.documentElement.setAttribute(
      "data-ui-mode",
      previewInput.uiMode || "default"
    );
    document.documentElement.setAttribute(
      "data-density",
      previewInput.density || "comfortable"
    );
  }, [previewInput]);

  const resetPreview = () => {
    setPreviewInputState(activeThemeInput);
  };

  const publishChanges = async () => {
    setActiveThemeInput(previewInput);
    persistSchoolThemeInBrowser(activeSchoolId, previewInput);
    try {
      await patchSettings({ branding: previewInput });
    } catch (err) {
      console.warn("Não foi possível persistir o tema na API:", err);
    }
  };

  return (
    <ThemeEngineContext.Provider
      value={{
        schoolId: activeSchoolId,
        themeInput: activeThemeInput,
        themeConfig,
        previewInput,
        isPreviewing,
        setPreviewInput: setPreviewInputState,
        resetPreview,
        publishChanges,
      }}
    >
      {children}
    </ThemeEngineContext.Provider>
  );
}

/** Provedor Unificado que engloba next-themes e o MindSchool Theme Engine. */
export function AppThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeEngineProvider>{children}</ThemeEngineProvider>
    </NextThemesProvider>
  );
}

