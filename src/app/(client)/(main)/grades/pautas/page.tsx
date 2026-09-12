import { PageWrapper } from "@/components";
import { PautasPageContent } from "@/components/client/grades/pautas/pautas-page-content";

export default function PautasPage() {
  return (
    <PageWrapper
      routePath="/grades"
      routeLabel="Avaliações & Pautas"
      subRoute="Pautas Trimestrais"
    >
      <PautasPageContent />
    </PageWrapper>
  );
}
