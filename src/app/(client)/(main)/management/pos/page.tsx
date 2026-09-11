import { PageWrapper } from "@/components";
import { PosManagementContent } from "@/components/client/management/pos/pos-management-content";

export default function PosPage() {
  return (
    <PageWrapper subRoute="Gestão de POS" onboardingTourId="pos-management">
      <PosManagementContent />
    </PageWrapper>
  );
}
