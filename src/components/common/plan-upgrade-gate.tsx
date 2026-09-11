"use client";

import { PlanType } from "@/types";
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

  const getPlanBenefits = (plan: PlanType) => {
    switch (plan) {
      case "Pro":
        return [
          "Gestão de fornecedores",
          "Reservas de stock",
          "Gestão avançada de POS",
          "Relatórios de acesso e auditoria",
        ];
      case "Smart":
        return [
          "POS operacional para vendas em balcão",
          "Movimentos e configurações do caixa",
          "Gestão de stock",
          "Relatórios de clientes",
        ];
      default:
        return [
          "Gestão de clientes e vendas",
          "Facturação e emissão de documentos",
          "Relatórios básicos de facturação",
        ];
    }
  };

  const benefits = getPlanBenefits(requiredPlan);

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
          Recurso Exclusivo do Plano {requiredPlan}
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {featureName ? (
            <>
              O recurso{" "}
              <span className="font-semibold text-foreground">
                {featureName}
              </span>{" "}
              não está disponível no plano actual. Actualize a subscrição
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
            O que está incluído no plano {requiredPlan}:
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
