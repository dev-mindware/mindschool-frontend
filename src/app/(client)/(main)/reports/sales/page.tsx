import { PageWrapper, SalesReportsContent } from "@/components";

export default function SalesReports() {
    return (
        <PageWrapper subRoute="Relatórios de Vendas" onboardingTourId="reports-sales">
            <SalesReportsContent />
        </PageWrapper>
    );
}
