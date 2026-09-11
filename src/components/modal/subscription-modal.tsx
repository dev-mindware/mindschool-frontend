"use client";

import { Button } from "@/components/ui/button";
import { GlobalModal } from "@/components/modal";
import { useModal } from "@/stores/modal/use-modal-store";
import { RefreshCcw } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";

export function SubscriptionModal() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { closeModal } = useModal();

  const MODAL_ID = "subscription-expired-modal";

  const handleClose = () => {
    closeModal(MODAL_ID);
  };

  const handleRenew = () => {
    handleClose();
    router.push("/billing");
  };

  return (
    <GlobalModal
      id={MODAL_ID}
      canClose={false}
      title={
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mt-4">
            <RefreshCcw className="h-10 w-10 text-destructive" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Subscrição Expirada
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Olá {user?.name || "Utilizador"}, o seu plano{" "}
              <strong>
                {user?.company?.subscription?.plan?.name || "Premium"}
              </strong>{" "}
              expirou ou está inativo. Renove a sua subscrição para continuar a
              usar todos os recursos.
            </p>
          </div>
        </div>
      }
      className="p-8 bg-card rounded-2xl border shadow-[0_4px_24px_rgba(0,0,0,0.06)] outline-none border-none sm:max-w-md [&>button]:hidden text-center"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex flex-col gap-3 pt-4 w-full mt-2">
          <Button
            size="lg"
            className="w-full text-base font-semibold bg-primary hover:bg-primary/80 duration-200 text-white border-0"
            onClick={handleRenew}
          >
            Renovar Assinatura
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            Agora não
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
