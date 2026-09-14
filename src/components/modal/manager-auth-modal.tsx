"use client";

import { useState } from "react";
import { Modal } from "./index";
import { Button, Input, Icon } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";

export const MODAL_MANAGER_AUTH_ID = "manager-auth-modal";

interface ManagerAuthModalProps {
  onAuthenticated?: (managerId: string) => void;
  bypass?: boolean;
}

export function ManagerAuthModal({
  onAuthenticated,
  bypass = false,
}: ManagerAuthModalProps) {
  const { closeModal } = useModal();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bypass || pin === "1234" || pin.length >= 4) {
      closeModal(MODAL_MANAGER_AUTH_ID);
      onAuthenticated?.("admin-id");
      setPin("");
      setError("");
    } else {
      setError("PIN de autorização inválido");
    }
  };

  return (
    <Modal
      id={MODAL_MANAGER_AUTH_ID}
      title="Autorização Administrativa"
      description="Introduza o PIN ou credencial de Diretor/Supervisor para confirmar esta operação."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            PIN de Segurança (Supervisor)
          </label>
          <div className="relative">
            <Input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              placeholder="••••"
              className="tracking-widest text-center text-lg"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              closeModal(MODAL_MANAGER_AUTH_ID);
              setPin("");
              setError("");
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || (!bypass && !pin)}>
            <Icon name="ShieldCheck" className="mr-1.5 size-4" />
            Autorizar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
