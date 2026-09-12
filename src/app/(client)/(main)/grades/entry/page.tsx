import { PageWrapper } from "@/components";
import { GradesPageContent } from "@/components/client/grades/grades-page-content";

export default function GradesEntryPage() {
  return (
    <PageWrapper
      routePath="/grades/entry"
      routeLabel="Avaliações & Pautas"
      subRoute="Lançamento de Notas"
    >
      <GradesPageContent />
    </PageWrapper>
  );
}
