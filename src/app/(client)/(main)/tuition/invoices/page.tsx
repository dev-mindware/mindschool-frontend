import { PageWrapper } from "@/components";
import { TuitionInvoicesContent } from "@/components/client/tuition";

export default function TuitionInvoicesPage() {
  return (
    <PageWrapper
      routePath="/tuition"
      routeLabel="Propinas & Finanças"
      subRoute="Facturas & Recibos"
    >
      <TuitionInvoicesContent />
    </PageWrapper>
  );
}
