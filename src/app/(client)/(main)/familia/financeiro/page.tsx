"use client";

import { PageWrapper } from "@/components";
import { FamilyFinance } from "@/modules/family/components/family-finance";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function FamilyFinancePage() {
  return (
    <PageWrapper>
      <FamilyShell title="Financeiro" description="O que está por pagar, o que já foi liquidado, recibos e extracto do ano.">
        {(ctx) => <FamilyFinance {...ctx} />}
      </FamilyShell>
    </PageWrapper>
  );
}
