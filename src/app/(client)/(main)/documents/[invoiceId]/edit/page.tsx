import { PageWrapper, ProformaEditContent } from "@/components";

type PageProps = {
  params: Promise<{ invoiceId: string }>;
};

export default async function InvoiceDetailsPage({ params }: PageProps) {
  const { invoiceId } = await params;

  return (
    <PageWrapper
      routePath="/documents"
      routeLabel="Documentos"
      subRoute="Editar Proforma"
      showSeparator={true}
      onboardingTourId="proforma-edit"
    >
      <ProformaEditContent invoiceId={invoiceId} />
    </PageWrapper>
  );
}
