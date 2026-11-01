import { PageWrapper } from "@/components";
import { TuitionPaymentsContent } from "@/modules/finance/components";

export default function TuitionPaymentsPage() {
  return (
    <PageWrapper onboardingTourId="tuition">
      <TuitionPaymentsContent />
    </PageWrapper>
  );
}
