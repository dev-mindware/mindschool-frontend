"use client";

import { PlanType, PLAN_LABEL } from "@/types";
import { PLAN_BENEFITS } from "@/constants/plan-benefits";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PlanUpgradeGateProps {
  requiredPlan: PlanType;
  featureName?: string;
}

export function PlanUpgradeGate({
  requiredPlan,
  featureName,
}: PlanUpgradeGateProps) {
  const router = useRouter();

  const benefits = PLAN_BENEFITS[requiredPlan];
  const planLabel = PLAN_LABEL[requiredPlan];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150 animate-pulse" />
        <div className="relative flex items-center justify-center w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <Icon name="Lock" className="w-10 h-10" strokeWidth={1.5} />
        </div>
      </div>

      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Recurso Exclusivo do Plano {planLabel}
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {featureName ? (
            <>
              O recurso{" "}
              <span className="font-semibold text-foreground">
                {featureName}
              </span>{" "}
              não está disponível no plano atual. Atualize a subscrição
              para desbloquear esta funcionalidade.
            </>
          ) : (
            "Esta página exige um plano de subscrição superior para ser acedida."
          )}
        </p>
      </div>

      {benefits.length > 0 && (
        <div className="w-full max-w-sm mt-8 p-5 bg-muted/40 rounded-xl border text-left space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            O que está incluído no plano {planLabel}:
          </h4>
          <ul className="space-y-2.5">
            {benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 text-sm text-foreground/95"
              >
                <Icon
                  name="Check"
                  className="w-4 h-4 text-green-600 mt-0.5 shrink-0"
                  strokeWidth={3}
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-xs sm:max-w-sm">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex-1"
        >
          Ir para o Dashboard
        </Button>
        <Button
          onClick={() => router.push("/plans")}
          className="flex-1 bg-primary hover:opacity-90 transition-opacity gap-2"
        >
          <Icon name="Zap" className="w-4 h-4 fill-current" />
          Fazer Upgrade
        </Button>
      </div>
    </div>
  );
}
