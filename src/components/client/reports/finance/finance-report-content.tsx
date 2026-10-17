"use client";

import React, { useState } from "react";
import { Button, Icon, TitleList } from "@/components";
import { FinanceDashboard } from "@/modules/finance/components/overview/finance-dashboard";
import { TuitionReportsContent } from "@/modules/finance/components/tuition-reports-content";
import { ApiReportsCatalog } from "@/components/client/reports/common";
import { FinanceReportExportModal } from "./finance-report-export-modal";

/** Relatório financeiro (padrão MindGest): painel de indicadores, balancete mensal e relatórios oficiais exportáveis. */
export function FinanceReportContent() {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="space-y-8">
      <TitleList
        title="Relatório Financeiro"
        suTitle="Indicadores de facturação, cobrança e dívida do ano lectivo, com exportação dos relatórios oficiais."
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExportOpen(true)}
          className="gap-2"
        >
          <Icon name="Download" className="h-4 w-4" />
          <span>Baixar Relatório (PDF)</span>
        </Button>
      </TitleList>
      <FinanceDashboard variant="report" />
      <TuitionReportsContent />
      <ApiReportsCatalog
        domains={["financeiro"]}
        title="Relatórios financeiros oficiais"
        description="Dívidas por aluno, recebimentos por período e facturas por estado, exportáveis em Excel, PDF e CSV."
      />

      <FinanceReportExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
