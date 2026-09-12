import {
  Role,
  RoleDashboardData,
  TuitionFinancialKpi,
  DashboardQuickAction,
} from "@/types";

export function buildFinancialData(
  role: Role,
  period: string,
  _academicYear: string
): RoleDashboardData {
  const tuitionFinancial: TuitionFinancialKpi = {
    monthName: "Março 2026",
    expectedRevenueAoa: 31250000,
    collectedRevenueAoa: 27812500,
    collectionRatePercent: 89.0,
    overdueStudentsCount: 68,
    overdueTotalAoa: 3437500,
    certifiedInvoicesCount: 1182,
    monthlyEvolution: [
      { month: "Jan", expected: 31000000, collected: 29500000 },
      { month: "Fev", expected: 31200000, collected: 28900000 },
      { month: "Mar", expected: 31250000, collected: 27812500 },
      { month: "Abr (Prev.)", expected: 31250000, collected: 4200000 },
    ],
  };

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-liquidar",
      label: "Registar Pagamento",
      description: "Emissão de Recibo AGT",
      href: "/tuition/collections",
      icon: "Receipt",
      variant: "terracotta",
    },
    {
      id: "qa-fatura",
      label: "Faturas Certificadas",
      description: "Hash RSA e comunicação AGT",
      href: "/documents/invoices",
      icon: "FileSpreadsheet",
    },
    {
      id: "qa-saft",
      label: "Exportar SAF-T (AO)",
      description: "Ficheiro XML fiscal mensal",
      href: "/reports/sales",
      icon: "CloudDownload",
    },
    {
      id: "qa-tabela",
      label: "Tabela de Propinas",
      description: "Preçários por classe e multas",
      href: "/tuition/payments",
      icon: "SlidersHorizontal",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Arrecadação do Mês (Kz)",
        value: "27.812.500 Kz",
        description: "89% da meta de Março",
        variation: 6.8,
        icon: "Banknote",
        trend: "up",
      },
      {
        title: "Taxa de Cobrança Atual",
        value: "89.0%",
        description: "Meta institucional: 92%",
        variation: 2.1,
        icon: "Percent",
        trend: "up",
      },
      {
        title: "Inadimplência (> 30 dias)",
        value: "68 Alunos",
        description: "Total pendente: 3.437.500 Kz",
        variation: -14.2,
        icon: "CircleAlert",
        trend: "down",
      },
      {
        title: "Faturas Validadas AGT",
        value: "1.182 Doc.",
        description: "Comunicação em tempo real",
        icon: "ShieldCheck",
        trend: "up",
      },
    ],
    quickActions,
    tuitionFinancial,
  };
}
