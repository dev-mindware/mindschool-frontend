import { PageWrapper } from "@/components";
import { StudentsPageContent } from "@/components/client/students";

export default function StudentsListPage() {
  return (
    <PageWrapper onboardingTourId="students">
      <StudentsPageContent />
    </PageWrapper>
  );
}
