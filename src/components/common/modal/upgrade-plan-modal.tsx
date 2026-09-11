"use client";

import { GlobalModal, Button, Icon } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { useRouter } from "next/navigation";

export const UPGRADE_PLAN_MODAL_ID = "upgrade-plan-modal";

export function UpgradePlanModal() {
  const { closeModal } = useModal();
  const router = useRouter();

  const handleUpgrade = () => {
    closeModal(UPGRADE_PLAN_MODAL_ID);
    router.push("/plans");
  };

  return (
    <GlobalModal
      id={UPGRADE_PLAN_MODAL_ID}
      title={
        <div className="flex items-center gap-2 text-primary">
          <Icon name="Sparkles" className="w-5 h-5 fill-primary/20" />
          <span>Faça Upgrade do seu Plano</span>
        </div>
      }
      description="Recurso exclusivo para planos superiores."
      canClose
      className="sm:max-w-md"
    >
      <div className="space-y-4 pt-2">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
          <div className="space-y-2 text-sm text-foreground/80">
            <p>
              Tentou aceder a uma funcionalidade que não está disponível no
              plano actual. Actualize o plano para a utilizar.
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
              <li>Acesso a relatórios avançados</li>
              <li>Gestão de stock em várias lojas</li>
              <li>Recursos de IA (GestAI)</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => closeModal(UPGRADE_PLAN_MODAL_ID)}
          >
            Agora não
          </Button>
          <Button onClick={handleUpgrade} className="gap-2">
            <Icon name="Zap" className="w-4 h-4" />
            Ver Planos
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
