"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
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
import { useRouter } from "next/navigation";
import { CloneInvoiceModal } from "../modals/clone-invoice-modal";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSubmitAgtDocument } from "@/hooks/agt";
import { useState } from "react";
import {
  ManagerAuthModal,
  MODAL_MANAGER_AUTH_ID,
} from "@/components/client/pos";
import { useModal } from "@/stores/modal/use-modal-store";

export function InvoiceReceiptList({ storeId }: { storeId?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: submitToAgt } = useSubmitAgtDocument();
  const { search } = useURLSearchParams("search_invoice-receipt");

  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useInvoiceFilters("invoice-receipt");
  const { handlerDetailsInvoice, handlerCloneInvoice } = useInvoiceActions();
  const { openModal } = useModal();

  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const {
    data: invoicesReceipts,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<InvoiceResponse>({
    endpoint: "/invoice/invoice-receipt",
    queryKey: ["invoice-receipt", storeId || ""],
    queryParams: { ...filters, search: debounceSearch, page, storeId },
  });

  const columns: Column<InvoiceResponse>[] = [
    { key: "number", header: "N.º da factura" },
    {
      key: "client",
      header: "Cliente",
      render: (_, item) => item?.client?.name ?? "N/A",
    },
    {
      key: "total",
      header: "Valor",
      render: (_, item) => formatCurrency(item.total),
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
              label: "Ver Factura",
              onClick: handlerDetailsInvoice,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Emitir Nota",
              onClick: (item) => {
                const isCashier = user?.role === "CASHIER";
                const route = isCashier
                  ? `/pos/movements/notes/${item.id}`
                  : `/documents/notes/${item.id}?invoiceType=invoice-receipt`;

                if (isCashier) {
                  setPendingRoute(route);
                  openModal(MODAL_MANAGER_AUTH_ID);
                } else {
                  router.push(route);
                }
              },
              icon: "StickyNote",
              variant: "default",
            },
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
      <RequestError
        refetch={refetch}
        message="Erro ao carregar os documentos"
      />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <InvoiceFiltersTSX type="invoice-receipt"  />
      {invoicesReceipts.length > 0 ? (
        <>
          <GenericTable<InvoiceResponse>
            page={page}
            data={invoicesReceipts}
            columns={columns}
            total={total}
            totalPages={totalPages}
            setPage={setPage}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
            emptyMessage="Nenhum documento encontrado"
          />
        </>
      ) : (
        <div className="justify-start mt-6 space-y-8">
          <EmptyState
            icon="FileText"
            title="Sem Documentos"
            description="Adicione novos documentos"
          />
        </div>
      )}
      <InvoicePreviewDrawer type="invoice-receipt" />
      <CloneInvoiceModal />
      <ManagerAuthModal
        onAuthenticated={() => {
          if (pendingRoute) router.push(pendingRoute);
        }}
      />
    </div>
  );
}
