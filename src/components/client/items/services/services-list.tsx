"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  ButtonOnlyAction,
  ProductCardSkeletonGrid,
  ItemsFiltersSkeleton,
} from "@/components";
import { ItemResponse } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils";
import { useItemsFilters, useServiceActions } from "@/hooks";
import { useDebounce } from "use-debounce";
import {
  DeleteItemModal,
  ItemPaginationControls,
  ItemsFiltersTSX,
  ItemStatusBadge,
  ItemViewToggle,
} from "../common";
import { ServiceCardView } from "./service-card-view";
import { DetailsServiceModal, ServiceModal } from "./service-modals";
import { currentStoreStore } from "@/stores";

export function ServiceList() {
  const { search } = useURLSearchParams(`service_search`);
  const [debounceSearch] = useDebounce(search, 200);
  const { currentStore } = currentStoreStore();
  const { filters, setViewMode, viewMode, page, setPage } =
    useItemsFilters("service");
  const { handlerDeleteService, handlerDetailsService, handlerEditService } =
    useServiceActions();
  const {
    data: items,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<ItemResponse>({
    endpoint: "/items",
    queryKey: ["items", "service"],
    queryParams: {
      ...filters,
      type: "SERVICE",
      search: debounceSearch,
      page,
      ...(currentStore?.id && { storeId: currentStore.id }),
    },
  });

  const columns: Column<ItemResponse>[] = [
    { key: "name", header: "Nome" },
    {
      key: "price",
      header: "Preço",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatCurrency(item.price)}
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (_, item) => (
        <div className="text-sm text-foreground">{item.sku || "---"}</div>
      ),
    },
    {
      key: "taxId",
      header: "Imposto",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {item.tax?.rate ? `${item.tax.rate}%` : "Isento"}
        </div>
      ),
    },

    {
      key: "status",
      header: "Estado",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatDateTime(item.createdAt)}
        </div>
      ),
    },

    {
      key: "action",
      header: "Acção",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver detalhes",
              onClick: handlerDetailsService,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditService,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: "Apagar",
              onClick: handlerDeleteService,
              icon: "Trash2",
              variant: "destructive",
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="justify-start mt-6 space-y-8">
        <ItemsFiltersSkeleton />
        {viewMode === "card" ? <ProductCardSkeletonGrid /> : <ListSkeleton />}
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar os produtos" />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex flex-col w-full items-center gap-3 sm:flex-row sm:justify-between sm:gap-4 sm:items-start">
          <ItemsFiltersTSX prefix="service" />
          <ItemViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {viewMode === "card" ? (
        <div
          className={`w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}
        >
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Nenhum serviço encontrado
            </p>
          ) : (
            items.map((service) => (
              <ServiceCardView key={service.id} service={service} />
            ))
          )}
        </div>
      ) : (
        <GenericTable<ItemResponse>
          page={page}
          data={items}
          total={total}
          setPage={setPage}
          columns={columns}
          totalPages={totalPages}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
        />
      )}

      {viewMode === "card" && totalPages > 1 && (
        <ItemPaginationControls
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
        />
      )}
      <DetailsServiceModal />
      <DeleteItemModal type="Serviço" />
      <ServiceModal action="edit" />
    </div>
  );
}
