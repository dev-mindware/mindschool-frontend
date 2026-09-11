"use client";
import { PageWrapper, CounterContent } from "@/components"
import { useIsMobile } from "@/hooks/use-mobile";

export default function Page() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <CounterContent />;
  }

  return (
    <PageWrapper
      subRoute="Caixa"
      routeLabel="Caixa"
      variant="counter"
      onboardingTourId="pos-invoice"
    >
      <CounterContent />
    </PageWrapper>
  )
}
