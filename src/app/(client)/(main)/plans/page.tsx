import { PageWrapper } from "@/components";
import { AvailablePlans } from "@/components/client/plans";

export default function Page() {
  return (
    <PageWrapper onboardingTourId="plans">
      <AvailablePlans />
    </PageWrapper>
  );
}
