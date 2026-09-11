import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/services/stock-service";
import { StockSummaryResponse } from "@/types/stock";

export function useStockSummary() {
  const { data, isLoading, isError, refetch } = useQuery<StockSummaryResponse>({
    queryKey: ["stocks", "summary"],
    queryFn: async () => {
      const response = await stockService.getSummary();
      return response.data;
    },
  });

  return {
    summary: data,
    isLoading,
    isError,
    refetch,
  };
}
