import { PageWrapper } from "@/components";
import { SubjectsPageContent } from "@/components/client/academic/subjects";

export default function AcademicSubjectsPage() {
  return (
    <PageWrapper
      routePath="/academic/classes"
      routeLabel="Gestão Académica"
      subRoute="Disciplinas & Currículo"
    >
      <SubjectsPageContent />
    </PageWrapper>
  );
}
