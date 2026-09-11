"use client";
import { PageWrapper, MovementsContent } from "@/components"
import { useIsMobile } from "@/hooks/use-mobile";

export default function Page() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MovementsContent />;
  }

  return (
    <PageWrapper
      routeLabel="Movimentos de Caixa"
      subRoute="Movimentos de Caixa"
      onboardingTourId="pos-movements"
    >
        <MovementsContent />
    </PageWrapper>
  )
}
