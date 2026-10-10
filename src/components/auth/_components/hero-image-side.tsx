"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import Image from "next/image";
import { Sparkles, ArrowRightLeft } from "lucide-react";

interface HeroImageSideProps {
  source?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  hoverTitle?: string;
  hoverSubtitle?: string;
  hoverBadge?: string;
  className?: string;
}

// Resolução do sistema de coordenadas do SVG
const N = 1000;
const R = 54; // Canto normal arredondado
const W = 180; // Largura do contorno/notch recortado
const H = 170; // Altura do contorno/notch recortado

/**
 * Gera os pontos de controlo para os 4 cantos da forma.
 * No estado normal (isHovered = false):
 * - Canto Superior-Esquerdo (C0): Contornado (notch recortado)
 * - Canto Superior-Direito (C1): Normal (arredondado suave)
 * - Canto Inferior-Direito (C2): Contornado (notch recortado)
 * - Canto Inferior-Esquerdo (C3): Normal (arredondado suave)
 *
 * No estado hover (isHovered = true):
 * - Os cantos contornados ficam normais e os normais ficam contornados!
 */
function getCornerPoints(isHovered: boolean) {
  const c0Contoured = !isHovered;
  const c1Contoured = isHovered;
  const c2Contoured = !isHovered;
  const c3Contoured = isHovered;

  // C0: Canto Superior-Esquerdo (esquerda -> topo)
  const c0_start = c0Contoured ? [0, H] : [0, R];
  const c0_m = c0Contoured ? [W * 0.40, H * 0.58] : [R * 0.293, R * 0.293];
  const c0_cp1 = c0Contoured ? [0, H * 0.72] : [0, R * 0.58];
  const c0_cp2 = c0Contoured ? [W * 0.16, H * 0.58] : [R * 0.12, R * 0.38];
  const c0_cp3 = c0Contoured ? [W * 0.62, H * 0.58] : [R * 0.38, R * 0.12];
  const c0_cp4 = c0Contoured ? [W * 0.76, 0] : [R * 0.58, 0];
  const c0_end = c0Contoured ? [W, 0] : [R, 0];

  // C1: Canto Superior-Direito (topo -> direita)
  const c1_start = c1Contoured ? [N - W, 0] : [N - R, 0];
  const c1_m = c1Contoured ? [N - W * 0.40, H * 0.58] : [N - R * 0.293, R * 0.293];
  const c1_cp1 = c1Contoured ? [N - W * 0.76, 0] : [N - R * 0.58, 0];
  const c1_cp2 = c1Contoured ? [N - W * 0.62, H * 0.58] : [N - R * 0.38, R * 0.12];
  const c1_cp3 = c1Contoured ? [N - W * 0.16, H * 0.58] : [N - R * 0.12, R * 0.38];
  const c1_cp4 = c1Contoured ? [N, H * 0.72] : [N, R * 0.58];
  const c1_end = c1Contoured ? [N, H] : [N, R];

  // C2: Canto Inferior-Direito (direita -> base)
  const c2_start = c2Contoured ? [N, N - H] : [N, N - R];
  const c2_m = c2Contoured ? [N - W * 0.40, N - H * 0.58] : [N - R * 0.293, N - R * 0.293];
  const c2_cp1 = c2Contoured ? [N, N - H * 0.72] : [N, N - R * 0.58];
  const c2_cp2 = c2Contoured ? [N - W * 0.16, N - H * 0.58] : [N - R * 0.12, N - R * 0.38];
  const c2_cp3 = c2Contoured ? [N - W * 0.62, N - H * 0.58] : [N - R * 0.38, N - R * 0.12];
  const c2_cp4 = c2Contoured ? [N - W * 0.76, N] : [N - R * 0.58, N];
  const c2_end = c2Contoured ? [N - W, N] : [N - R, N];

  // C3: Canto Inferior-Esquerdo (base -> esquerda)
  const c3_start = c3Contoured ? [W, N] : [R, N];
  const c3_m = c3Contoured ? [W * 0.40, N - H * 0.58] : [R * 0.293, N - R * 0.293];
  const c3_cp1 = c3Contoured ? [W * 0.76, N] : [R * 0.58, N];
  const c3_cp2 = c3Contoured ? [W * 0.62, N - H * 0.58] : [R * 0.38, N - R * 0.12];
  const c3_cp3 = c3Contoured ? [W * 0.16, N - H * 0.58] : [R * 0.12, N - R * 0.38];
  const c3_cp4 = c3Contoured ? [0, N - H * 0.72] : [0, N - R * 0.58];
  const c3_end = c3Contoured ? [0, N - H] : [0, N - R];

  return [
    { type: "M", p: c0_start },
    { type: "C", cp1: c0_cp1, cp2: c0_cp2, p: c0_m },
    { type: "C", cp1: c0_cp3, cp2: c0_cp4, p: c0_end },
    { type: "L", p: c1_start },
    { type: "C", cp1: c1_cp1, cp2: c1_cp2, p: c1_m },
    { type: "C", cp1: c1_cp3, cp2: c1_cp4, p: c1_end },
    { type: "L", p: c2_start },
    { type: "C", cp1: c2_cp1, cp2: c2_cp2, p: c2_m },
    { type: "C", cp1: c2_cp3, cp2: c2_cp4, p: c2_end },
    { type: "L", p: c3_start },
    { type: "C", cp1: c3_cp1, cp2: c3_cp2, p: c3_m },
    { type: "C", cp1: c3_cp3, cp2: c3_cp4, p: c3_end },
    { type: "Z" },
  ];
}

const ptsA = getCornerPoints(false);
const ptsB = getCornerPoints(true);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPt(p1: number[], p2: number[], t: number) {
  return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t)];
}

function buildSvgPath(t: number): string {
  return ptsA
    .map((cmdA: any, idx: number) => {
      const cmdB: any = ptsB[idx];
      if (cmdA.type === "M" || cmdA.type === "L") {
        const p = lerpPt(cmdA.p, cmdB.p, t);
        return `${cmdA.type} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      }
      if (cmdA.type === "C") {
        const cp1 = lerpPt(cmdA.cp1, cmdB.cp1, t);
        const cp2 = lerpPt(cmdA.cp2, cmdB.cp2, t);
        const p = lerpPt(cmdA.p, cmdB.p, t);
        return `C ${cp1[0].toFixed(1)} ${cp1[1].toFixed(1)} ${cp2[0].toFixed(1)} ${cp2[1].toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      }
      return "Z";
    })
    .join(" ");
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function HeroImageSide({
  source = "/auth/auth_school_hero.jpg",
  title = "Inovação e Rigor no Ensino",
  subtitle = "Pautas oficiais do MED, propinas, matrículas e acompanhamento pedagógico num único ecossistema inteligente.",
  badge = "MindSchool • Educação & Ensino",
  hoverTitle = "Conformidade Oficial & MED",
  hoverSubtitle = "Geração imediata de mapas de aproveitamento, minipautas seguras e gestão integrada para o futuro da sua escola.",
  hoverBadge = "Ministério da Educação (MED) • Angola",
  className = "",
}: HeroImageSideProps) {
  const uniqueId = useId().replace(/:/g, "");
  const clipId = `hero-clip-${uniqueId}`;
  const gradId = `hero-grad-${uniqueId}`;

  const pathRef = useRef<SVGPathElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Animação contínua e suave via requestAnimationFrame a 60fps
  const animRef = useRef<number | null>(null);
  const currentTRef = useRef<number>(0);
  const targetTRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef<number>(0);
  const duration = 650; // ms de transição

  useEffect(() => {
    // Inicializa o path com a posição padrão (repouso)
    if (pathRef.current) {
      pathRef.current.setAttribute("d", buildSvgPath(0));
    }
  }, []);

  const triggerMorph = (hover: boolean) => {
    setIsHovered(hover);
    targetTRef.current = hover ? 1 : 0;
    startValRef.current = currentTRef.current;
    startTimeRef.current = null;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      currentTRef.current = lerp(startValRef.current, targetTRef.current, eased);

      if (pathRef.current) {
        pathRef.current.setAttribute("d", buildSvgPath(currentTRef.current));
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        currentTRef.current = targetTRef.current;
        if (pathRef.current) {
          pathRef.current.setAttribute("d", buildSvgPath(targetTRef.current));
        }
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
  };

  return (
    <div
      className={`relative flex h-full min-h-[580px] w-full flex-col justify-between overflow-hidden p-3 select-none ${className}`}
      onMouseEnter={() => triggerMorph(true)}
      onMouseLeave={() => triggerMorph(false)}
      role="region"
      aria-label="Apresentação visual da MindSchool"
    >
      {/* Container SVG recortado com o Morphing dos cantos contornados */}
      <div className="relative h-full w-full min-h-[560px] overflow-hidden drop-shadow-xl transition-all duration-500 ease-out">
        <svg
          viewBox="0 0 1000 1000"
          className="h-full w-full object-cover"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id={clipId}>
              <path ref={pathRef} d={buildSvgPath(0)} />
            </clipPath>
            {/* Gradiente sofisticado para assegurar legibilidade impecável dos textos */}
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#090d16" stopOpacity="0.80" />
              <stop offset="38%" stopColor="#090d16" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#090d16" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#090d16" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Imagem contextual recortada pela máscara morphing */}
          <image
            href={source}
            width="1000"
            height="1000"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
            style={{
              transformOrigin: "center center",
              transform: isHovered ? "scale(1.04)" : "scale(1.0)",
              transition: "transform 800ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
          />

          {/* Camada de contraste / sombra elegante */}
          <rect
            width="1000"
            height="1000"
            fill={`url(#${gradId})`}
            clipPath={`url(#${clipId})`}
            className="pointer-events-none"
          />
        </svg>

        {/* Textos sobrepostos com alternância dinâmica no hover */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-7 sm:p-9 md:p-11 text-white">
          {/* Topo: Texto alinhado à direita conforme o layout da imagem em anexo */}
          <div className="flex flex-col items-end text-right ml-auto max-w-sm sm:max-w-md">
            {/* Badge de cabeçalho com transição */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md border border-white/20 transition-all duration-300">
              <Sparkles className="size-3 text-primary-300 animate-pulse" />
              <span>{isHovered ? hoverBadge : badge}</span>
            </div>

            {/* Alternância do Título */}
            <div className="relative min-h-[64px] w-full overflow-hidden">
              <div
                className={`transition-all duration-500 ease-out transform ${
                  isHovered
                    ? "-translate-y-4 opacity-0 pointer-events-none absolute"
                    : "translate-y-0 opacity-100"
                }`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-md text-white">
                  {title}
                </h2>
              </div>
              <div
                className={`transition-all duration-500 ease-out transform ${
                  isHovered
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0 pointer-events-none absolute"
                }`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug drop-shadow-md text-primary-200">
                  {hoverTitle}
                </h2>
              </div>
            </div>

            {/* Alternância do Subtítulo */}
            <div className="relative mt-2 min-h-[50px] w-full overflow-hidden">
              <p
                className={`text-xs sm:text-sm font-medium leading-relaxed text-white/90 drop-shadow transition-all duration-500 ${
                  isHovered
                    ? "-translate-y-3 opacity-0 pointer-events-none absolute"
                    : "translate-y-0 opacity-100"
                }`}
              >
                {subtitle}
              </p>
              <p
                className={`text-xs sm:text-sm font-medium leading-relaxed text-white/95 drop-shadow transition-all duration-500 ${
                  isHovered
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0 pointer-events-none absolute"
                }`}
              >
                {hoverSubtitle}
              </p>
            </div>
          </div>

          {/* Rodapé: Marca e micro-indicador tátil de alternância */}
          <div className="flex items-end justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative size-9 rounded-xl overflow-hidden bg-white/20 p-1 backdrop-blur-md border border-white/20 shadow-inner">
                <Image
                  src="/mindgest.png"
                  alt="MindSchool"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-wide uppercase text-white/95">
                  MindSchool OS
                </span>
                <span className="text-[11px] text-white/70">
                  Ensino &amp; Gestão Pedagógica
                </span>
              </div>
            </div>

            {/* Chip interativo com indicação de hover */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md border border-white/10 transition-colors hover:bg-black/60">
              <ArrowRightLeft
                className={`size-3 transition-transform duration-500 ${
                  isHovered ? "rotate-180 text-primary-300" : "text-white/60"
                }`}
              />
              <span>
                {isHovered ? "Perspetiva MED Ativa" : "Passe o cursor para alternar"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
