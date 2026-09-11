import { HeaderSubscription, SubscriptionPageContent } from "@/components";

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen min-w-screen bg-gray-50 dark:bg-background">
      <HeaderSubscription />
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <SubscriptionPageContent />
        </div>
      </div>
    </div>
  );
}
