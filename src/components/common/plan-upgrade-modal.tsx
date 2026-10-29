"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GlobalModal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common/icon";
import { usePlanUpgradeModal } from "@/stores/plan/use-plan-upgrade-modal-store";
import { PLAN_LABEL } from "@/types";
import { PLAN_BENEFITS } from "@/constants/plan-benefits";

export function PlanUpgradeModal() {
  const router = useRouter();
  const { isOpen, requiredPlan, featureName, description, close } = usePlanUpgradeModal();

  const benefits = PLAN_BENEFITS[requiredPlan];
  const planLabel = PLAN_LABEL[requiredPlan];

  const handleUpgrade = () => {
    close();
    router.push("/plans");
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={close}
      size="md"
      icon={<Icon name="Crown" className="size-5" />}
      title={`Recurso Exclusivo do Plano ${planLabel}`}
      description={
        description ? (
          description
        ) : featureName ? (
          <>
            O recurso <span className="font-semibold text-foreground">{featureName}</span> não
            faz parte do seu plano atual. Atualize para o plano{" "}
            <span className="font-semibold text-primary">{planLabel}</span> para desbloquear
            esta e outras funcionalidades.
          </>
        ) : (
          `Esta funcionalidade exige o plano ${planLabel} para ser utilizada.`
        )
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={close}>
            Mais tarde
          </Button>
          <Button size="sm" onClick={handleUpgrade} className="gap-1.5">
            <Icon name="Zap" className="size-4 fill-current" />
            Fazer Upgrade para {planLabel}
          </Button>
        </>
      }
    >
      {benefits.length > 0 && (
        <div className="p-4 bg-muted/40 rounded-xs border border-border/60 text-left space-y-2.5">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Incluído no plano {planLabel}:
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2 text-xs text-foreground/95">
                <Icon
                  name="Check"
                  className="size-3.5 text-success mt-0.5 shrink-0"
                  strokeWidth={3}
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlobalModal>
  );
}
