"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { PageWrapper } from "@/components";
import { ExamTaker } from "@/modules/family/components/exam-taker";

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tentativa = useSearchParams().get("tentativa") ?? undefined;
  return (
    <PageWrapper routePath="/familia/provas" routeLabel="Provas Online" subRoute="Realizar prova" segments={[{ label: "Provas Online", href: "/familia/provas" }, { label: "Prova" }]}>
      <ExamTaker examId={id} {...(tentativa ? { submissionId: tentativa } : {})} />
    </PageWrapper>
  );
}
