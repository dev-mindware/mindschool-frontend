import { PageWrapper } from "@/components";
import { AdmissionsPageContent } from "@/components/client/admissions/admissions-page-content";

export default function StudentAdmissionsPage() {
  return (
    <PageWrapper
      routePath="/students/admissions"
      routeLabel="Alunos & Matrículas"
      subRoute="Candidaturas & Admissões"
    >
      <AdmissionsPageContent />
    </PageWrapper>
  );
}
