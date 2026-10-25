import { PageWrapper } from "@/components";
import { ExamGradingPageContent } from "@/components/client/online-exams/exam-grading-page-content";

export default function ExamGradingPage() {
  return (
    <PageWrapper
      subRoute="Mesa de Correção"
      segments={[
        { label: "Avaliações & Pautas" },
        { label: "Provas Online", href: "/online-exams" },
        { label: "Mesa de Correção" },
      ]}
    >
      <ExamGradingPageContent />
    </PageWrapper>
  );
}
