import { PageWrapper } from "@/components";
import { TuitionReportsContent } from "@/components/client/tuition";

export default function FinanceReportPage() {
  return (
    <PageWrapper
      routePath="/reports/finance"
      routeLabel="Relatórios & Estatísticas"
      subRoute="Relatório Financeiro"
    >
      <TuitionReportsContent />
    </PageWrapper>
  );
}
