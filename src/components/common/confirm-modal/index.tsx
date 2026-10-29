"use client";

import { Button } from "@/components/ui";
import { Icon } from "@/components/common/icon";
import { GlobalModal } from "@/components/modal";
import { useModal } from "@/stores/modal/use-modal-store";

interface ConfirmModalProps {
  id: string;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  /** O que a ação provoca (uma linha por efeito): mostra-se antes de confirmar. */
  effects?: string[];
  /** Ação que não se desfaz (ou só por um processo próprio): avisa-se em destaque. */
  irreversible?: boolean;
  onConfirm: () => void | Promise<unknown>;
}

/** Confirmação padrão (substitui `window.confirm`): modal de aviso com Cancelar / Confirmar, aberto por id. */
export function ConfirmModal({ id, title, description, confirmLabel = "Confirmar", destructive, isLoading, effects, irreversible, onConfirm }: ConfirmModalProps) {
  const { open, closeModal } = useModal();
  if (!open[id]) return null;

  return (
    <GlobalModal
      id={id}
      canClose
      warning={destructive}
      title={title}
      description={description}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => closeModal(id)}>Cancelar</Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={Boolean(isLoading)}
            onClick={async () => {
              try {
                await onConfirm();
                closeModal(id);
              } catch {
                /* o erro é mostrado pela mutação */
              }
            }}
          >
            {isLoading && <Icon className="animate-spin" name="LoaderCircle" />}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <span className="sr-only">{title}</span>
      {effects && effects.length > 0 && (
        <div className="space-y-1.5 rounded-xs border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">O que acontece</p>
          <ul className="list-disc space-y-1 pl-4">{effects.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      {irreversible && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-destructive">
          <Icon name="TriangleAlert" className="mt-0.5 size-3.5 shrink-0" />
          Esta ação não se pode desfazer.
        </p>
      )}
    </GlobalModal>
  );
}
