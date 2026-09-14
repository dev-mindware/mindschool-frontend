import { PageWrapper } from "@/components";
import { TuitionPaymentsContent } from "@/components/client/tuition";

export default function TuitionPaymentsPage() {
  return (
    <PageWrapper
      routePath="/tuition/payments"
      routeLabel="Propinas & Finanças"
      subRoute="Propinas"
    >
      <TuitionPaymentsContent />
    </PageWrapper>
  );
}
