import { PageWrapper } from "@/components";
import { StudentsPageContent } from "@/components/client/students";

export default function StudentsListPage() {
  return (
    <PageWrapper
      routePath="/students/list"
      routeLabel="Alunos & Matrículas"
      subRoute="Lista de Alunos"
    >
      <StudentsPageContent />
    </PageWrapper>
  );
}
