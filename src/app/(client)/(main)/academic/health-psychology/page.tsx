import { PageWrapper } from "@/components";
import { HealthPageContent } from "@/components/client/academic/health";

export default function AcademicHealthPsychologyPage() {
  return (
    <PageWrapper
      routePath="/academic/health-psychology"
      routeLabel="Gestão Académica"
      subRoute="Saúde & Apoio Psicopedagógico"
    >
      <HealthPageContent />
    </PageWrapper>
  );
}
