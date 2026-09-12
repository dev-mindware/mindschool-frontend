import { PageWrapper } from "@/components";
import { AvailablePlans } from "@/components/client/plans";

export default function Page() {
  return (
    <PageWrapper
      routePath="/plans"
      routeLabel="Subscrição"
      subRoute="Planos"
      onboardingTourId="plans"
    >
      <AvailablePlans />
    </PageWrapper>
  );
}
