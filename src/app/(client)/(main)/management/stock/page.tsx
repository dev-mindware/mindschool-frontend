import { PageWrapper } from "@/components";
import { StockManagementContent } from "@/components/client/management";

export default function StockPage() {
  return (
    <PageWrapper subRoute="Gestão de stock" onboardingTourId="stock">
      <StockManagementContent />
    </PageWrapper>
  );
}
