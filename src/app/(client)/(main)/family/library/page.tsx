"use client";

import { PageWrapper } from "@/components";
import { FamilyLibrary } from "@/modules/family/components/family-library";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Biblioteca" description="Peça livros e manuais, acompanhe os pedidos e renove os empréstimos.">
        {(ctx) => <FamilyLibrary {...ctx} />}
      </FamilyShell>
    </PageWrapper>
  );
}
