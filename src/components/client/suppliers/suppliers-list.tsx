"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import { useRouter } from "next/navigation";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  EmptyState,
  ButtonOnlyAction,
} from "@/components";
import { useDebounce } from "use-debounce";
import { SupplierFiltersTSX } from "./common";
import {
  DeleteSupplierModal,
  RestockSupplierModal,
  EditSupplierModal,
} from "./suppliers-modals";
import { useSupplierActions } from "@/hooks/entities/use-supplier-actions";
import { useSuppliersFilters } from "@/hooks/entities/suppliers-filters";
import { SupplierResponse } from "@/types";
import { formatDateTime } from "@/utils";

export function SuppliersList() {
  const router = useRouter();
  const { search } = useURLSearchParams("search");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useSuppliersFilters();
  const {
    handlerDeleteSupplier,
    handlerEditSupplier,
    handlerRestockSupplier,
  } = useSupplierActions();

  const {
    data: allSuppliers,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<SupplierResponse>({
    endpoint: "/suppliers",
    queryKey: ["suppliers"],
    queryParams: {
      ...filters,
      search: debounceSearch,
      page,
    },
  });

  const columns: Column<SupplierResponse>[] = [
    { key: "name", header: "Nome" },
    { key: "taxNumber", header: "NIF" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Telefone" },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => formatDateTime(item.createdAt),
    },
    {
      key: "updatedAt",
      header: "Actualizado em",
      render: (_, item) => formatDateTime(item.updatedAt),
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
              onClick: (item) => router.push(`/suppliers/${item.id}`),
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Ver histórico de stock",
              onClick: (item) => router.push(`/suppliers/${item.id}/history`),
              icon: "History",
              variant: "default",
            },
            {
              label: "Nova Entrada de stock",
              onClick: handlerRestockSupplier,
              icon: "BadgePlus",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditSupplier,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: "Apagar",
              onClick: handlerDeleteSupplier,
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
        message="Erro ao carregar os fornecedores"
      />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      <SupplierFiltersTSX />

      {allSuppliers.length > 0 ? (
        <GenericTable<SupplierResponse>
          page={page}
          total={total}
          columns={columns}
          setPage={setPage}
          data={allSuppliers}
          totalPages={totalPages}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum fornecedor encontrado"
        />
      ) : (
        <EmptyState
          description="Adicione novos fornecedores"
          title="Sem Fornecedores"
          icon="Truck"
        />
      )}

      <DeleteSupplierModal />
      <RestockSupplierModal />
      <EditSupplierModal />
    </div>
  );
}
