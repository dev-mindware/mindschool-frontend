"use client";

import { TitleList, RequestError } from "@/components/common";
import { useClientAnalytics } from "@/hooks/reports/use-client-analytics";
import { ClientsReportsSkeleton } from "../../../common/skeletons/clients-reports-skeleton";
import { ReportFilters } from "../common";
import { MetricsPieChart } from "./metrics-pie-chart";
import { TopClientCard } from "./top-client-card";
import { MonthlyRevenueTable } from "./monthly-revenue-table";
import { PreferredProductsTable } from "./preferred-products-table";

import { DynamicMetricCard } from "@/components";
import { formatCurrency } from "@/utils";

export function ClientsReportsContent() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    reportType,
    setReportType,
    limit,
    setLimit,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useClientAnalytics();

  if (isLoading) {
    return <ClientsReportsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <TitleList
          title="Relatórios de Clientes"
          suTitle="Análise de Clientes"
        />
        <RequestError
          refetch={refetch}
          message="Erro ao carregar relatórios de clientes"
        />
      </div>
    );
  }

  const topClient = data.clients[0];

  const summaryMetrics = [
    {
      title: formatCurrency(data.summary.totalRevenue),
      subtitle: "Receita Total",
      icon: "DollarSign",
      description: "Facturação no período",
    },
    {
      title: formatCurrency(data.summary.averageTicket),
      subtitle: "Ticket Médio",
      icon: "Receipt",
      description: "Valor médio por compra",
    },
    {
      title: data.summary.totalClients,
      subtitle: "Total Clientes",
      icon: "Users",
      description: "Base de clientes activa",
    },
    {
      title: `${data.summary.averageLoyaltyScore}%`,
      subtitle: "Score Médio",
      icon: "Award",
      description: "Fidelização de clientes",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div data-tour="reports-clients-header">
        <TitleList
          title="Relatórios de Clientes"
          suTitle="Acompanhe compras, frequência e valor médio para identificar quem gera mais receita."
        />
      </div>

      <div data-tour="reports-clients-filters">
        <ReportFilters
          filters={[
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
            {
              type: "select",
              label: "Tipo de Cliente",
              value: reportType,
              onChange: setReportType,
              options: [
                { value: "top", label: "Top Clientes" },
                { value: "recent", label: "Recentes" },
                { value: "inactive", label: "Inativos" },
              ],
              placeholder: "Seleccione o tipo",
            },
            {
              type: "select",
              label: "Limite",
              value: limit,
              onChange: setLimit,
              options: [
                { value: "5", label: "5" },
                { value: "10", label: "10" },
                { value: "20", label: "20" },
              ],
              placeholder: "Seleccione o limite",
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="reports-clients-summary">
        {summaryMetrics.map((metric, i) => (
          <DynamicMetricCard key={i} {...(metric as any)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="reports-clients-details">
        <div className="lg:col-span-2">
          <MetricsPieChart summary={data.summary} />
        </div>
        <TopClientCard client={topClient} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <MonthlyRevenueTable monthlyTrend={topClient?.monthlyTrend || []} />
        <PreferredProductsTable
          preferredItems={topClient?.preferredItems || []}
        />
      </div>
    </div>
  );
}
