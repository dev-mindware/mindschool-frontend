import { useQuery } from "@tanstack/react-query";
import { banksService } from "@/services";
import { Bank } from "@/types";

export function useDefaultBank() {
  const { data, isLoading } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const res = await banksService.getBanks();
      return (res.data?.data ?? res.data) as Bank[];
    },
    staleTime: 1000 * 60 * 5, // 5 min — bank details rarely change
  });

  const defaultBank = data?.find((b) => b.isDefault) ?? data?.[0] ?? null;

  return { defaultBank, isLoading };
}
