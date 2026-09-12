import { PageWrapper, SchoolModulePlaceholder } from "@/components";

export default function ReportsFinancePage() {
  return (
    <PageWrapper
      routePath="/reports/med"
      routeLabel="Relatórios & MED"
      subRoute="SAF-T Escolar"
    >
      <SchoolModulePlaceholder
        title="Financeiro & SAF-T Escolar"
        subtitle="Volume de facturação, propinas arrecadadas e exportação SAF-T (AO)."
        icon="DollarSign"
        description="Emita balancetes de cobrança, analise a taxa de cumprimento financeiro e gere o ficheiro SAF-T de facturação para cumprimento das obrigações fiscais da AGT."
        badge="Fiscal AGT"
        primaryActionLabel="Exportar SAF-T (AO)"
        primaryActionIcon="FileCode"
        secondaryActionLabel="Balancete Geral"
        secondaryActionIcon="Download"
        stats={[
          { label: "Faturado no Exercício", value: "110.700.000 Kz", subtext: "Ano 2026", icon: "TrendingUp" },
          { label: "Total Cobrado", value: "98.450.000 Kz", subtext: "88.9% recebido", icon: "CircleCheck" },
          { label: "Total em Dívida", value: "12.250.000 Kz", subtext: "Em recuperação", icon: "CircleAlert" },
          { label: "Validação SAF-T", value: "Auditado", subtext: "Estrutura XML válida", icon: "ShieldCheck" },
        ]}
      />
    </PageWrapper>
  );
}
