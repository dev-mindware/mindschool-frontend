import { PageWrapper } from "@/components";
import { EntranceExamsPageContent } from "@/components/client/admissions/exams/entrance-exams-page-content";

export default function StudentAdmissionsExamsPage() {
  return (
    <PageWrapper
      subRoute="Provas de Acesso"
      segments={[
        { label: "Alunos & Matrículas" },
        { label: "Candidaturas", href: "/students/admissions" },
        { label: "Provas de Acesso" },
      ]}
    >
      <EntranceExamsPageContent />
    </PageWrapper>
  );
}
