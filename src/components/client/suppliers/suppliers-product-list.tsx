"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  EmptyState,
} from "@/components";
import { useDebounce } from "use-debounce";
import { SupplierItemsFiltersTSX } from "./common/supplier-items-filters";
import { useItemsFilters } from "@/hooks/items/use-items-filters";
import { ItemData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/utils";

export function SuppliersProductList({ supplierId }: { supplierId: string }) {
  const { search } = useURLSearchParams("search_supplier_items");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useItemsFilters("supplier_items");

  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
  } = usePagination<ItemData>({
    endpoint: `/suppliers/${supplierId}/items`,
    queryKey: ["supplier-items", supplierId],
    queryParams: {
      ...filters,
      search: debounceSearch,
      page,
    },
  });

  const columns: Column<ItemData>[] = [
    { key: "name", header: "Produto" },
    {
      key: "sku",
      header: "SKU",
      render: (_, item) => <span>{item.sku ?? "----------"}</span>,
    },
    {
      key: "price",
      header: "Preço",
      render: (_, item) => <span>{formatCurrency(item.price)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (_, item) => (
        <Badge variant={item.status === "ACTIVE" ? "default" : "secondary"}>
          {item.status === "ACTIVE" ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    { key: "quantity", header: "Qtd." },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => formatDateTime(item.createdAt),
    },
  ];

  if (isLoadingItems) return <ListSkeleton />;

  if (isErrorItems) {
    return (
      <RequestError
        message="Erro ao carregar os itens deste fornecedor"
        refetch={refetchItems}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SupplierItemsFiltersTSX />

      {items.length > 0 ? (
        <GenericTable<ItemData>
          page={page}
          data={items}
          total={total}
          columns={columns}
          setPage={setPage}
          totalPages={totalPages}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum produto listado para este fornecedor."
        />
      ) : (
        <EmptyState
          description="Nenhum produtos deste fornecedor."
          title="Sem Produtos"
          icon="Package"
        />
      )}
    </div>
  );
}
