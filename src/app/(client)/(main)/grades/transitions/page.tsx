import { PageWrapper } from "@/components";
import { TransitionsPageContent } from "@/components/client/grades/transitions/transitions-page-content";

export default function TransitionsPage() {
  return (
    <PageWrapper
      routePath="/grades"
      routeLabel="Avaliações & Pautas"
      subRoute="Transições de Classe"
    >
      <TransitionsPageContent />
    </PageWrapper>
  );
}
