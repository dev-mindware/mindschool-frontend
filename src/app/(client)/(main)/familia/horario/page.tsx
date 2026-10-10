"use client";

import { PageWrapper } from "@/components";
import { FamilySchedule } from "@/modules/family/components/family-schedule";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Horário" description="As aulas de hoje, de amanhã e da semana.">
        {(ctx) => <FamilySchedule {...ctx} />}
      </FamilyShell>
    </PageWrapper>
  );
}
