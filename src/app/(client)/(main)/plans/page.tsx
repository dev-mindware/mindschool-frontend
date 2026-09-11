import { PageWrapper } from "@/components";
import { AvailablePlans } from "@/components/client/plans";

export default function Page() {
  return (
    <PageWrapper subRoute="Planos" onboardingTourId="plans">
      <AvailablePlans />
    </PageWrapper>
  );
}
