"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  ItemStatusBadge,
  EmptyState,
  ButtonOnlyAction,
} from "@/components";
import { useDebounce } from "use-debounce";
import { StoresFiltersTSX } from "./common";
import {
  StoreModal,
  DeleteStoreModal,
  DetailsStoreModal,
} from "./stores-modals";
import { useStoreActions } from "@/hooks/entities/use-store-actions";
import { useStoresFilters } from "@/hooks/entities/stores-filters";
import { StoreResponse } from "@/types";

export function StoresList() {
  const { search } = useURLSearchParams("search");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useStoresFilters();
  const {
    handlerDeleteStore,
    handlerDetailsStore,
    handlerEditStore,
    toggleStatusStore,
  } = useStoreActions();

  const {
    data: allStores,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<StoreResponse>({
    endpoint: "/stores",
    queryKey: ["stores"],
    queryParams: {
      ...filters,
      search: debounceSearch,
      page,
    },
  });

  const columns: Column<StoreResponse>[] = [
    { key: "name", header: "Nome da Loja" },
    {
      key: "code",
      header: "Estabelecimento",
      render: (_, item) => (
        <div className="font-mono text-sm font-semibold">
          {item.code || "SEDE"}
        </div>
      ),
    },
    {
      key: "gerente",
      header: "Gerente",
      render: (_, item) => (
        <div className="font-medium">{item?.name ?? "----------"}</div> // Ajustar se tiver gerente no back
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (_, item) => (
        <div className="font-medium">{item?.email ?? "----------"}</div> // Ajustar se tiver gerente no back
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      render: (_, item) => (
        <div className="font-medium">{item?.phone ?? "----------"}</div> // Ajustar se tiver gerente no back
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (_, item) => <ItemStatusBadge status={item.isActive ? "ACTIVE" : "INACTIVE"} />,
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
              onClick: handlerDetailsStore,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditStore,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: item.isActive ? "Desactivar" : "Activar",
              onClick: toggleStatusStore,
              icon: "CirclePower",
              variant: "default",
            },
            {
              label: "Apagar",
              onClick: handlerDeleteStore,
              icon: "Trash2",
              variant: "destructive",
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return (
      <RequestError
        refetch={refetch}
        message="Erro ao carregar as lojas"
      />
    );
  }

  if (allStores.length === 0)
    return (
      <div className="justify-start mt-6 space-y-8">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <StoresFiltersTSX />
          </div>
        </div>
        <EmptyState
          description="Adicione novas lojas"
          title="Sem Lojas"
          icon="Store"
        />
      </div>
    );

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between sm:gap-4">
          <StoresFiltersTSX />
        </div>
      </div>

      <GenericTable<StoreResponse>
        page={page}
        data={allStores}
        columns={columns}
        total={total}
        totalPages={totalPages}
        setPage={setPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhuma loja encontrada"
      />

      <DetailsStoreModal />
      <DeleteStoreModal />
      <StoreModal action="edit" />
    </div>
  );
}

