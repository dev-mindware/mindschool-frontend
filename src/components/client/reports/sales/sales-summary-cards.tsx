import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { formatCurrency } from "@/utils";
import { SalesSummary } from "@/types/reports";

interface SalesSummaryCardsProps {
  summary: SalesSummary;
}

export function SalesSummaryCards({ summary }: SalesSummaryCardsProps) {
  // if (summary.totalTransactions === 0) {
  //     return (
  //         <Card>
  //             <CardContent className="pt-6">
  //                 <EmptyState
  //                     icon="SearchX"
  //                     title="Nenhuma venda encontrada"
  //                     description="Não existem dados de vendas para o período seleccionado."
  //                 />
  //             </CardContent>
  //         </Card>
  //     );
  // }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
      <DynamicMetricCard
        title={formatCurrency(summary.totalRevenue)}
        subtitle="Receita Total"
        description="Valor total de vendas no período"
        icon="DollarSign"
      />

      <DynamicMetricCard
        title={summary.totalTransactions.toLocaleString("pt-AO")}
        subtitle="Total de transacções"
        description="Número de vendas realizadas"
        icon="ShoppingCart"
      />

      <DynamicMetricCard
        title={formatCurrency(summary.averageTicket)}
        subtitle="Ticket Médio"
        description="Valor médio por transacção"
        icon="Receipt"
      />
    </div>
  );
}
