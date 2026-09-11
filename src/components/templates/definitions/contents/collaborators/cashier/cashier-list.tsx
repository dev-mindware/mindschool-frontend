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
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { CashierFiltersTSX } from "./common";
import {
  CashierModal,
  DeleteCashierModal,
  DetailsCashierModal,
} from "./cashier-modals";
import { useCashierActions } from "@/hooks/collaborators/cashier/use-cashier-actions";
import { useCashierFilters } from "@/hooks/collaborators/cashier/cashier-filters";
import { CashierResponse } from "@/types/collaborators";

export function CashierList() {
  const { search } = useURLSearchParams("search");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useCashierFilters();
  const {
    handlerDeleteCashier,
    handlerDetailsCashier,
    handlerEditCashier,
    toggleStatusCashier,
  } = useCashierActions();

  const {
    data: allCashiers,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<CashierResponse>({
    endpoint: "/users",
    queryKey: ["cashiers"],
    queryParams: {
      ...filters,
      role: "CASHIER",
      search: debounceSearch,
      page,
    },
  });

  const filteredList =
    allCashiers?.filter((user) => user.role !== "OWNER") || [];

  const columns: Column<CashierResponse>[] = [
    { key: "name", header: "Nome" },
    {
      key: "role",
      header: "Função",
      render: (_, item) => {
        if (item.role === "MANAGER") return "GERENTE";
        if (item.role === "CASHIER") return "CAIXA";
        return item.role;
      },
    },
    {
      key: "email",
      header: "Email",
    },
    { key: "phone", header: "Telefone" },
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
      key: "status",
      header: "Status",
      render: (_, item) => <ItemStatusBadge status={item.status} />,
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
              onClick: handlerDetailsCashier,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditCashier,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: item.status === "ACTIVE" ? "Desactivar" : "Activar",
              onClick: toggleStatusCashier,
              icon: "CirclePower",
              variant: "default",
            },
            { type: "separator" },
            {
              label: "Apagar",
              onClick: handlerDeleteCashier,
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
        message="Erro ao carregar os colaboradores"
      />
    );
  }

  if (filteredList.length === 0)
    return (
      <div className="justify-start mt-6 space-y-8">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <CashierFiltersTSX />
          </div>
        </div>
        <EmptyState
          description="Adicione novos caixas"
          title="Sem Caixas"
          icon="Users"
        />
      </div>
    );

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between sm:gap-4">
          <CashierFiltersTSX />
        </div>
      </div>

      <GenericTable<CashierResponse>
        page={page}
        data={filteredList}
        columns={columns}
        total={total}
        totalPages={totalPages}
        setPage={setPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhum caixa encontrado"
      />

      <DetailsCashierModal />
      <DeleteCashierModal />
      <CashierModal action="edit" />
    </div>
  );
}
