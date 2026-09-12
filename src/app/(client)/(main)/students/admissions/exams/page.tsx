import { PageWrapper } from "@/components";
import { EntranceExamsPageContent } from "@/components/client/admissions/exams/entrance-exams-page-content";

export default function StudentAdmissionsExamsPage() {
  return (
    <PageWrapper
      routePath="/students/admissions"
      routeLabel="Alunos & Matrículas"
      subRoute="Provas de Acesso"
    >
      <EntranceExamsPageContent />
    </PageWrapper>
  );
}
