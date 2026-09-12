import { PageWrapper } from "@/components";
import { DropoutRiskPageContent } from "@/components/client/dropout-risk/dropout-risk-page-content";

export default function DropoutRiskPage() {
  return (
    <PageWrapper
      routePath="/dropout-risk"
      routeLabel="Alerta Precoce"
      subRoute="Risco de Abandono"
    >
      <DropoutRiskPageContent />
    </PageWrapper>
  );
}
