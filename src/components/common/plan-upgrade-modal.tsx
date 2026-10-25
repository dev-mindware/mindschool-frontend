"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md p-6 overflow-hidden">
        <DialogHeader className="items-center text-center sm:text-center space-y-3">
          <div className="relative flex items-center justify-center size-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mx-auto">
            <Icon name="Crown" className="size-7" />
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight">
            Recurso Exclusivo do Plano {planLabel}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description ? (
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
            )}
          </DialogDescription>
        </DialogHeader>

        {benefits.length > 0 && (
          <div className="my-2 p-4 bg-muted/40 rounded-xl border border-border/60 text-left space-y-2.5">
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

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={close} className="w-full sm:w-auto">
            Mais tarde
          </Button>
          <Button
            size="sm"
            onClick={handleUpgrade}
            className="w-full sm:w-auto gap-1.5 bg-primary font-medium shadow-xs"
          >
            <Icon name="Zap" className="size-4 fill-current" />
            Fazer Upgrade para {planLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
