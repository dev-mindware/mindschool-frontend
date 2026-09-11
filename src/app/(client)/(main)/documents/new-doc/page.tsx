import { PageWrapper } from "@/components";
import { AddDocuments } from "@/components/client/documents/add-document";

export default function AddDocsPage() {
  return (
    <PageWrapper
      routePath="/documents?tab=invoice"
      routeLabel="Documentos"
      subRoute="Novo Documento"
      showSeparator={true}
      onboardingTourId="normal-invoice"
    >
      <AddDocuments />
    </PageWrapper>
  );
}
