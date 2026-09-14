import { PageWrapper } from "@/components";
import { TuitionCollectionsContent } from "@/components/client/tuition";

export default function TuitionCollectionsPage() {
  return (
    <PageWrapper
      routePath="/tuition"
      routeLabel="Propinas & Finanças"
      subRoute="Cobrança WhatsApp"
    >
      <TuitionCollectionsContent />
    </PageWrapper>
  );
}
