import { ItemsPageContent, PageWrapper } from "@/components";

export default function Page() {
  return (
    <PageWrapper subRoute="Items" onboardingTourId="items">
      <ItemsPageContent />
    </PageWrapper>
  );
}
