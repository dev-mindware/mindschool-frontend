import { ReactNode } from "react";
import { PaywallHeader } from "../../components/guards/paywall-header";

export default function PaywallLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-background flex flex-col">
      <PaywallHeader />
      <main className="flex-1 flex flex-col items-center">{children}</main>
    </div>
  );
}
