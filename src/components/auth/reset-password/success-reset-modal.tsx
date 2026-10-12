"use client";
import { useModal } from "@/stores";
import { Button, GlobalModal } from "@/components";
import { CheckCircle2 } from "lucide-react";

interface SuccessResetModalProps {
  redirectUrl?: string;
}

export function SuccessResetModal({ redirectUrl = "/" }: SuccessResetModalProps) {
  const { closeModal } = useModal();

  function handleGoToApp() {
    closeModal("success-reset-modal");
    window.location.href = redirectUrl;
  }

  return (
    <GlobalModal
      id="success-reset-modal"
      className="p-8 max-w-md text-center"
      title={
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <span className="text-2xl font-bold">Palavra-passe definida</span>
        </div>
      }
      description={
        <span className="text-base text-muted-foreground flex text-center">
          A sua palavra-passe foi configurada com sucesso e a sua sessão foi iniciada. Clique abaixo para aceder à plataforma MindSchool.
        </span>
      }
    >
      <Button className="w-full mt-4" onClick={handleGoToApp}>
        Aceder à Plataforma
      </Button>
    </GlobalModal>
  );
}
