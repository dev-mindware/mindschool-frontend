import { PageWrapper } from "@/components";
import { ClassesPageContent } from "@/components/client/academic/classes";

export default function AcademicClassesPage() {
  return (
    <PageWrapper
      routePath="/academic/classes"
      routeLabel="Gestão Académica"
      subRoute="Turmas & Salas"
    >
      <ClassesPageContent />
    </PageWrapper>
  );
}
