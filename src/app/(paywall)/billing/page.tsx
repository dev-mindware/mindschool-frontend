import { SubscriptionManager } from "@/components/client/subscription/subscription-manager";

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-8 mb-auto w-full">
      <div className="max-w-6xl mx-auto">
        <SubscriptionManager />
      </div>
    </div>
  );
}
