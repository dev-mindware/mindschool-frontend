"use client";

import { useState } from "react";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { MindSchoolLogo } from "./mindschool-logo";

/** URL absoluto do logotipo público da escola (o caminho vem da API já com a versão, por isso pode ficar em cache). */
export function schoolLogoUrl(path?: string | null): string | null {
  if (!path) return null;
  return `${(api.defaults.baseURL ?? "").replace(/\/$/, "")}${path}`;
}

interface SchoolLogoProps {
  path?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

/**
 * Logotipo da escola activa. A API só aceita logotipos quadrados e normaliza-os para PNG 512×512, por isso a imagem ocupa
 * sempre um quadrado (`object-contain` como salvaguarda). Sem logotipo, ou se falhar a carregar, mostra o da MindSchool.
 */
export function SchoolLogo({ path, name, size = 24, className }: SchoolLogoProps) {
  const url = schoolLogoUrl(path);
  const [failed, setFailed] = useState<string | null>(null);
  if (!url || failed === url) return <MindSchoolLogo size={size} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- origem da API configurável por ambiente; o ficheiro já vem optimizado (PNG 512 px)
    <img
      src={url}
      alt={name ? `Logótipo de ${name}` : "Logótipo da escola"}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("aspect-square shrink-0 object-contain", className)}
      onError={() => setFailed(url)}
    />
  );
}
