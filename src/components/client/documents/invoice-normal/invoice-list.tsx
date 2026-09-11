"use client";
import { usePagination } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  EmptyState,
  ButtonOnlyAction,
  InvoicePreviewDrawer,
  InvoiceFiltersSkeleton,
} from "@/components";
import { InvoiceResponse } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { DocumentStatusBadge, InvoiceFiltersTSX } from "../common";
import { useInvoiceActions, useInvoiceFilters } from "@/hooks/invoice";
import { GenerateReceiptModal } from "../modals/generate-receipt-modal";
import { CancelInvoiceModal } from "../modals/cancel-invoice-modal";
import { CloneInvoiceModal } from "../modals/clone-invoice-modal";
import { useRouter } from "next/navigation";
import { useURLSearchParams } from "@/hooks/common";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSubmitAgtDocument } from "@/hooks/agt";

export function InvoiceList({ storeId }: { storeId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: submitToAgt } = useSubmitAgtDocument();
  const { search } = useURLSearchParams("search_invoice");
  const { filters, page, setPage } = useInvoiceFilters("invoice");

  const [debounceSearch] = useDebounce(search, 200);
  const {
    handlerGenerateReceipt,
    handlerCancelInvoice,
    handlerDetailsInvoice,
    handlerCloneInvoice,
  } = useInvoiceActions();
  const {
    data: invoices,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<InvoiceResponse>({
    endpoint: "/invoice/normal",
    queryKey: ["invoice-normal", storeId || ""],
    queryParams: { ...filters, search: debounceSearch, page, storeId },
  });

  const columns: Column<InvoiceResponse>[] = [
    {
      key: "inv-number",
      header: "N.º da factura",
      render: (_, item) => item.number,
    },
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
      header: "Total de Itens",
      render: (_, item) => item.items.length,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <DocumentStatusBadge status={item.status} />,
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => formatDateTime(item.createdAt),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver factura",
              onClick: handlerDetailsInvoice,
              icon: "Eye",
              variant: "default",
            },
            ...(item.status === "DRAFT"
              ? [
                {
                  label: "Cancelar factura",
                  onClick: handlerCancelInvoice,
                  icon: "Ban",
                  variant: "destructive",
                } as const,
              ]
              : []),
            ...(item.status !== "PAID"
              ? [
                {
                  label: "Gerar Recibo",
                  onClick: handlerGenerateReceipt,
                  icon: "FileText",
                  variant: "default",
                } as const,
              ]
              : []),
            // Art. 8.º n.º 4 do D.P. 71/25: qualquer factura já emitida/enviada
            // só se rectifica ou anula por nota de crédito (não só as pagas).
            ...(item.status !== "DRAFT" && item.status !== "CANCELLED"
              ? [
                {
                  label: "Emitir Nota",
                  onClick: (item: InvoiceResponse) => {
                    router.push(`/documents/notes/${item.id}`);
                  },
                  icon: "StickyNote",
                  variant: "default",
                } as const,
              ]
              : []),
            ...(item.status === "PAID"
              ? [
                {
                  label: "Clonar Factura",
                  onClick: handlerCloneInvoice,
                  icon: "Copy",
                  variant: "default",
                } as const,
              ]
              : []),
            ...(user?.role === "OWNER" || user?.role === "ADMIN"
              ? [
                {
                  label: "Reenviar p/ AGT",
                  onClick: (item: InvoiceResponse) =>
                    submitToAgt({ id: item.id, type: "invoice" }),
                  icon: "Send",
                  variant: "default",
                } as const,
              ]
              : []),
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
      <RequestError refetch={refetch} message="Erro ao carregar as facturas" />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <InvoiceFiltersTSX type="invoice" />
      {invoices.length > 0 ? (
        <>
          <GenericTable<InvoiceResponse>
            page={page}
            data={invoices}
            columns={columns}
            total={total}
            totalPages={totalPages}
            setPage={setPage}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
            emptyMessage="Nenhum gerente encontrado"
          />
        </>
      ) : (
        <div className="justify-start mt-6 space-y-8">
          <EmptyState
            description="Adicione novas facturas"
            title="Sem Facturas"
            icon="FileText"
          />
        </div>
      )}

      {invoices.length !== 0 && (
        <>
          <GenerateReceiptModal />
          <CancelInvoiceModal />
          <CloneInvoiceModal />
          <InvoicePreviewDrawer type="invoice" />
        </>
      )}
    </div>
  );
}
