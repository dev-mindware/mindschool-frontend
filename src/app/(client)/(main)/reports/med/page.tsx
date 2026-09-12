import { PageWrapper } from "@/components";
import { ReportsMedPageContent } from "@/components/client/reports/med/reports-med-page-content";

export default function ReportsMedPage() {
  return (
    <PageWrapper
      routePath="/reports/med"
      routeLabel="Relatórios & MED"
      subRoute="Mapas Estatísticos Oficiais"
    >
      <ReportsMedPageContent />
    </PageWrapper>
  );
}
