import { RequestError, TitleList } from "@/components/common";

export function RequestSalesError({ refetch }: { refetch: () => void }) {
  return (
    <div className="space-y-6">
      <TitleList
        title="Relatórios de Vendas"
        suTitle="Análise de Vendas por Período"
      />
      <RequestError
        refetch={refetch}
        message="Erro ao carregar relatórios de vendas"
      />
    </div>
  );
}
