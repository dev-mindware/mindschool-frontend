import { PageWrapper } from "@/components";
import { EnrollmentsPageContent } from "@/components/client/enrollments";

export default function StudentEnrollmentsPage() {
  return (
    <PageWrapper
      routePath="/students/enrollments"
      routeLabel="Alunos & Matrículas"
      subRoute="Matrículas & Inscrições"
    >
      <EnrollmentsPageContent />
    </PageWrapper>
  );
}
