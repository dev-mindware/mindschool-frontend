import { usePagination } from "@/hooks/common";
import { CashierResponse } from "@/types/collaborators";

export function useGetCashiersPaginated(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  storeId?: string,
) {
  const queryParams: any = {
    role: "CASHIER",
    page,
    limit,
    search,
  };

  if (storeId) {
    queryParams.storeId = storeId;
  }

  return usePagination<CashierResponse>({
    endpoint: "/users",
    queryKey: ["cashiers-paginated", storeId ?? ""],
    queryParams,
  });
}
