"use client";

import { PageWrapper } from "@/components";
import { FamilyExams } from "@/modules/family/components/family-exams";
import { FamilyShell } from "@/modules/family/components/family-shell";

export default function Page() {
  return (
    <PageWrapper>
      <FamilyShell title="Provas Online" description="Provas publicadas para a turma." perStudent={false}>
        {() => <FamilyExams />}
      </FamilyShell>
    </PageWrapper>
  );
}
