"use client";
import { useDebounce } from "use-debounce";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  EmptyState,
  ButtonOnlyAction,
  CreditNotesFiltersTSX,
  CreditNotePreviewDrawer,
  InvoiceFiltersSkeleton,
  Icon,
} from "@/components";
import { formatCurrency, formatDateTime } from "@/utils";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import { DocumentStatusBadge } from "../common";
import { CreditNotesResponse } from "@/types/credit-note";
import { useCreditNotesActions, useCreditNotesFilters } from "@/hooks";

export function CreditNotesList({ storeId }: { storeId?: string }) {
  const { search } = useURLSearchParams("search-credit-note");
  const [debounceSearch] = useDebounce(search, 200);
  const { filters, page, setPage } = useCreditNotesFilters();
  const { handlerDetailsCreditNote } = useCreditNotesActions();
  const {
    data: creditNotes,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<CreditNotesResponse>({
    endpoint: "/credit-note",
    queryKey: ["credit-notes", storeId || ""],
    queryParams: { ...filters, search: debounceSearch, page, storeId },
  });

  const columns: Column<CreditNotesResponse>[] = [
    {
      key: "number",
      header: "N° da Nota",
      render: (_, item) => item.number,
    },
    {
      key: "invoiceNumber",
      header: "Factura",
      render: (_, item) => item.invoice.number || "N/A",
    },
    {
      key: "reason",
      header: "Motivo",
      render: (_, item) => <DocumentStatusBadge status={item.reason} />,
    },
    {
      key: "total",
      header: "Valor",
      render: (_, item) => (
        <span className="text-destructive">
          {formatCurrency(item.invoice.total)}
        </span>
      ),
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
              label: "Ver Nota",
              onClick: handlerDetailsCreditNote,
              icon: "Eye",
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
      <RequestError
        refetch={refetch}
        message="Erro ao carregar notas de crédito"
      />
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-start gap-3.5 p-4 rounded-xl bg-primary/5 border border-primary/20 text-foreground text-sm leading-relaxed shadow-xs">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <Icon name="Info" className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-primary">Como emitir uma Nota de Crédito?</h4>
          <p className="text-muted-foreground text-xs md:text-sm">
            Para emitir uma Nota de Crédito referente a uma venda existente, aceda à aba <strong className="text-foreground font-semibold">Factura</strong> ou <strong className="text-foreground font-semibold">Factura Recibo</strong>, clique nos <strong className="text-foreground font-semibold">3 pontos (...)</strong> da factura pretendida na tabela e escolha a opção <strong className="text-primary font-semibold">"Emitir Nota de Crédito"</strong>.
          </p>
        </div>
      </div>

      <CreditNotesFiltersTSX />
      {creditNotes.length > 0 ? (
        <>
          <GenericTable<CreditNotesResponse>
            page={page}
            total={total}
            columns={columns}
            setPage={setPage}
            data={creditNotes}
            totalPages={totalPages}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
            emptyMessage="Nenhuma nota de crédito encontrada"
          />
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Sem Notas de Crédito"
            description="Nenhuma nota de crédito encontrada"
            icon="FileMinus"
          />
        </div>
      )}
      <CreditNotePreviewDrawer />
    </div>
  );
}
