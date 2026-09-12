import { PageWrapper } from "@/components";
import { SecretaryRequestsContent } from "@/components/client/secretary/requests";

export default function CertificateRequestsPage() {
  return (
    <PageWrapper
      routePath="/certificates/requests"
      routeLabel="Documentos Oficiais"
      subRoute="Secretaria Digital & Protocolo Escolar"
    >
      <SecretaryRequestsContent />
    </PageWrapper>
  );
}
