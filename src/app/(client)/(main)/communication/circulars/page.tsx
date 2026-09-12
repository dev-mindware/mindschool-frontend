import { PageWrapper } from "@/components";
import { CommunicationPageContent } from "@/components/client/communication/circulars";

export default function CommunicationCircularsPage() {
  return (
    <PageWrapper
      routePath="/communication/circulars"
      routeLabel="Comunicação Escolar"
      subRoute="Circulares & Comunicados da Direcção"
    >
      <CommunicationPageContent />
    </PageWrapper>
  );
}
