import { CreditNotes, PageWrapper } from "@/components";

type PageProps = {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ invoiceType?: "invoice-receipt" | "invoice-normal" }>;
};

export default async function CreditsNotes({ params, searchParams }: PageProps) {
  const { invoiceId } = await params;
  const { invoiceType = "invoice-normal" } = await searchParams;

  return (
    <PageWrapper
      routePath="/documents"
      routeLabel="Documentos"
      subRoute="Notas de Crédito"
      showSeparator={true}
      onboardingTourId="credit-note"
    >
      <CreditNotes invoiceId={invoiceId} invoiceType={invoiceType} />
    </PageWrapper>
  );
}

//?invoiceType=invoice-receipt
