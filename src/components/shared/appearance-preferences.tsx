"use client";

import { useEffect } from "react";
import { applyFont, readFont } from "@/lib/appearance";

/** Aplica as preferências guardadas (tipo de letra e cor) ao arrancar, em qualquer página (não só em Definições). */
export function AppearancePreferences() {
  useEffect(() => {
    applyFont(readFont());
    try {
      const color = localStorage.getItem("primary-color");
      if (color) document.documentElement.style.setProperty("--primary", color);
    } catch { /* sem armazenamento: ficam os valores por omissão */ }
  }, []);
  return null;
}
