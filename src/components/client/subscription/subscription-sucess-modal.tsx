"use client";
import { useModal } from "@/stores";
import { Button } from "@/components/ui";
import { GlobalModal } from "@/components/modal";
import { useRouter } from "next/navigation";

export function SubscriptionSucessModal() {
  const router = useRouter();
  const { closeModal } = useModal();

  function handleClose() {
    closeModal("subscription-created");
    router.push("/settings?tab=subscription");
  }

  return (
    <GlobalModal
      sucess
      canClose={false}
      id="subscription-created"
      className="!w-lg text-center"
      title="Subscrição criada com sucesso"
      description={<>
        <span className="text-sm text-muted-foreground">
          A subscrição foi efectuada com sucesso. <br /> Receberá uma notificação
          assim que o acesso estiver disponível.
        </span>
      </>}
    >
      <div className="flex flex-col items-center justify-center pt-2 space-y-4">
        <div className="w-full">
          <Button
            onClick={handleClose}
            className="w-full bg-primary hover:bg-primary/90 font-semibold"
          >
            Fechar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
