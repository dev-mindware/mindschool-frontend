"use client";

import { Button, Icon, TitleList } from "@/components";
import { FinanceDashboard } from "@/modules/finance/components/overview/finance-dashboard";
import { TuitionReportsContent } from "@/modules/finance/components/tuition-reports-content";
import { ApiReportsCatalog } from "@/components/client/reports/common";

/** Relatório financeiro (padrão MindGest): painel de indicadores, balancete mensal e relatórios oficiais exportáveis. */
export function FinanceReportContent() {
  return (
    <div className="space-y-8">
      <TitleList title="Relatório Financeiro" suTitle="Indicadores de facturação, cobrança e dívida do ano lectivo, com exportação dos relatórios oficiais.">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}><Icon name="Printer" className="size-4" />Imprimir</Button>
      </TitleList>
      <FinanceDashboard variant="report" />
      <TuitionReportsContent />
      <ApiReportsCatalog domains={["financeiro"]} title="Relatórios financeiros oficiais" description="Dívidas por aluno, recebimentos por período e facturas por estado, exportáveis em Excel, PDF e CSV." />
    </div>
  );
}
