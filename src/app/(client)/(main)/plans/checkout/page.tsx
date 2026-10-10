import { Suspense } from "react";
import { PageWrapper } from "@/components";
import { PlanCheckout } from "@/components/client/plans/plan-checkout";

export default function Page() {
  return (
    <PageWrapper routePath="/plans/checkout" routeLabel="Subscrição" subRoute="Checkout">
      <Suspense fallback={null}>
        <PlanCheckout />
      </Suspense>
    </PageWrapper>
  );
}
