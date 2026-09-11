"use client";
import { useState } from "react";
import { TitleList, RequestError, SalesSkeleton } from "@/components/common";
import { SalesAreaChart } from "./sales-area-chart";
import { SalesSummaryCards } from "./sales-summary-cards";

import { ReportExportButton, ReportFilters } from "../common";
import { useSalesReports } from "@/hooks/reports";
import { SalesPeriod, ReportExportType } from "@/types/reports";
import { RequestSalesError } from "./request-sales-error";

export function SalesReportsContent() {
  const [exportReportType, setExportReportType] =
    useState<ReportExportType>("SALES");

  const {
    data,
    isLoading,
    isError,
    refetch,
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useSalesReports();

  if (isLoading) return <SalesSkeleton />;

  if (isError || !data) 
    return <RequestSalesError refetch={refetch} />;

  const hasSalesData =
    data.summary.totalTransactions > 0 ||
    data.summary.totalRevenue > 0 ||
    data.data.some(
      (item) =>
        item.transactionCount > 0 ||
        item.totalSales > 0 ||
        item.totalRevenue > 0,
    );

  return (
    <div className="space-y-6">
      <div data-tour="reports-sales-header">
        <TitleList
          title="Vendas e Facturação"
          suTitle="Analise receitas, volume, facturação e evolução por período de forma clara."
        />
      </div>

      <div data-tour="reports-sales-filters">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <ReportFilters
            filters={[
              {
                type: "select",
                label: "Tipo de Relatório",
                value: exportReportType,
                onChange: (value) =>
                  setExportReportType(value as ReportExportType),
                options: [
                  { value: "SALES", label: "Vendas" },
                  { value: "BILLING", label: "Facturação" },
                ],
                placeholder: "Seleccione o tipo",
              },
              {
                type: "select",
                label: "Período",
                value: period,
                onChange: (value) => setPeriod(value as SalesPeriod),
                options: [
                  { value: "daily", label: "Diário" },
                  { value: "weekly", label: "Semanal" },
                  { value: "monthly", label: "Mensal" },
                  { value: "quarterly", label: "Trimestral" },
                  { value: "yearly", label: "Anual" },
                ],
                placeholder: "Seleccione o período",
              },
              {
                type: "date",
                label: "Data Início",
                value: startDate,
                onChange: setStartDate,
              },
              {
                type: "date",
                label: "Data Fim",
                value: endDate,
                onChange: setEndDate,
                disabledDates: (date) => (startDate ? date < startDate : false),
              },
            ]}
          />
          <div data-tour="reports-sales-export">
            <ReportExportButton
              reportType={exportReportType}
              startDate={startDate}
              endDate={endDate}
              filenamePrefix={exportReportType === "BILLING" ? "Relatorio-de-Facturacao" : "Relatorio-de-Vendas"}
              className="w-full lg:w-auto"
              hasData={hasSalesData}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <SalesSummaryCards summary={data.summary} />
        <SalesAreaChart data={data.data} period={period} />
      </div>
    </div>
  );
}
