import { PageWrapper } from "@/components";
import { CertificatesPageContent } from "@/components/client/certificates/certificates-page-content";

export default function CertificatesDeclarationsPage() {
  return (
    <PageWrapper
      routePath="/certificates/declarations"
      routeLabel="Documentos Oficiais"
      subRoute="Declarações & Certificados"
    >
      <CertificatesPageContent />
    </PageWrapper>
  );
}
