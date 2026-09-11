"use client";

import { useState, useEffect, useTransition } from "react";
import { Icon, Input, Button, GlobalModal } from "@/components";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { playScannerBeep } from "@/utils/audio";
import { cn } from "@/lib/utils";

interface ManagerAuthModalProps {
  onAuthenticated: (code: string) => void | Promise<void>;
  /** When true the modal is skipped and onAuthenticated is called immediately.
   *  Use this for OWNER/MANAGER roles that don't need barcode authorisation. */
  bypass?: boolean;
}

export const MODAL_MANAGER_AUTH_ID = "manager-auth-modal";

export function ManagerAuthModal({ onAuthenticated, bypass = false }: ManagerAuthModalProps) {
  const { open, closeModal, openModal } = useModal();
  const isOpen = open[MODAL_MANAGER_AUTH_ID] || false;
  const [isLoading, startTransition] = useTransition();
  const [buffer, setBuffer] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // When bypass is enabled, call onAuthenticated immediately whenever the modal
  // would normally open, then close it right away so no UI is shown.
  useEffect(() => {
    if (bypass && isOpen) {
      onAuthenticated("");
      closeModal(MODAL_MANAGER_AUTH_ID);
    }
  }, [bypass, isOpen, onAuthenticated, closeModal]);

  // Barcode listener for the modal
  useEffect(() => {
    if (!isOpen) {
      setBuffer("");
      setShowManualInput(false);
      setManualCode("");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key === "Enter") {
        if (buffer.length === 13) {
          playScannerBeep();
          verifyCode(buffer);
        } else if (buffer.length > 0) {
          ErrorMessage("Código inválido. Use o leitor de gerente.");
          setBuffer("");
        }
      } else if (/^[0-9]$/.test(e.key)) {
        setBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, buffer, isLoading]);

  const verifyCode = (codeToVerify: string) => {
    startTransition(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await onAuthenticated(codeToVerify);
        closeModal(MODAL_MANAGER_AUTH_ID);
      } catch (error) {
        setBuffer("");
        setManualCode("");
      }
    });
  };

  return (
    <GlobalModal
      id={MODAL_MANAGER_AUTH_ID}
      className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl"
      title="Autorização de Gerente"
      canClose={!isLoading}
    >
      <div className="bg-gradient-to-br from-primary/10 via-background to-background p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary/15 flex items-center justify-center text-primary shadow-inner animate-pulse">
              <Icon name="ShieldCheck" size={48} />
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-primary shadow-lg">
              <Icon name="Barcode" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Scanner Requerido
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed px-4">
              Passe o cartão ou código de barras do <strong>Gerente</strong> no
              leitor para autorizar esta operação.
            </p>
          </div>

          <div className="w-full py-6 flex flex-col items-center gap-4">
            {!showManualInput ? (
              <>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/20 text-primary animate-bounce-slow">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Aguardando Leitura...
                  </span>
                </div>

                {buffer.length > 0 && (
                  <div className="flex gap-1">
                    {[...Array(13)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all duration-300",
                          i < buffer.length ? "bg-primary scale-110" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="mt-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Icon name="Keyboard" size={14} />
                  Inserir código manualmente
                </button>
              </>
            ) : (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Input
                  autoFocus
                  label="Código do Gerente"
                  placeholder="Ex: 1234567890123"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualCode.length > 0) {
                      verifyCode(manualCode);
                    }
                  }}
                  startIcon="Key"
                  disabled={isLoading}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 text-xs"
                    onClick={() => {
                      setShowManualInput(false);
                      setManualCode("");
                    }}
                    disabled={isLoading}
                  >
                    Voltar para Scanner
                  </Button>
                  <Button
                    className="flex-1 h-10 text-xs font-bold"
                    onClick={() => verifyCode(manualCode)}
                    disabled={isLoading || manualCode.length < 1}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full pt-4">
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-10 text-xs uppercase font-bold tracking-widest"
              onClick={() => closeModal(MODAL_MANAGER_AUTH_ID)}
              disabled={isLoading}
            >
              Cancelar Operação
            </Button>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}
