import { usePagination } from "@/hooks/common";
import { ItemData } from "@/types";

export function useProductsPaginatedSelect(
  page: number = 1,
  limit: number = 10,
  enabled: boolean = true
) {
  const pagination = usePagination<ItemData>({
    endpoint: "/items",
    queryKey: ["items-paginated-select", String(page), String(limit)],
    queryParams: {
      page,
      limit,
      type: "PRODUCT",
    },
    enabled,
  });

  const productOptions =
    pagination.data?.map((item) => ({
      label: `${item.name} (${item.sku || "S/N"})`,
      value: item.id,
    })) || [];

  return {
    ...pagination,
    products: pagination.data,
    productOptions,
    paginationConfig: {
      page: pagination.page,
      totalPages: pagination.totalPages,
    },
  };
}
