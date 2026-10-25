"use client";

import { TitleList } from "@/components";
import { FinanceDashboard } from "./finance-dashboard";

/** Visão geral do módulo de propinas: situação do ano, comprovativos por validar, dívida e previsão. */
export function TuitionOverviewContent() {
  return (
    <div className="space-y-6">
      <TitleList title="Propinas & Taxas Escolares" suTitle="Faturação, cobrança e pagamentos das famílias num só painel." />
      <FinanceDashboard variant="operations" />
    </div>
  );
}
