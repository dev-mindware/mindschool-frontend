import { PageWrapper } from "@/components";
import { TuitionPlansContent } from "@/components/client/tuition";

export default function TuitionPlansPage() {
  return (
    <PageWrapper
      routePath="/tuition"
      routeLabel="Propinas & Finanças"
      subRoute="Tabelas de Preço"
    >
      <TuitionPlansContent />
    </PageWrapper>
  );
}
