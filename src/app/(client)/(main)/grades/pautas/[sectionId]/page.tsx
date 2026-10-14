import { PageWrapper } from "@/components";
import { ConsolidatedPautaPageContent } from "@/components/client/grades/pautas/consolidated-pauta-page-content";

export default function ConsolidatedPautaPage() {
  return (
    <PageWrapper
      segments={[
        { label: "Pautas", href: "/grades/pautas" },
        { label: "Pauta Consolidada" },
      ]}
    >
      <ConsolidatedPautaPageContent />
    </PageWrapper>
  );
}
