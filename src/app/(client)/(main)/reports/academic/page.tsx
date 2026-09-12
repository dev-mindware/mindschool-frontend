import { PageWrapper } from "@/components";
import { AcademicPerformanceContent } from "@/components/client/reports/academic";

export default function ReportsAcademicPage() {
  return (
    <PageWrapper
      routePath="/reports/academic"
      routeLabel="Relatórios & MED"
      subRoute="Rendimento Pedagógico & Quadro de Honra"
    >
      <AcademicPerformanceContent />
    </PageWrapper>
  );
}
