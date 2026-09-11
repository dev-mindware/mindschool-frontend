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
import { ManagerResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { ManagerFiltersTSX } from "./common";
import { useManagerActions, useManagerFilters } from "@/hooks/collaborators";
import {
  ManagerModal,
  DeleteManagerModal,
  DetailsManagerModal,
} from "./manager-modals";

export function ManagerList() {
  const { search } = useURLSearchParams("search");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useManagerFilters();
  const {
    handlerDeleteManager,
    handlerDetailsManager,
    handlerEditManager,
    handlerToggleStatusManager,
  } = useManagerActions();
  const {
    data: managers,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<ManagerResponse>({
    endpoint: "/users",
    queryKey: ["managers"],
    queryParams: { role: "MANAGER", ...filters, search: debounceSearch, page },
  });

  const columns: Column<ManagerResponse>[] = [
    { key: "name", header: "Nome" },
    {
      key: "role",
      header: "Função",
      render: (_, item) => {
        if (item.role === "MANAGER") return "GERENTE";
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
      render: (_, item) => <ItemStatusBadge status={item.status as any} />,
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
              onClick: handlerDetailsManager,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditManager,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: item.status === "ACTIVE" ? "Desactivar" : "Activar",
              onClick: handlerToggleStatusManager,
              icon: "CirclePower",
              variant: "default",
            },
            { type: "separator" },
            {
              label: "Apagar",
              onClick: handlerDeleteManager,
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
      <RequestError refetch={refetch} message="Erro ao carregar os gerentes" />
    );
  }

  if (managers?.length == 0)
    return (
      <div className="justify-start mt-6 space-y-8">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between sm:gap-4">
            <ManagerFiltersTSX />
          </div>
        </div>
        <EmptyState
          description="Adicione novos gerentes"
          title="Sem Gerentes"
          icon="Users"
        />
      </div>
    );

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex flex-col w-full gap-3 sm:flex-row sm:justify-between sm:gap-4">
          <ManagerFiltersTSX />
        </div>
      </div>

      <GenericTable<ManagerResponse>
        page={page}
        data={managers}
        columns={columns}
        total={total}
        totalPages={totalPages}
        setPage={setPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhum gerente encontrado"
      />

      <DetailsManagerModal />
      <DeleteManagerModal />
      <ManagerModal action="edit" />
    </div>
  );
}
