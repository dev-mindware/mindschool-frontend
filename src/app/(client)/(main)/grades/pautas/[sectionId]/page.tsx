import { PageWrapper } from "@/components";
import { ConsolidatedPautaPageContent } from "@/components/client/grades/pautas/consolidated-pauta-page-content";

export default function ConsolidatedPautaPage() {
  return (
    <PageWrapper
      subRoute="Pauta Consolidada"
      segments={[
        { label: "Avaliações & Pautas" },
        { label: "Pautas Trimestrais", href: "/grades/pautas" },
        { label: "Pauta Consolidada" },
      ]}
    >
      <ConsolidatedPautaPageContent />
    </PageWrapper>
  );
}
