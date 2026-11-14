"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { LoginCharactersSceneProps } from "./login-characters-types";

interface SpringVal {
  value: number;
  velocity: number;
}

interface CharacterSim {
  y: SpringVal;
  x: SpringVal;
  rot: SpringVal;
  scaleY: SpringVal;
  opacity: SpringVal;
  lookX: SpringVal;
  lookY: SpringVal;
}

function makeCharSim(initialY: number, initialRot: number, initialOpacity = 0): CharacterSim {
  return {
    y: { value: initialY, velocity: 0 },
    x: { value: 0, velocity: 0 },
    rot: { value: initialRot, velocity: 0 },
    scaleY: { value: 0.94, velocity: 0 },
    opacity: { value: initialOpacity, velocity: 0 },
    lookX: { value: 0, velocity: 0 },
    lookY: { value: 0, velocity: 0 },
  };
}

function stepSpring(
  s: SpringVal,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): boolean {
  const force = (target - s.value) * stiffness;
  s.velocity = (s.velocity + force * dt) * Math.exp(-damping * dt);
  s.value += s.velocity * dt;
  return Math.abs(target - s.value) > 0.015 || Math.abs(s.velocity) > 0.015;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

type ExprMode = "idle" | "curious" | "shy" | "error" | "happy";

/**
 * Cena vetorial 2D com 4 figuras na paleta oficial MindSchool Padrão:
 * Roxo primário (`--primary`), Índigo secundário (`#6366F1`), Lilás (`--primary-200`) e Carvão (`#1A1A1A`).
 * Entra diretamente no palco ao carregar a página sem cortina de introdução,
 * reagindo em tempo real ao cursor, foco nos campos, revelação de senha e erros.
 */
export function LoginCharactersScene({
  focusTarget,
  passwordVisible,
  reaction,
  typingLength = 0,
  pointer,
  entered,
  className,
}: LoginCharactersSceneProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  const stateRef = useRef({
    focusTarget,
    passwordVisible,
    reaction,
    typingLength,
    pointer,
    entered,
    reducedMotion: false,
    enteredAt: 0,
    prevTypingLength: typingLength,
    nodPulse: 0,
  });

  const purpleBodyRef = useRef<SVGGElement>(null);
  const purpleFaceRef = useRef<SVGGElement>(null);
  const purplePupilLRef = useRef<SVGCircleElement>(null);
  const purplePupilRRef = useRef<SVGCircleElement>(null);
  const purpleBlinkRef = useRef<SVGGElement>(null);

  const blackBodyRef = useRef<SVGGElement>(null);
  const blackFaceRef = useRef<SVGGElement>(null);
  const blackPupilLRef = useRef<SVGCircleElement>(null);
  const blackPupilRRef = useRef<SVGCircleElement>(null);
  const blackBlinkRef = useRef<SVGGElement>(null);

  const orangeBodyRef = useRef<SVGGElement>(null);
  const orangeFaceRef = useRef<SVGGElement>(null);
  const orangePupilsRef = useRef<SVGGElement>(null);
  const orangeBlinkRef = useRef<SVGGElement>(null);

  const yellowBodyRef = useRef<SVGGElement>(null);
  const yellowFaceRef = useRef<SVGGElement>(null);
  const yellowPupilsRef = useRef<SVGGElement>(null);
  const yellowBlinkRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(mq.matches);
      stateRef.current.reducedMotion = mq.matches;
    };
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const cur = stateRef.current;
    if (entered && !cur.entered) {
      cur.enteredAt = performance.now();
    }
    if (typingLength !== cur.prevTypingLength) {
      cur.nodPulse = 1;
      cur.prevTypingLength = typingLength;
    }
    cur.focusTarget = focusTarget;
    cur.passwordVisible = passwordVisible;
    cur.reaction = reaction;
    cur.typingLength = typingLength;
    cur.pointer = pointer;
    cur.entered = entered;
  }, [focusTarget, passwordVisible, reaction, typingLength, pointer, entered]);

  useEffect(() => {
    if (reducedMotion) return;

    const blinkEl = (ref: React.RefObject<SVGGElement | null>) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = "scaleY(0.08)";
      window.setTimeout(() => {
        if (ref.current) ref.current.style.transform = "scaleY(1)";
      }, 125);
    };

    const scheduleBlink = (ref: React.RefObject<SVGGElement | null>, baseMs: number, offsetMs: number) => {
      let timer = 0;
      const run = () => {
        blinkEl(ref);
        timer = window.setTimeout(run, baseMs + Math.random() * 2400);
      };
      timer = window.setTimeout(run, offsetMs);
      return () => window.clearTimeout(timer);
    };

    const cleanups = [
      scheduleBlink(purpleBlinkRef, 3800, 2900),
      scheduleBlink(blackBlinkRef, 4200, 3400),
      scheduleBlink(orangeBlinkRef, 3500, 2500),
      scheduleBlink(yellowBlinkRef, 4700, 3900),
    ];

    return () => cleanups.forEach((fn) => fn());
  }, [reducedMotion]);

  useEffect(() => {
    const sims = {
      purple: makeCharSim(250, -6, 0),
      black: makeCharSim(-210, -22, 0),
      orange: makeCharSim(145, 4, 0),
      yellow: makeCharSim(185, 6, 0),
    };

    let rafId = 0;
    let lastTime = performance.now();

    const applyBody = (
      ref: React.RefObject<SVGGElement | null>,
      sim: CharacterSim,
    ) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate3d(${sim.x.value.toFixed(2)}px, ${sim.y.value.toFixed(2)}px, 0) rotate(${sim.rot.value.toFixed(2)}deg) scaleY(${sim.scaleY.value.toFixed(3)})`;
      el.style.opacity = clamp(sim.opacity.value, 0, 1).toFixed(3);
    };

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.04);
      const st = stateRef.current;

      if (st.nodPulse > 0.001) {
        st.nodPulse *= Math.exp(-10 * dt);
      } else {
        st.nodPulse = 0;
      }

      let targetLookX = 0;
      let targetLookY = 0;
      let targetLean = 0;
      let targetOffsetX = 0;
      let errorRecoil = 0;

      if (st.passwordVisible) {
        targetLookX = -1.0;
        targetLookY = -0.1;
        targetLean = -1.0;
        targetOffsetX = -10;
      } else if (st.reaction === "error") {
        targetLookX = 0.25;
        targetLookY = 0.2;
        targetLean = -0.65;
        errorRecoil = 1;
      } else if (st.reaction === "submitting" || st.reaction === "success") {
        targetLookX = 0.82;
        targetLookY = 0.22;
        targetLean = 0.65;
        targetOffsetX = 6;
      } else if (st.focusTarget === "email") {
        const progressShift = Math.min(st.typingLength * 0.015, 0.2);
        targetLookX = 0.78 + progressShift;
        targetLookY = -0.18;
        targetLean = 0.85;
        targetOffsetX = 7;
      } else if (st.focusTarget === "password" || st.focusTarget === "totp") {
        targetLookX = 0.82;
        targetLookY = 0.14;
        targetLean = 0.72;
        targetOffsetX = 5;
      } else if (st.pointer.active) {
        targetLookX = clamp(st.pointer.x, -1, 1);
        targetLookY = clamp(st.pointer.y, -1, 1);
        targetLean = clamp(st.pointer.x * 0.85, -1, 1);
        targetOffsetX = clamp(st.pointer.x * 6, -6, 6);
      }

      const elapsedSinceEnter = st.entered ? now - st.enteredAt : -1;

      if (st.reducedMotion) {
        const op = st.entered ? 1 : 0;
        for (const s of Object.values(sims)) {
          s.x.value = 0;
          s.y.value = 0;
          s.rot.value = 0;
          s.scaleY.value = 1;
          s.opacity.value = op;
          s.lookX.value = st.passwordVisible ? -0.9 : targetLookX * 0.5;
          s.lookY.value = st.passwordVisible ? -0.1 : targetLookY * 0.5;
        }
      } else {
        const blackReady = st.entered && elapsedSinceEnter >= 15;
        const purpleReady = st.entered && elapsedSinceEnter >= 95;
        const orangeReady = st.entered && elapsedSinceEnter >= 165;
        const yellowReady = st.entered && elapsedSinceEnter >= 230;

        const breathe = st.entered ? Math.sin(now * 0.0018) * 1.3 : 0;
        const nod = st.nodPulse * 2.5;

        stepSpring(sims.purple.opacity, purpleReady ? 1 : 0, 145, 18, dt);
        stepSpring(
          sims.purple.y,
          purpleReady ? breathe * 0.8 + (errorRecoil ? 6 : 0) : 250,
          170,
          15,
          dt,
        );
        stepSpring(sims.purple.x, purpleReady ? targetOffsetX * 0.7 : 0, 150, 15, dt);
        stepSpring(
          sims.purple.rot,
          purpleReady ? targetLean * 6.5 - errorRecoil * 4.5 + nod * 0.5 : -6,
          150,
          14,
          dt,
        );
        stepSpring(sims.purple.scaleY, purpleReady ? 1 : 0.94, 160, 16, dt);
        stepSpring(sims.purple.lookX, targetLookX, 220, 19, dt);
        stepSpring(sims.purple.lookY, targetLookY, 220, 19, dt);

        stepSpring(sims.black.opacity, blackReady ? 1 : 0, 150, 18, dt);
        stepSpring(
          sims.black.y,
          blackReady ? breathe * 0.5 + (errorRecoil ? 4 : 0) : -210,
          155,
          14,
          dt,
        );
        stepSpring(sims.black.x, blackReady ? targetOffsetX * 0.9 : 0, 160, 15, dt);
        stepSpring(
          sims.black.rot,
          blackReady ? targetLean * 5.2 - errorRecoil * 3 + nod * 0.4 : -22,
          140,
          13,
          dt,
        );
        stepSpring(sims.black.scaleY, blackReady ? 1 : 0.96, 160, 16, dt);
        stepSpring(sims.black.lookX, targetLookX, 250, 20, dt);
        stepSpring(sims.black.lookY, targetLookY, 250, 20, dt);

        stepSpring(sims.orange.opacity, orangeReady ? 1 : 0, 150, 18, dt);
        stepSpring(
          sims.orange.y,
          orangeReady ? breathe * 0.35 + nod * 0.6 + (errorRecoil ? 4 : 0) : 145,
          195,
          16,
          dt,
        );
        stepSpring(sims.orange.x, orangeReady ? targetOffsetX * 1.05 : 0, 165, 15, dt);
        stepSpring(
          sims.orange.rot,
          orangeReady ? targetLean * 3.8 - errorRecoil * 2.5 : 4,
          175,
          16,
          dt,
        );
        stepSpring(sims.orange.scaleY, orangeReady ? (errorRecoil ? 0.96 : 1) : 0.92, 180, 16, dt);
        stepSpring(sims.orange.lookX, targetLookX, 240, 20, dt);
        stepSpring(sims.orange.lookY, targetLookY, 240, 20, dt);

        stepSpring(sims.yellow.opacity, yellowReady ? 1 : 0, 145, 18, dt);
        stepSpring(
          sims.yellow.y,
          yellowReady ? -breathe * 0.45 + nod * 0.4 + (errorRecoil ? 5 : 0) : 185,
          185,
          15,
          dt,
        );
        stepSpring(sims.yellow.x, yellowReady ? targetOffsetX * 0.95 : 0, 160, 15, dt);
        stepSpring(
          sims.yellow.rot,
          yellowReady ? targetLean * 5.6 - errorRecoil * 3.5 : 6,
          165,
          15,
          dt,
        );
        stepSpring(sims.yellow.scaleY, yellowReady ? 1 : 0.93, 170, 16, dt);
        stepSpring(sims.yellow.lookX, targetLookX, 230, 19, dt);
        stepSpring(sims.yellow.lookY, targetLookY, 230, 19, dt);
      }

      applyBody(purpleBodyRef, sims.purple);
      applyBody(blackBodyRef, sims.black);
      applyBody(orangeBodyRef, sims.orange);
      applyBody(yellowBodyRef, sims.yellow);

      if (purpleFaceRef.current) {
        purpleFaceRef.current.style.transform = `translate3d(${(sims.purple.lookX.value * 9).toFixed(2)}px, ${(sims.purple.lookY.value * 4.5).toFixed(2)}px, 0)`;
      }
      if (purplePupilLRef.current && purplePupilRRef.current) {
        const px = (sims.purple.lookX.value * 4.2).toFixed(2);
        const py = (sims.purple.lookY.value * 4.2).toFixed(2);
        const tf = `translate3d(${px}px, ${py}px, 0)`;
        purplePupilLRef.current.style.transform = tf;
        purplePupilRRef.current.style.transform = tf;
      }

      if (blackFaceRef.current) {
        blackFaceRef.current.style.transform = `translate3d(${(sims.black.lookX.value * 7.5).toFixed(2)}px, ${(sims.black.lookY.value * 4).toFixed(2)}px, 0)`;
      }
      if (blackPupilLRef.current && blackPupilRRef.current) {
        const px = (sims.black.lookX.value * 4.8).toFixed(2);
        const py = (sims.black.lookY.value * 4.8).toFixed(2);
        const tf = `translate3d(${px}px, ${py}px, 0)`;
        blackPupilLRef.current.style.transform = tf;
        blackPupilRRef.current.style.transform = tf;
      }

      if (orangeFaceRef.current) {
        orangeFaceRef.current.style.transform = `translate3d(${(sims.orange.lookX.value * 11).toFixed(2)}px, ${(sims.orange.lookY.value * 5).toFixed(2)}px, 0)`;
      }
      if (orangePupilsRef.current) {
        orangePupilsRef.current.style.transform = `translate3d(${(sims.orange.lookX.value * 4).toFixed(2)}px, ${(sims.orange.lookY.value * 3.5).toFixed(2)}px, 0)`;
      }

      if (yellowFaceRef.current) {
        yellowFaceRef.current.style.transform = `translate3d(${(sims.yellow.lookX.value * 12).toFixed(2)}px, ${(sims.yellow.lookY.value * 4.5).toFixed(2)}px, 0)`;
      }
      if (yellowPupilsRef.current) {
        yellowPupilsRef.current.style.transform = `translate3d(${(sims.yellow.lookX.value * 4.5).toFixed(2)}px, ${(sims.yellow.lookY.value * 3.5).toFixed(2)}px, 0)`;
      }

      if (typeof document === "undefined" || !document.hidden) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastTime = performance.now();
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const expr: ExprMode = passwordVisible
    ? "shy"
    : reaction === "error"
      ? "error"
      : reaction === "success"
        ? "happy"
        : focusTarget === "email" || focusTarget === "password" || focusTarget === "totp"
          ? "curious"
          : "idle";

  const inkStroke = "#1A1A1A";
  const indigoInk = "#FFFFFF";

  return (
    <div
      data-testid="login-characters-scene"
      data-scene-state={expr}
      data-focus-target={focusTarget}
      data-password-visible={passwordVisible ? "true" : "false"}
      data-reaction={reaction}
      data-entered={entered ? "true" : "false"}
      className={cn(
        "relative flex w-full h-full items-end justify-center select-none overflow-hidden",
        className,
      )}
    >
      <svg
        viewBox="68 90 360 314"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        className="w-full h-full max-w-[660px] overflow-visible"
      >
        {/* Sombra suave ligada ao chão */}
        <ellipse
          cx="248"
          cy="399"
          rx="184"
          ry="10"
          style={{ fill: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
        />

        {/* 1. FIGURA ROXA PRINCIPAL (`--primary` oficial do sistema: #9956F6) */}
        <g
          ref={purpleBodyRef}
          style={{ transformOrigin: "224px 396px" }}
        >
          <rect
            x="156"
            y="102"
            width="136"
            height="294"
            rx="14"
            style={{ fill: "var(--primary)" }}
          />
          <g ref={purpleFaceRef}>
            <g
              ref={purpleBlinkRef}
              style={{
                transformOrigin: "224px 160px",
                transition: "transform 95ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <circle cx="203" cy="160" r="10.5" fill="#FFFFFF" />
              <circle
                ref={purplePupilLRef}
                cx="203"
                cy="160"
                r="5"
                fill={inkStroke}
              />
              <circle cx="243" cy="160" r="10.5" fill="#FFFFFF" />
              <circle
                ref={purplePupilRRef}
                cx="243"
                cy="160"
                r="5"
                fill={inkStroke}
              />
            </g>

            {expr === "error" && (
              <g stroke={inkStroke} strokeWidth="3.4" strokeLinecap="round">
                <line x1="193" y1="143" x2="212" y2="149" />
                <line x1="253" y1="143" x2="234" y2="149" />
              </g>
            )}

            {expr === "error" ? (
              <path
                d="M 210 198 Q 223 185 236 198"
                fill="none"
                stroke={inkStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
            ) : expr === "shy" ? (
              <path
                d="M 213 194 Q 221 190 229 194"
                fill="none"
                stroke={inkStroke}
                strokeWidth="3.6"
                strokeLinecap="round"
              />
            ) : expr === "curious" ? (
              <ellipse cx="223" cy="193" rx="4.8" ry="5.8" fill={inkStroke} />
            ) : expr === "happy" ? (
              <path
                d="M 209 188 Q 223 205 237 188 Z"
                fill={inkStroke}
              />
            ) : (
              <path
                d="M 212 190 Q 223 199 234 190"
                fill="none"
                stroke={inkStroke}
                strokeWidth="3.8"
                strokeLinecap="round"
              />
            )}
          </g>
        </g>

        {/* 2. FIGURA CARVÃO ESGUIA (`#1A1A1A` oficial do logótipo e --foreground) */}
        <g
          ref={blackBodyRef}
          style={{ transformOrigin: "300px 396px" }}
        >
          <rect
            x="254"
            y="176"
            width="92"
            height="220"
            rx="12"
            fill="#1A1A1A"
            style={{
              stroke: "color-mix(in oklab, var(--border) 60%, transparent)",
            }}
            strokeWidth="1.2"
          />
          <g ref={blackFaceRef}>
            <g
              ref={blackBlinkRef}
              style={{
                transformOrigin: "300px 224px",
                transition: "transform 95ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <circle cx="282" cy="224" r="11.5" fill="#FFFFFF" />
              <circle
                ref={blackPupilLRef}
                cx="282"
                cy="224"
                r="5.6"
                fill={inkStroke}
              />
              <circle cx="316" cy="224" r="11.5" fill="#FFFFFF" />
              <circle
                ref={blackPupilRRef}
                cx="316"
                cy="224"
                r="5.6"
                fill={inkStroke}
              />
            </g>

            {expr === "error" && (
              <g fill="#1A1A1A">
                <path d="M 270 210 L 295 218 L 295 208 Z" />
                <path d="M 328 210 L 303 218 L 303 208 Z" />
              </g>
            )}
          </g>
        </g>

        {/* 3. FIGURA ÍNDIGO CÚPULA (`#6366F1` — cor secundária oficial MindSchool Padrão) */}
        <g
          ref={orangeBodyRef}
          style={{ transformOrigin: "176px 396px" }}
        >
          <path
            d="M 76 396 A 100 112 0 0 1 276 396 Z"
            fill="#6366F1"
          />
          <g ref={orangeFaceRef}>
            <g
              ref={orangeBlinkRef}
              style={{
                transformOrigin: "176px 344px",
                transition: "transform 95ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <g ref={orangePupilsRef}>
                <circle cx="156" cy="344" r="5.8" fill={indigoInk} />
                <circle cx="196" cy="344" r="5.8" fill={indigoInk} />
              </g>
            </g>

            {expr === "error" ? (
              <path
                d="M 162 375 Q 176 359 190 375"
                fill="none"
                stroke={indigoInk}
                strokeWidth="4.4"
                strokeLinecap="round"
              />
            ) : expr === "shy" ? (
              <path
                d="M 166 369 Q 176 365 186 369"
                fill="none"
                stroke={indigoInk}
                strokeWidth="4"
                strokeLinecap="round"
              />
            ) : expr === "curious" ? (
              <ellipse cx="176" cy="368" rx="5.8" ry="6.8" fill={indigoInk} />
            ) : expr === "happy" ? (
              <path
                d="M 160 361 Q 176 384 192 361 Z"
                fill={indigoInk}
              />
            ) : (
              <path
                d="M 162 364 Q 176 380 190 364"
                fill="none"
                stroke={indigoInk}
                strokeWidth="4.4"
                strokeLinecap="round"
              />
            )}
          </g>
        </g>

        {/* 4. FIGURA LILÁS CLARA PÍLULA (`--primary-200` oficial do sistema) */}
        <g
          ref={yellowBodyRef}
          style={{ transformOrigin: "366px 396px" }}
        >
          <path
            d="M 318 396 L 318 278 A 48 48 0 0 1 414 278 L 414 396 Z"
            style={{
              fill: "var(--primary-200)",
              stroke: "color-mix(in oklab, var(--primary-300) 45%, transparent)",
            }}
            strokeWidth="1.2"
          />
          <g ref={yellowFaceRef}>
            <g
              ref={yellowBlinkRef}
              style={{
                transformOrigin: "366px 282px",
                transition: "transform 95ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              <g ref={yellowPupilsRef}>
                <circle cx="352" cy="282" r="5" fill={inkStroke} />
                <circle cx="380" cy="282" r="5" fill={inkStroke} />
              </g>
            </g>

            {expr === "error" ? (
              <path
                d="M 348 313 Q 366 300 384 313"
                fill="none"
                stroke={inkStroke}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            ) : expr === "shy" ? (
              <line
                x1="345"
                y1="309"
                x2="375"
                y2="309"
                stroke={inkStroke}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            ) : expr === "curious" ? (
              <line
                x1="355"
                y1="308"
                x2="389"
                y2="308"
                stroke={inkStroke}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            ) : expr === "happy" ? (
              <path
                d="M 348 304 Q 366 320 384 304"
                fill="none"
                stroke={inkStroke}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            ) : (
              <line
                x1="348"
                y1="309"
                x2="386"
                y2="309"
                stroke={inkStroke}
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
}
