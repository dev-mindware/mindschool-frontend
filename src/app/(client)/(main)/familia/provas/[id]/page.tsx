"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { PageWrapper } from "@/components";
import { ExamTaker } from "@/modules/family/components/exam-taker";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tentativa = useSearchParams().get("tentativa") ?? undefined;
  return (
    <PageWrapper
      subRoute="Realizar Prova"
      segments={[
        { label: "Acompanhamento" },
        { label: "Provas Online", href: "/familia/provas" },
        { label: "Realizar Prova" },
      ]}
    >
      <ExamTaker examId={id} {...(tentativa ? { submissionId: tentativa } : {})} />
    </PageWrapper>
  );
}
