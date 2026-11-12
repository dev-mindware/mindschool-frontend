"use client";

import { PageWrapper } from "@/components";
import { FamilyShell } from "@/modules/family/components/family-shell";
import { FamilySubjects } from "@/modules/family/components/family-subjects";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Disciplinas" description="Professores, carga horária e últimas médias.">
        {(ctx) => <FamilySubjects {...ctx} />}
      </FamilyShell>
    </PageWrapper>
  );
}
