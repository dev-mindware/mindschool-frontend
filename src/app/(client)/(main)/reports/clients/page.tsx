import { PageWrapper, ClientsReportsContent } from "@/components";

export default function ClientsReports() {
  return (
    <PageWrapper subRoute="Relatórios de Clientes" onboardingTourId="reports-clients">
      <ClientsReportsContent />
    </PageWrapper>
  );
}
