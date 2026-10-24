"use client";

import { type ReactNode, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components";

import { cn } from "@/lib/utils";
import { IconCheckSucessfull } from "./icon-success";
import { IconWarning } from "./icon-warning";
import { useModal } from "@/stores/modal/use-modal-store";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";

export interface ModalProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string | ReactNode;
  description?: string | ReactNode;
  /** Ícone do cabeçalho (ignorado em `sucess` / `warning`). */
  icon?: ReactNode;
  /** Conteúdo à direita do título (ex.: badge de estado). */
  headerExtra?: ReactNode;
  hideHeader?: boolean;
  /** Permite fechar (X, Esc, clique fora). Por omissão `true`. */
  canClose?: boolean;
  /** Mantém o clique fora do modal desactivado (úteis em formulários, para não perder dados). */
  preventOutsideClose?: boolean;
  children?: ReactNode;
  /** Botões do rodapé: ficam fixos no fundo, alinhados à direita, fora da área com scroll. */
  footer?: ReactNode;
  className?: string;
  size?: ModalSize;
  sucess?: boolean;
  warning?: boolean;
}

const MODAL_SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  full: "sm:max-w-[95vw] md:max-w-6xl",
};

/**
 * Modal global: cabeçalho fixo e o rodapé (`footer`) sempre visível no fundo, com os botões alinhados à direita
 * (em ecrãs pequenos ocupam a largura toda). **Nenhum modal pode ter scroll**: o conteúdo tem de caber; em desenvolvimento
 * a consola avisa quando um modal ultrapassa a altura.
 */
export function GlobalModal({
  id,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  title,
  sucess,
  warning,
  description,
  icon,
  headerExtra,
  hideHeader = false,
  canClose = true,
  preventOutsideClose = false,
  children,
  footer,
  className,
  size = "lg",
}: ModalProps) {
  const { open, closeModal } = useModal();

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : id ? open[id] || false : false;

  const handleClose = () => {
    controlledOnClose?.();
    if (id) closeModal(id);
  };

  const hasHeader = !hideHeader && (title || description || icon || headerExtra || sucess || warning);

  // Regra do produto: nenhum modal tem scroll. O `overflow-y-auto` abaixo é só rede de segurança (ecrãs muito baixos);
  // em desenvolvimento avisa na consola qual modal ultrapassa a altura para o compactar (colunas, passos, menos texto).
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !isModalOpen) return;
    let observer: ResizeObserver | undefined;
    const label = typeof title === "string" ? title : (id ?? "sem título");
    const check = () => {
      const el = bodyRef.current;
      if (el && el.scrollHeight > el.clientHeight + 1) {
        console.warn(`[modal] «${label}» tem scroll (${el.scrollHeight}px > ${el.clientHeight}px). Os modais não podem ter scroll: compacte o conteúdo.`);
      }
    };
    const timer = setTimeout(() => {
      check();
      if (bodyRef.current && typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(check);
        observer.observe(bodyRef.current);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [isModalOpen, title, id]);

  return (
    <Dialog open={isModalOpen} onOpenChange={(next) => { if (!next && canClose) handleClose(); }}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-4 sm:p-6",
          "max-h-[90dvh] w-[calc(100%-2rem)]",
          MODAL_SIZE_CLASSES[size],
          className,
        )}
        onInteractOutside={(event) => { if (!canClose || preventOutsideClose) event.preventDefault(); }}
      >
        {canClose && <DialogClose onClick={handleClose} />}

        {hasHeader && (
          <DialogHeader className="relative shrink-0 space-y-1 pb-2">
            <div className="flex items-center justify-between gap-3">
              <div className={cn("flex min-w-0 items-center gap-3", { "w-full flex-col text-center": sucess })}>
                {sucess && <IconCheckSucessfull />}
                {warning && <IconWarning />}
                {icon && !sucess && !warning && (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
                )}
                <div className={cn("min-w-0 space-y-0.5 text-left", { "text-center": sucess })}>
                  {title && <DialogTitle className="break-words p-0 text-lg font-semibold tracking-tight">{title}</DialogTitle>}
                  {description && <DialogDescription className="text-xs text-muted-foreground">{description}</DialogDescription>}
                </div>
              </div>
              {headerExtra && <div className="shrink-0">{headerExtra}</div>}
            </div>
          </DialogHeader>
        )}

        {/* O scroll fica só aqui; o rodapé nunca desaparece para baixo. */}
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto py-3">{children}</div>

        {footer && (
          <DialogFooter className="mt-auto flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 pt-2 [&>button]:w-max">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export * from "./subscription-modal";
export { GlobalModal as Modal };
