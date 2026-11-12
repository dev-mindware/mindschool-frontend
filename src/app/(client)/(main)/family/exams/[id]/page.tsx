"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { PageWrapper } from "@/components";
import { ExamTaker } from "@/modules/family/components/exam-taker";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const attempt = useSearchParams().get("attempt") ?? undefined;
  return (
    <PageWrapper
      subRoute="Realizar Prova"
      segments={[
        { label: "Acompanhamento" },
        { label: "Provas Online", href: "/family/exams" },
        { label: "Realizar Prova" },
      ]}
    >
      <ExamTaker examId={id} {...(attempt ? { submissionId: attempt } : {})} />
    </PageWrapper>
  );
}
