"use client";

import { PageWrapper } from "@/components";
import { FamilyPerformance } from "@/modules/family/components/family-performance";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Aproveitamento" description="Notas por trimestre, pedidos de reapreciação e assiduidade.">
        {(ctx) => <FamilyPerformance {...ctx} />}
      </FamilyShell>
    </PageWrapper>
  );
}
