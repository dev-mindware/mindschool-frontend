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
  DeleteClientModal,
  DetailsClientModal,
  ClientModal,
  ClientsFiltersSkeleton,
} from "@/components";
import { ClientResponse } from "@/types";
import { excludeFinalConsumer, formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { ClientsFiltersTSX } from "./common";
import { useClientActions, useClientsFilters } from "@/hooks/entities";

export function ClientsList() {
  const { search } = useURLSearchParams("search-client");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useClientsFilters();
  const { handlerToggleStatusClient, handlerDetailsClient, handlerEditClient } =
    useClientActions();
  const {
    data: allClients,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<ClientResponse>({
    endpoint: "/clients",
    queryKey: ["clients"],
    queryParams: {
      ...filters,
      search: debounceSearch,
      page,
    },
  });
  const clients = excludeFinalConsumer(allClients);

  const columns: Column<ClientResponse>[] = [
    { key: "name", header: "Nome" },
    { key: "taxNumber", header: "NIF" },
    {
      key: "email",
      header: "Email",
      render: (_, item) => (
        <div className="text-sm text-foreground">{item.email ?? "------------"}</div>
      ),
    },
    {
      key: "phone",
      header: "Telefone",
      render: (_, item) => (
        <div className="text-sm text-foreground">{item.phone ?? "------------"}</div>
      ),
    },
    {
      key: "address",
      header: "Endereço",
      render: (_, item) => (
        <div className="text-sm text-foreground">{item.address ?? "------------"}</div>
      ),
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
      key: "status",
      header: "Status",
      render: (_, item) => (
        <ItemStatusBadge status={item.isActive ? "ACTIVE" : "INACTIVE"} />
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
              onClick: handlerDetailsClient,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditClient,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: item.isActive ? "Desactivar" : "Activar",
              onClick: handlerToggleStatusClient,
              icon: "CirclePower",
              variant: "default",
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="justify-start mt-6 space-y-8">
        <ClientsFiltersSkeleton />
        <ListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar os clientes" />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <div data-tour="clients-filters">
        <ClientsFiltersTSX />
      </div>

      {clients.length > 0 ? (
        <GenericTable<ClientResponse>
          page={page}
          data={clients}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum cliente encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione novos clientes"
          title="Sem Clientes"
          icon="Users"
        />
      )}

      <DetailsClientModal />
      <DeleteClientModal />
      <ClientModal action="edit" />
    </div>
  );
}
