import { useFetch } from "../common/use-fetch";
import { usePagination } from "../common/use-pagination";
import { ItemResponse } from "@/types/items";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { currentStoreStore } from "@/stores";

interface ItemsPageResponse {
  data?: ItemResponse[];
  items?: ItemResponse[];
  totalPages?: number;
  total_pages?: number;
}

function getItemsPage(response: ItemsPageResponse | ItemResponse[]) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  return [];
}

export function useGetProductCountsByCategory() {
  const { currentStore } = currentStoreStore();

  return useQuery({
    queryKey: ["items", "pos-product-counts", currentStore?.id],
    enabled: !!currentStore?.id,
    queryFn: async () => {
      const limit = 100;
      const params = {
        page: 1,
        limit,
        type: "PRODUCT",
        storeId: currentStore?.id,
      };
      const firstResponse = await api.get<ItemsPageResponse | ItemResponse[]>(
        "/items",
        { params },
      );
      const firstPage = firstResponse.data;
      const totalPages = Array.isArray(firstPage)
        ? 1
        : (firstPage.totalPages ?? firstPage.total_pages ?? 1);
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
          api.get<ItemsPageResponse | ItemResponse[]>("/items", {
            params: { ...params, page: index + 2 },
          }),
        ),
      );
      const products = [
        ...getItemsPage(firstPage),
        ...remainingPages.flatMap((response) => getItemsPage(response.data)),
      ];

      return products.reduce<Record<string, number>>((counts, product) => {
        if (product.categoryId) {
          counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
        }
        return counts;
      }, {});
    },
  });
}

export function useGetItems(params?: {
  search?: string;
  categoryId?: string;
  type?: string;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.set("search", params.search);
  if (params?.categoryId) queryParams.set("categoryId", params.categoryId);
  if (params?.type) queryParams.set("type", params.type);
  queryParams.set("page", "1");
  queryParams.set("limit", (params?.limit || 100).toString());

  const { data, error, isLoading, refetch } = useFetch<any>(
    `items-for-pos-${params?.search || ""}-${params?.categoryId || ""}-${
      params?.type || ""
    }`,
    `/items?${queryParams.toString()}`,
  );

  const items = data?.data || [];
  return { items, error, isLoading, refetch };
}

export function useGetItemsPaginated(
  page: number = 1,
  limit: number = 10,
  params?: {
    search?: string;
    categoryId?: string;
    type?: string;
  },
) {
  return usePagination<ItemResponse>({
    endpoint: "/items",
    queryKey: ["items-paginated"],
    queryParams: {
      page,
      limit,
      ...params,
    },
  });
}
