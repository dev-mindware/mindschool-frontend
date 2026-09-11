import { useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersService } from "@/services/suppliers-service";
import { SucessMessage } from "@/utils/messages";
import { SupplierData, SupplierResponse, StockEntry } from "@/types";
import { useFetch } from "../common/use-fetch";
import { usePagination } from "../common/use-pagination";

export function useGetSupplierById(id: string) {
  const { data, error, isLoading, refetch } = useFetch<SupplierResponse>(
    `supplier-${id}`,
    `/suppliers/${id}`
  );

  return { supplier: data, error, isLoading, refetch };
}

export function useGetSuppliersSelect(enabled = true) {
  const pagination = usePagination<SupplierResponse>({
    endpoint: "/suppliers",
    queryKey: "suppliers",
    queryParams: {},
    enabled,
  });

  const supplierOptions = pagination.data.map((supplier) => ({
    label: supplier.name,
    value: supplier.id,
  }));

  return {
    ...pagination,
    supplierOptions,
    suppliers: pagination.data,
    // Backward compatibility
    error: pagination.isError,
    pagination: {
      page: pagination.page,
      totalPages: pagination.totalPages,
      total: pagination.total,
    },
  };
}


export function useAddSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SupplierData) => suppliersService.addSupplier(data),
    onSuccess: () => {
      SucessMessage("Fornecedor adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierData> }) =>
      suppliersService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersService.deleteSupplier(id),
    onSuccess: () => {
      SucessMessage("Fornecedor removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useAddSupplierStockEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => suppliersService.addStockEntry(data),
    onSuccess: () => {
      SucessMessage("Sessão de reabastecimento inserida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["supplier-items"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["supplier-stock-entries"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-normal"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-receipt"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-proforma"] });
      queryClient.invalidateQueries({ queryKey: ["receipt"] });
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
    },
  });
}

export function useGetSupplierStockEntries(supplierId: string) {
  return usePagination<StockEntry>({
    endpoint: `/suppliers/${supplierId}/stock-entries`,
    queryKey: ["supplier-stock-entries", supplierId],
    // queryParams: { limit: 100 },
  });
}

export function useDeleteSupplierItemsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      supplierId,
      itemIds,
    }: {
      supplierId: string;
      itemIds: string[];
    }) => suppliersService.deleteSupplierItemsBulk(supplierId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-items"] });
    },
  });
}

