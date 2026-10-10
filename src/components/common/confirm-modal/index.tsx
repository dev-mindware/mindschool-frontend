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
  onConfirm: () => void | Promise<unknown>;
}

/** Confirmação padrão (substitui `window.confirm`): modal de aviso com Cancelar / Confirmar, aberto por id. */
export function ConfirmModal({ id, title, description, confirmLabel = "Confirmar", destructive, isLoading, onConfirm }: ConfirmModalProps) {
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
    </GlobalModal>
  );
}
