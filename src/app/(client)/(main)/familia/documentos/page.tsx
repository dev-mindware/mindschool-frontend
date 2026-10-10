"use client";

import { PageWrapper } from "@/components";
import { FamilyDocuments } from "@/modules/family/components/family-documents";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function FamilyDocumentsPage() {
  return (
    <PageWrapper>
      <FamilyShell title="Documentos e Pedidos" description="Peça declarações e certificados, acompanhe os pedidos e descarregue os documentos emitidos.">
        {(ctx) => <FamilyDocuments {...ctx} />}
      </FamilyShell>
    </PageWrapper>
  );
}
