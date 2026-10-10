import { Suspense } from "react";
import { PageWrapper } from "@/components";
import { ReportCardsPageContent } from "@/components/client/certificates/report-cards/report-cards-page-content";

export default function ReportCardsPage() {
  return (
    <PageWrapper>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">A carregar boletim de notas...</div>}>
        <ReportCardsPageContent />
      </Suspense>
    </PageWrapper>
  );
}
