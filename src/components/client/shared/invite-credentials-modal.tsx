"use client";

import React, { useEffect, useState } from "react";
import { GlobalModal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/common/icon";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";

interface InviteCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  targetName: string;
  targetRole: "Aluno" | "Encarregado de Educação" | string;
  currentEmail?: string;
  onSend: (email: string) => Promise<void>;
}

export function InviteCredentialsModal({
  isOpen,
  onClose,
  title,
  targetName,
  targetRole,
  currentEmail,
  onSend,
}: InviteCredentialsModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail || "");
    }
  }, [isOpen, currentEmail]);

  const isValidEmail = Boolean(
    email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidEmail || isLoading) return;

    try {
      setIsLoading(true);
      await onSend(email.trim().toLowerCase());
      SucessMessage(`Convite de acesso enviado com sucesso para ${email.trim()}!`);
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível enviar o convite."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={() => !isLoading && onClose()}
      size="md"
      canClose={!isLoading}
      icon={<Icon name="MailCheck" className="size-5" />}
      title={title || `Enviar Convite de Acesso (${targetRole})`}
      description={
        <span>
          Será enviado um convite por correio eletrónico com o link de ativação da conta e
          instruções para <strong>{targetName}</strong> aceder ao portal escolar.
        </span>
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!isValidEmail || isLoading}
            onClick={() => void handleSubmit()}
            className="gap-2 bg-primary font-medium"
          >
            <Icon name="Send" className="size-4" />
            {isLoading ? "A enviar..." : "Enviar Convite"}
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        {!currentEmail && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xs text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
            <Icon name="Info" className="size-4 shrink-0 mt-0.5" />
            <span>
              Este {targetRole.toLowerCase()} ainda não possui email cadastrado. Digite o
              endereço para o qual deseja encaminhar os dados de acesso.
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="invite-email" className="text-xs font-semibold">
            Endereço de Correio Eletrónico (E-mail) *
          </Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="exemplo@dominio.ao"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoFocus={!currentEmail}
            className="text-sm"
          />
        </div>
      </form>
    </GlobalModal>
  );
}
