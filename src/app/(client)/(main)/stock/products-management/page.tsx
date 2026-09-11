import { Suspense } from "react";
import { Management, PageWrapper } from "@/components";

export default function ProdutsManagementPage() {
  return (
    <PageWrapper subRoute="Produtos">
      <Suspense fallback={<div>Loading...</div>}>
        <Management />
      </Suspense>
    </PageWrapper>
  );
}
