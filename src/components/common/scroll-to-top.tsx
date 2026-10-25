"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ao mudar de página (incluindo os separadores das Definições e o Planos) a vista volta ao topo.
 * O conteúdo vive dentro de um contentor com scroll próprio, que o Next não repõe sozinho (a página abria a meio).
 */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    for (const el of document.querySelectorAll<HTMLElement>("main, [data-slot='sidebar-inset']")) el.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}
