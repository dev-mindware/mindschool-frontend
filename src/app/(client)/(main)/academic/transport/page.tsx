import { PageWrapper } from "@/components";
import { TransportPageContent } from "@/components/client/academic/transport";

export default function AcademicTransportPage() {
  return (
    <PageWrapper
      routePath="/academic/transport"
      routeLabel="Gestão Académica"
      subRoute="Transporte Escolar & Rotas"
    >
      <TransportPageContent />
    </PageWrapper>
  );
}
