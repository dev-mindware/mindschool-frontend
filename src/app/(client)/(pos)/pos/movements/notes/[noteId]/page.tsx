import { CreditNotes, PageWrapper } from "@/components";

type PageProps = {
  params: Promise<{ noteId: string }>;
};

export default async function POSCreditsNotes({ params }: PageProps) {
  const { noteId } = await params;

  return (
    <PageWrapper
      routePath="/pos/movements"
      routeLabel="Movimentos de Caixa"
      subRoute="Notas de Crédito"
      showSeparator={true}
    >
      <CreditNotes invoiceId={noteId} />
    </PageWrapper>
  );
}
