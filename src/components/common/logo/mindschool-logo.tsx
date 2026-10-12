"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MindSchoolLogoProps {
  className?: string;
  width?: number;
  height?: number;
  size?: number;
  priority?: boolean;
}

/**
 * Componente unificado do logótipo MindSchool.
 * Alterna automaticamente entre o modo claro (`/Logo_fundo-claro.svg`) e escuro (`/Logo_fundo-escuro.svg`).
 */
export function MindSchoolLogo({
  className,
  width,
  height,
  size = 40,
  priority = false,
}: MindSchoolLogoProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <span className={cn("relative inline-flex items-center justify-center shrink-0 select-none", className)}>
      {/* Modo Claro */}
      <Image
        src="/Logo_fundo-claro.svg"
        alt="Logótipo do MindSchool"
        width={w}
        height={h}
        className="dark:hidden object-contain"
        priority={priority}
      />
      {/* Modo Escuro */}
      <Image
        src="/Logo_fundo-escuro.svg"
        alt="Logótipo do MindSchool"
        width={w}
        height={h}
        className="hidden dark:block object-contain"
        priority={priority}
      />
    </span>
  );
}
