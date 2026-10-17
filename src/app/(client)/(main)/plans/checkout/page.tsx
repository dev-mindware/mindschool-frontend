import { Suspense } from "react";
import { PageWrapper } from "@/components";
import { PlanCheckout } from "@/components/client/plans/plan-checkout";

export default function Page() {
  return (
    <PageWrapper
      subRoute="Checkout"
      segments={[
        { label: "Subscrição" },
        { label: "Planos", href: "/plans" },
        { label: "Checkout" },
      ]}
    >
      <Suspense fallback={null}>
        <PlanCheckout />
      </Suspense>
    </PageWrapper>
  );
}
