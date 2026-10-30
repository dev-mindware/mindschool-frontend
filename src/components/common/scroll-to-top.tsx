"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Repõe no topo todos os contentores com scroll que ficaram a meio (o Next só repõe a janela). */
function resetScroll() {
  window.scrollTo({ top: 0 });
  for (const el of document.querySelectorAll<HTMLElement>("main, [data-slot='sidebar-inset'], [data-slot='sidebar-inset'] *")) {
    if (el.scrollTop > 0) el.scrollTop = 0;
  }
}

/**
 * Ao mudar de página (incluindo os separadores das Definições e o Planos) a vista volta ao topo.
 * O conteúdo vive dentro de um contentor com scroll próprio, que o Next não repõe sozinho (a página abria a meio, com o título cortado).
 * Repete-se depois do primeiro desenho, porque o conteúdo novo pode alterar a altura.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    resetScroll();
    const frame = requestAnimationFrame(resetScroll);
    const timer = window.setTimeout(resetScroll, 150);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [pathname]);
  return null;
}
