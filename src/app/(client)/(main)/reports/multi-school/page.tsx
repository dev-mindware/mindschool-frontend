import { PageWrapper } from "@/components";
import { MultiSchoolPageContent } from "@/components/client/reports/multi-school/multi-school-page-content";

export default function ReportsMultiSchoolPage() {
  return (
    <PageWrapper
      routePath="/reports/multi-school"
      routeLabel="Relatórios & MED"
      subRoute="Painel Multi-Escola"
    >
      <MultiSchoolPageContent />
    </PageWrapper>
  );
}
