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
 * Mantém proporção estrita 1:1 (aspect-square) para evitar distorções sob flexbox e CSS global.
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
    <span
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 aspect-square select-none overflow-hidden",
        className
      )}
      style={{
        width: `${w}px`,
        height: `${h}px`,
        minWidth: `${w}px`,
        minHeight: `${h}px`,
        maxWidth: `${w}px`,
        maxHeight: `${h}px`,
        aspectRatio: "1 / 1",
      }}
    >
      {/* Modo Claro */}
      <Image
        src="/Logo_fundo-claro.svg"
        alt="Logótipo do MindSchool"
        width={w}
        height={h}
        className="dark:hidden object-contain w-full h-full aspect-square pointer-events-none"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        priority={priority}
      />
      {/* Modo Escuro */}
      <Image
        src="/Logo_fundo-escuro.svg"
        alt="Logótipo do MindSchool"
        width={w}
        height={h}
        className="hidden dark:block object-contain w-full h-full aspect-square pointer-events-none"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        priority={priority}
      />
    </span>
  );
}
