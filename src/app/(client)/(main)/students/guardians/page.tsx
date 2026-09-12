import { PageWrapper } from "@/components";
import { GuardiansPageContent } from "@/components/client/guardians";

export default function StudentGuardiansPage() {
  return (
    <PageWrapper
      routePath="/students/guardians"
      routeLabel="Alunos & Matrículas"
      subRoute="Encarregados de Educação"
    >
      <GuardiansPageContent />
    </PageWrapper>
  );
}
