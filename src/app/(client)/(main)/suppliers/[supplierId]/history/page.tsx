import { PageWrapper } from "@/components";
import { SupplierStockHistoryPage } from "@/components/client/suppliers";

type PageProps = {
  params: Promise<{ supplierId: string }>;
};

export default async function SupplierStockHistoryRoute({ params }: PageProps) {
  const { supplierId } = await params;

  return (
    <PageWrapper
      routeLabel="Fornecedores"
      routePath="/suppliers"
      subRoute="Histórico de Stock"
      showSeparator={true}
      onboardingTourId="supplier-history"
    >
      <SupplierStockHistoryPage supplierId={supplierId} />
    </PageWrapper>
  );
}
