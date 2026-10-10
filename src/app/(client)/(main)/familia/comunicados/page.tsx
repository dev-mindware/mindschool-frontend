"use client";

import { PageWrapper } from "@/components";
import { FamilyAnnouncements } from "@/modules/family/components/family-announcements";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Comunicados" description="Avisos e informações da escola." perStudent={false}>
        {() => <FamilyAnnouncements />}
      </FamilyShell>
    </PageWrapper>
  );
}
