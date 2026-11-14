"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoginForm } from "./login-form";
import { LoginCharactersScene } from "./login-characters-scene";
import type {
  LoginFocusTarget,
  LoginSceneReaction,
  NormalizedPointer,
} from "./login-characters-types";

/**
 * Ecrã de login a ecrã inteiro (100vw × 100dvh) sem contentores centralizados nem splash de bloqueio.
 * Palco interativo à esquerda com a paleta oficial MindSchool (`--primary`, `--primary-50..300`, `--warning`)
 * e painel do formulário à direita ocupando toda a largura e altura disponíveis.
 */
export function LoginInteractiveShell() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  const [focusTarget, setFocusTarget] = useState<LoginFocusTarget>("idle");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [reaction, setReaction] = useState<LoginSceneReaction>("idle");
  const [typingLength, setTypingLength] = useState(0);
  const [pointer, setPointer] = useState<NormalizedPointer>({ x: 0, y: 0, active: false });

  // Dispara imediatamente a entrada animada das figuras diretamente no palco ao abrir a página
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const handleTypingActivity = useCallback((_field: "email" | "password" | "totp", length: number) => {
    setTypingLength(length);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const handleMove = (e: PointerEvent) => {
      const box = shellRef.current?.getBoundingClientRect();
      if (!box || box.width === 0 || box.height === 0) return;

      const stageCenterX = box.left + box.width * 0.28;
      const stageCenterY = box.top + box.height * 0.62;
      const nx = Math.max(-1, Math.min(1, (e.clientX - stageCenterX) / (box.width * 0.45)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - stageCenterY) / (box.height * 0.45)));
      setPointer({ x: nx, y: ny, active: true });
    };

    const handleLeave = () => {
      setPointer((prev) => (prev.active ? { x: 0, y: 0, active: false } : prev));
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="grid min-h-screen min-h-dvh lg:h-dvh w-full overflow-x-hidden lg:overflow-hidden lg:grid-cols-12 bg-background"
    >
      {/* Lado Esquerdo (ou topo compacto em mobile): fundo neutro --muted do sistema com contraste nítido */}
      <div className="relative lg:col-span-6 xl:col-span-7 flex flex-col justify-between bg-muted/70 dark:bg-card border-b lg:border-b-0 lg:border-r border-border h-56 sm:h-68 lg:h-full px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 lg:pt-12 pb-0 overflow-hidden">
        <div className="relative z-10 flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary shadow-xs">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Ecossistema MindSchool</span>
          </div>

          <h2 className="hidden lg:block text-2xl xl:text-3xl font-semibold tracking-tight text-foreground leading-tight mt-1">
            Gestão escolar inteligente com rigor institucional.
          </h2>
          <p className="hidden lg:block text-sm text-muted-foreground max-w-md">
            Pautas do MED, horários, assiduidade e propinas integrados num único portal para a sua instituição.
          </p>
        </div>

        <div className="flex-1 min-h-0 flex items-end justify-center pt-2 lg:pt-6">
          <LoginCharactersScene
            focusTarget={focusTarget}
            passwordVisible={passwordVisible}
            reaction={reaction}
            typingLength={typingLength}
            pointer={pointer}
            entered={entered}
          />
        </div>
      </div>

      {/* Lado Direito: Formulário ocupando toda a metade direita */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between h-full w-full p-6 sm:p-10 lg:p-14 xl:p-16 bg-background overflow-y-auto">
        <div className="hidden lg:block" />

        <div className="w-full max-w-md mx-auto my-auto">
          <LoginForm
            onFocusTargetChange={setFocusTarget}
            onPasswordVisibilityChange={setPasswordVisible}
            onTypingActivity={handleTypingActivity}
            onReactionChange={setReaction}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-6 w-full max-w-md mx-auto">
          <span>&copy; {new Date().getFullYear()} MINDWARE - Comércio e Serviços.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
