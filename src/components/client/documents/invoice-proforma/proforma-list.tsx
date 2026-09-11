"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  EmptyState,
  RequestError,
  GenericTable,
  ListSkeleton,
  ButtonOnlyAction,
  ProformaPreviewDrawer,
  InvoiceFiltersSkeleton,
} from "@/components";
import { InvoiceResponse } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { InvoiceFiltersTSX } from "../common";
import { useInvoiceFilters, useProformaActions } from "@/hooks";
import { DeleteProformaModal, ConvertProformaModal, DocumentSuccessModal } from "../modals";
import { useRouter } from "next/navigation";

export function ProformaList({ storeId }: { storeId?: string }) {
  const router = useRouter();
  const { search } = useURLSearchParams("search_proforma");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useInvoiceFilters("proforma");
  const { handlerDetailsProforma, handlerConvertProforma } =
    useProformaActions();
  const {
    data: proformas,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<InvoiceResponse>({
    endpoint: "/invoice/proforma",
    queryKey: ["invoice-proforma", storeId || ""],
    queryParams: { ...filters, search: debounceSearch, page, storeId },
  });

  const columns: Column<InvoiceResponse>[] = [
    { key: "number", header: "N° da Proforma" },
    {
      key: "client",
      header: "Cliente",
      render: (_, item) => item?.client?.name ?? "N/A",
    },
    {
      key: "total",
      header: "Valor",
      render: (_, item) => `${formatCurrency(item.total)}`,
    },
    {
      key: "items",
      header: "Itens",
      render: (_, item) => item.items.length,
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
              label: "Ver Proforma",
              onClick: handlerDetailsProforma,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Converter em factura",
              onClick: handlerConvertProforma,
              icon: "FileCheck",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: (item) => {
                router.push(`/documents/${item.id}/edit`);
              },
              icon: "Pencil",
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
        <InvoiceFiltersSkeleton />
        <ListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError refetch={refetch} message="Erro ao carregar as proformas" />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <InvoiceFiltersTSX type="proforma" />
      {proformas.length > 0 ? (
        <>
          <GenericTable<InvoiceResponse>
            page={page}
            data={proformas}
            columns={columns}
            total={total}
            totalPages={totalPages}
            setPage={setPage}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
            emptyMessage="Nenhuma proforma encontrada"
          />
        </>
      ) : (
        <div className="justify-start mt-6 space-y-8">
          <EmptyState
            description="Nenhuma proforma encontrada"
            title="Sem Proformas"
            icon="FileText"
          />
        </div>
      )}

      <ProformaPreviewDrawer />
      <ConvertProformaModal />
      <DocumentSuccessModal />
    </div>
  );
}
