"use client";
import { Button, GlobalModal } from "@/components";
import { useModal } from "@/stores";
import { MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function OTPModal({ message }: { message: string }) {
  const { closeModal } = useModal();
  const router = useRouter();

  function handleGoToLogin() {
    closeModal("information-modal");
    router.replace("/auth/login");
  }

  return (
    <GlobalModal
      id="information-modal"
      className="p-8 max-w-md text-center"
      title={
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <span className="text-2xl font-bold">Verifique o seu e-mail</span>
        </div>
      }
      description={
        <span className="text-base text-muted-foreground flex text-center">
          {message ||
            "Enviámos as instruções para recuperar a palavra-passe. Verifique a caixa de entrada e a pasta de correio não solicitado."}
        </span>
      }
    >
      <Button className="w-full mt-4" onClick={handleGoToLogin}>
        Entendido
      </Button>
    </GlobalModal>
  );
}
