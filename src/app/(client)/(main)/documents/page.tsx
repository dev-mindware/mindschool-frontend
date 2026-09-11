import { PageWrapper } from "@/components";
import { DocumentList } from "@/components/client";

export default function Page() {
  return (
    <PageWrapper subRoute="Documentos" onboardingTourId="documents-list">
      <DocumentList />
    </PageWrapper>
  );
}
