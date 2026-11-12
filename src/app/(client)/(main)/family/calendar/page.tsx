"use client";

import { PageWrapper } from "@/components";
import { FamilyCalendar } from "@/modules/family/components/family-calendar";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Calendário" description="Eventos, provas, feriados e reuniões da escola." perStudent={false}>
        {() => <FamilyCalendar />}
      </FamilyShell>
    </PageWrapper>
  );
}
