import { PageWrapper } from "@/components";
import { OnlineExamsPageContent } from "@/components/client/online-exams/online-exams-page-content";

export default function OnlineExamsPage() {
  return (
    <PageWrapper
      routePath="/online-exams"
      routeLabel="Avaliação Digital"
      subRoute="Provas Online"
    >
      <OnlineExamsPageContent />
    </PageWrapper>
  );
}
