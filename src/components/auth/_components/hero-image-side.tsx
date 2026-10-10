"use client";

import React, { useEffect, useRef, useState, useId } from "react";

interface HeroImageSideProps {
  source?: string;
  title?: string;
  subtitle?: string;
  hoverTitle?: string;
  hoverSubtitle?: string;
  className?: string;
}

// Resolução do sistema de coordenadas normalizado do SVG
const N = 1000;
const R = 44; // Canto normal suavemente arredondado
const W = 160; // Largura do contorno recortado
const H = 160; // Altura do contorno recortado

/**
 * Calcula os pontos de controlo para os 4 cantos da forma.
 * Todas as tangentes nos pontos de inflexão são alinhadas a 45 graus em ambos os estados,
 * garantindo uma transição C1 contínua, pura e fluida a 60fps sem oscilações ou distorções.
 *
 * Estado Normal (!isHovered):
 * - Top-Left (C0): Contornado
 * - Top-Right (C1): Normal
 * - Bottom-Right (C2): Contornado
 * - Bottom-Left (C3): Normal
 *
 * Estado Hover (isHovered):
 * - Top-Left (C0): Normal
 * - Top-Right (C1): Contornado
 * - Bottom-Right (C2): Normal
 * - Bottom-Left (C3): Contornado
 */
function getCornerPoints(isHovered: boolean) {
  const c0Contoured = !isHovered;
  const c1Contoured = isHovered;
  const c2Contoured = !isHovered;
  const c3Contoured = isHovered;

  // C0: Canto Superior-Esquerdo (esquerda -> topo)
  const c0_w = c0Contoured ? W : R;
  const c0_h = c0Contoured ? H : R;
  const c0_start = [0, c0_h];
  const c0_c1 = [0, c0Contoured ? H * 0.6 : R * 0.55];
  const c0_m = c0Contoured ? [W * 0.32, H * 0.68] : [R * 0.293, R * 0.293];
  const c0_delta = c0Contoured ? W * 0.15 : R * 0.15;
  const c0_c2 = [c0_m[0] - c0_delta, c0_m[1] + c0_delta];
  const c0_c3 = [c0_m[0] + c0_delta, c0_m[1] - c0_delta];
  const c0_c4 = [c0Contoured ? W * 0.6 : R * 0.55, 0];
  const c0_end = [c0_w, 0];

  // C1: Canto Superior-Direito (topo -> direita)
  const c1_w = c1Contoured ? W : R;
  const c1_h = c1Contoured ? H : R;
  const c1_start = [N - c1_w, 0];
  const c1_c1 = [N - (c1Contoured ? W * 0.6 : R * 0.55), 0];
  const c1_m = c1Contoured ? [N - W * 0.32, H * 0.68] : [N - R * 0.293, R * 0.293];
  const c1_delta = c1Contoured ? W * 0.15 : R * 0.15;
  const c1_c2 = [c1_m[0] - c1_delta, c1_m[1] - c1_delta];
  const c1_c3 = [c1_m[0] + c1_delta, c1_m[1] + c1_delta];
  const c1_c4 = [N, c1Contoured ? H * 0.6 : R * 0.55];
  const c1_end = [N, c1_h];

  // C2: Canto Inferior-Direito (direita -> base)
  const c2_w = c2Contoured ? W : R;
  const c2_h = c2Contoured ? H : R;
  const c2_start = [N, N - c2_h];
  const c2_c1 = [N, N - (c2Contoured ? H * 0.6 : R * 0.55)];
  const c2_m = c2Contoured ? [N - W * 0.32, N - H * 0.68] : [N - R * 0.293, N - R * 0.293];
  const c2_delta = c2Contoured ? W * 0.15 : R * 0.15;
  const c2_c2 = [c2_m[0] + c2_delta, c2_m[1] - c2_delta];
  const c2_c3 = [c2_m[0] - c2_delta, c2_m[1] + c2_delta];
  const c2_c4 = [N - (c2Contoured ? W * 0.6 : R * 0.55), N];
  const c2_end = [N - c2_w, N];

  // C3: Canto Inferior-Esquerdo (base -> esquerda)
  const c3_w = c3Contoured ? W : R;
  const c3_h = c3Contoured ? H : R;
  const c3_start = [c3_w, N];
  const c3_c1 = [c3Contoured ? W * 0.6 : R * 0.55, N];
  const c3_m = c3Contoured ? [W * 0.32, N - H * 0.68] : [R * 0.293, N - R * 0.293];
  const c3_delta = c3Contoured ? W * 0.15 : R * 0.15;
  const c3_c2 = [c3_m[0] + c3_delta, c3_m[1] + c3_delta];
  const c3_c3 = [c3_m[0] - c3_delta, c3_m[1] - c3_delta];
  const c3_c4 = [0, N - (c3Contoured ? H * 0.6 : R * 0.55)];
  const c3_end = [0, N - c3_h];

  return [
    { type: "M", p: c0_start },
    { type: "C", cp1: c0_c1, cp2: c0_c2, p: c0_m },
    { type: "C", cp1: c0_c3, cp2: c0_c4, p: c0_end },
    { type: "L", p: c1_start },
    { type: "C", cp1: c1_c1, cp2: c1_c2, p: c1_m },
    { type: "C", cp1: c1_c3, cp2: c1_c4, p: c1_end },
    { type: "L", p: c2_start },
    { type: "C", cp1: c2_c1, cp2: c2_c2, p: c2_m },
    { type: "C", cp1: c2_c3, cp2: c2_c4, p: c2_end },
    { type: "L", p: c3_start },
    { type: "C", cp1: c3_c1, cp2: c3_c2, p: c3_m },
    { type: "C", cp1: c3_c3, cp2: c3_c4, p: c3_end },
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
  hoverTitle = "Conformidade Oficial & MED",
  hoverSubtitle = "Geração imediata de mapas de aproveitamento, minipautas seguras e gestão integrada para o futuro da sua escola.",
  className = "",
}: HeroImageSideProps) {
  const uniqueId = useId().replace(/:/g, "");
  const clipId = `hero-clip-${uniqueId}`;
  const gradId = `hero-grad-${uniqueId}`;

  const pathRef = useRef<SVGPathElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const animRef = useRef<number | null>(null);
  const currentTRef = useRef<number>(0);
  const targetTRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValRef = useRef<number>(0);
  const duration = 600; // ms da animação de troca de forma

  useEffect(() => {
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
      className={`relative flex h-full w-full select-none cursor-pointer overflow-hidden ${className}`}
      onMouseEnter={() => triggerMorph(true)}
      onMouseLeave={() => triggerMorph(false)}
      role="region"
      aria-label="Apresentação visual interativa da MindSchool"
    >
      {/* Container SVG recortado estritamente pela máscara dos cantos */}
      <div className="relative h-full w-full overflow-hidden">
        <svg
          viewBox="0 0 1000 1000"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id={clipId}>
              <path ref={pathRef} d={buildSvgPath(0)} />
            </clipPath>
            {/* Gradiente escuro limpo apenas para legibilidade perfeita do texto sobre a imagem */}
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
              <stop offset="35%" stopColor="#000000" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Imagem nítida e estática sem zoom ou artefactos visuais */}
          <image
            href={source}
            width="1000"
            height="1000"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />

          {/* Sombra de contraste para o texto */}
          <rect
            width="1000"
            height="1000"
            fill={`url(#${gradId})`}
            clipPath={`url(#${clipId})`}
            className="pointer-events-none"
          />
        </svg>

        {/* Textos sobrepostos com alternância pura e suave no hover */}
        <div className="pointer-events-none absolute inset-x-0 top-0 p-8 sm:p-10 md:p-12 text-white">
          <div className="ml-auto max-w-sm sm:max-w-md text-right">
            {/* Bloco de Título */}
            <div className="relative min-h-[56px] w-full">
              <h2
                className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-snug drop-shadow-md text-white transition-all duration-500 ease-out ${
                  isHovered
                    ? "opacity-0 -translate-y-2 pointer-events-none absolute top-0 right-0"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {title}
              </h2>
              <h2
                className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-snug drop-shadow-md text-white transition-all duration-500 ease-out ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none absolute top-0 right-0"
                }`}
              >
                {hoverTitle}
              </h2>
            </div>

            {/* Bloco de Subtítulo */}
            <div className="relative mt-2 min-h-[48px] w-full">
              <p
                className={`text-xs sm:text-sm font-normal leading-relaxed text-white/90 drop-shadow transition-all duration-500 ease-out ${
                  isHovered
                    ? "opacity-0 -translate-y-2 pointer-events-none absolute top-0 right-0"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {subtitle}
              </p>
              <p
                className={`text-xs sm:text-sm font-normal leading-relaxed text-white/90 drop-shadow transition-all duration-500 ease-out ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2 pointer-events-none absolute top-0 right-0"
                }`}
              >
                {hoverSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
