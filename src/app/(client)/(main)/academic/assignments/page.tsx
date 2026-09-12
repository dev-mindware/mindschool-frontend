import { PageWrapper } from "@/components";
import { TeacherAssignmentsPageContent } from "@/components/client/academic/assignments";

export default function AcademicAssignmentsPage() {
  return (
    <PageWrapper
      routePath="/academic/classes"
      routeLabel="Gestão Académica"
      subRoute="Distribuição Docente"
    >
      <TeacherAssignmentsPageContent />
    </PageWrapper>
  );
}
