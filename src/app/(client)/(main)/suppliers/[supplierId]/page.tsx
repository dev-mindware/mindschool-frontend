import { PageWrapper } from "@/components";
import { SupplierDetailsContent } from "@/components/client/suppliers";

type PageProps = {
  params: Promise<{ supplierId: string }>;
};

export default async function SupplierDetailsPage({ params }: PageProps) {
  const { supplierId } = await params;

  return (
    <PageWrapper
      routeLabel="Fornecedores"
      routePath="/suppliers"
      subRoute="Detalhes do Fornecedor"
      showSeparator={true}
      onboardingTourId="supplier-details"
    >
      <SupplierDetailsContent supplierId={supplierId} />
    </PageWrapper>
  );
}
