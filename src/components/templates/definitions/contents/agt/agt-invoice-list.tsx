"use client";

import {
  Badge,
  Button,
  ButtonOnlyAction,
  Column,
  EmptyState,
  GenericTable,
  ListSkeleton,
  RequestError,
} from "@/components";
import { useAgtActions, useAgtInvoices } from "@/hooks/agt";
import type { AgtInvoice } from "@/types";
import { formatCurrency } from "@/utils";
import { AgtInvoiceFilters } from "./agt-invoice-filters";

function getStatusBadge(status: string) {
  switch (status) {
    case "N":
      return <Badge variant="secondary">Normal</Badge>;
    case "A":
      return <Badge variant="destructive">Anulada</Badge>;
    case "S":
      return <Badge variant="outline">Substituída</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function AgtInvoiceList() {
  const { handlerConsultInvoice } = useAgtActions();
  const {
    data: invoices,
    total,
    totalPages,
    page,
    setPage,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = useAgtInvoices();

  const columns: Column<AgtInvoice>[] = [
    {
      key: "type",
      header: "Tipo",
      render: (_, item) => item.type,
    },
    {
      key: "number",
      header: "Número",
      render: (_, item) => (
        <span className="font-mono text-sm">{item.number}</span>
      ),
    },
    {
      key: "date",
      header: "Data",
      render: (_, item) => item.date,
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => getStatusBadge(item.status),
    },
    {
      key: "total",
      header: "Total líquido",
      render: (_, item) => formatCurrency(item.total),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Consultar",
              onClick: (invoice) => handlerConsultInvoice(invoice.number),
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
        <ListSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError
        refetch={refetch}
        message="Erro ao carregar as facturas da AGT"
      />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Repositório AGT</h3>
          <p className="text-sm text-muted-foreground">
            Consulte os documentos registados na base de dados da AGT.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          className="w-full sm:w-auto"
        >
          Actualizar
        </Button>
      </div>

      <AgtInvoiceFilters />

      {invoices.length > 0 ? (
        <GenericTable<AgtInvoice>
          page={page}
          data={invoices}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum documento encontrado"
        />
      ) : (
        <EmptyState
          description="Nenhum documento encontrado para este período"
          title="Sem documentos"
          icon="FileSearch"
        />
      )}
    </div>
  );
}
