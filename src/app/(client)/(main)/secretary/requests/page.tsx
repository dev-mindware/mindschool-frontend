import { PageWrapper } from "@/components";
import { SecretaryRequestsContent } from "@/components/client/secretary/requests";

export default function SecretaryRequestsPage() {
  return (
    <PageWrapper
      routePath="/secretary/requests"
      routeLabel="Documentos Oficiais"
      subRoute="Secretaria Digital & Protocolo Escolar"
    >
      <SecretaryRequestsContent />
    </PageWrapper>
  );
}
