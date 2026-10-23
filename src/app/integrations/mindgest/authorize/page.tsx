import type { Metadata } from "next";
import { Suspense } from "react";
import { MindgestConsent } from "@/components/client/settings/integrations/mindgest-consent";

export const metadata: Metadata = { title: "Ligar ao MindGest", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MindgestConsent />
    </Suspense>
  );
}
