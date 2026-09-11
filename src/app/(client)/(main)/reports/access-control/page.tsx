import { PageWrapper, AccessControlContent } from "@/components";

export default function AccessControlPage() {
  return (
    <PageWrapper subRoute="Acesso e Auditoria" onboardingTourId="reports-access-control">
      <AccessControlContent />
    </PageWrapper>
  );
}
