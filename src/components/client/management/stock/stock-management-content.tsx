"use client";

import { TitleList } from "@/components/common";
import { ReportExportPanel } from "@/components/client/reports/common";
import { StockList } from "./stock-list";
import { StockSummaryCharts } from "./stock-summary-charts";

export function StockManagementContent() {
  return (
    <div className="space-y-6">
      <TitleList
        title="Gestão de stock"
        suTitle="Acompanhe níveis, reservas e movimentos dos produtos em loja."
      />
      <ReportExportPanel
        reportType="STOCK"
        filenamePrefix="relatorio-stock"
        className="rounded-lg border p-4"
      />
      <div data-tour="stock-summary">
        <StockSummaryCharts />
      </div>
      <div data-tour="stock-table">
        <StockList />
      </div>
    </div>
  );
}
