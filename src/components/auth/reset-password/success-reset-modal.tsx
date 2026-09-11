"use client";
import { useModal } from "@/stores";
import { Button, GlobalModal } from "@/components";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SuccessResetModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  function handleGoToLogin() {
    closeModal("success-reset-modal");
    router.replace("/auth/login");
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
          <span className="text-2xl font-bold">Palavra-passe alterada</span>
        </div>
      }
      description={
        <span className="text-base text-muted-foreground flex text-center">
          A palavra-passe foi redefinida com sucesso. Já pode aceder à sua conta
          com a nova palavra-passe.
        </span>
      }
    >
      <Button className="w-full mt-4" onClick={handleGoToLogin}>
        Iniciar sessão
      </Button>
    </GlobalModal>
  );
}
