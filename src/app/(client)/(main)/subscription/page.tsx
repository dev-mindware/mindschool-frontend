import { PageWrapper } from "@/components";
import { SubscriptionManager } from "@/components/client/subscription/subscription-manager";

export default function SubscriptionPage() {
  return (
    <PageWrapper subRoute="Subscrição" routeLabel="subscription">
      <SubscriptionManager />
    </PageWrapper>
  );
}
