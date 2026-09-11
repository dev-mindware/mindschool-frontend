"use client";

import {
  Button,
  Column,
  EmptyState,
  GenericTable,
  ListSkeleton,
  RequestError,
  Badge,
  Icon,
  Input,
} from "@/components";
import {
  useAgtErrors,
  useSubmitAgtDocument,
  usePollAgtDocument,
  useAgtActions,
} from "@/hooks/agt";
import type { AgtError } from "@/types";
import { formatDateTime } from "@/utils";
import { useState } from "react";
import { useDebounce } from "use-debounce";

export function AgtErrorsList() {
  const [search, setSearch] = useState("");
  const [debounceSearch] = useDebounce(search, 300);
  const [selectedOrigin, setSelectedOrigin] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const {
    data: errors,
    total,
    totalPages,
    page,
    setPage,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = useAgtErrors({
    search: debounceSearch.trim() || undefined,
    origin: selectedOrigin !== "ALL" ? selectedOrigin : undefined,
    severity: selectedSeverity !== "ALL" ? selectedSeverity : undefined,
  });

  const { mutateAsync: submitDoc, isPending: isSubmitting } =
    useSubmitAgtDocument();
  const { mutateAsync: pollDoc, isPending: isPolling } = usePollAgtDocument();
  const { handlerConsultInvoice } = useAgtActions();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  async function handleRetry(item: AgtError) {
    const docId = item.invoiceId || item.creditNoteId;
    if (!docId) return;
    const type = item.creditNoteId ? "creditNote" : "invoice";

    setActiveActionId(item.id);
    try {
      await submitDoc({ id: docId, type });
      await refetch();
    } finally {
      setActiveActionId(null);
    }
  }

  async function handlePoll(item: AgtError) {
    const docId = item.invoiceId || item.creditNoteId;
    if (!docId) return;
    const type = item.creditNoteId ? "creditNote" : "invoice";

    setActiveActionId(item.id);
    try {
      await pollDoc({ id: docId, type });
      await refetch();
    } finally {
      setActiveActionId(null);
    }
  }

  const columns: Column<AgtError>[] = [
    {
      key: "invoice",
      header: "Documento",
      render: (_, item) => {
        const docNumber =
          item.invoice?.number || item.creditNote?.number || "Sem n.º";
        const docType = item.creditNoteId ? "Nota de Crédito" : "Factura";
        const fiscalStatus =
          item.invoice?.agtStatus || item.creditNote?.agtStatus || "REJEITADO";

        return (
          <div className="space-y-1">
            <p className="font-medium text-sm text-foreground">{docNumber}</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{docType}</span>
              <Badge
                variant={
                  fiscalStatus === "REJECTED"
                    ? "destructive"
                    : fiscalStatus === "TECHNICAL_ERROR"
                      ? "pending"
                      : "outline"
                }
                className="text-[10px] px-1.5 py-0"
              >
                {fiscalStatus === "REJECTED"
                  ? "Rejeitado"
                  : fiscalStatus === "TECHNICAL_ERROR"
                    ? "Erro Técnico"
                    : fiscalStatus === "SUBMITTED"
                      ? "Submetido"
                      : fiscalStatus === "VALIDATED"
                        ? "Validado"
                        : "Pendente"}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      key: "code",
      header: "Código / Origem",
      render: (_, item) => (
        <div className="space-y-1">
          <p className="font-mono text-xs font-semibold">{item.code}</p>
          <div className="flex items-center gap-1.5">
            <Badge
              variant={
                item.origin === "SUBMISSION"
                  ? "destructive"
                  : item.origin === "VALIDATION"
                    ? "outline"
                    : "default"
              }
              className="text-[10px] px-1.5 py-0"
            >
              {item.origin === "SUBMISSION"
                ? "Submissão"
                : item.origin === "VALIDATION"
                  ? "Validação"
                  : item.origin}
            </Badge>
            {item.retryable && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                Reprocessável
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "message",
      header: "Motivo / Descrição da Rejeição",
      render: (_, item) => (
        <div className="space-y-0.5 max-w-md">
          <p className="text-sm font-medium text-foreground line-clamp-2">
            {item.message || "Inconformidade fiscal identificada pela AGT"}
          </p>
          {item.requestId && (
            <p className="font-mono text-xs text-muted-foreground truncate">
              ID do Pedido AGT: {item.requestId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severidade",
      render: (_, item) => {
        const severityMap: Record<
          string,
          {
            label: string;
            variant: "default" | "destructive" | "outline" | "pending" | "success";
          }
        > = {
          CRITICAL: { label: "Crítico", variant: "destructive" },
          HIGH: { label: "Alto", variant: "destructive" },
          MEDIUM: { label: "Médio", variant: "pending" },
          LOW: { label: "Baixo", variant: "outline" },
        };
        const conf = severityMap[item.severity] || {
          label: item.severity,
          variant: "outline",
        };
        return <Badge variant={conf.variant}>{conf.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "Data do Registo",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
    {
      key: "id",
      header: "Acções",
      render: (_, item) => {
        const docId = item.invoiceId || item.creditNoteId;
        const docNumber = item.invoice?.number || item.creditNote?.number;
        const isCurrentLoading =
          activeActionId === item.id && (isSubmitting || isPolling);

        if (!docId) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isCurrentLoading}
              onClick={() => handleRetry(item)}
              className="h-8 gap-1.5 px-2.5 text-xs font-medium"
            >
              <Icon
                name={isCurrentLoading ? "RefreshCw" : "Send"}
                className={`h-3.5 w-3.5 ${isCurrentLoading ? "animate-spin" : ""}`}
              />
              Reenviar
            </Button>
            {docNumber && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handlerConsultInvoice(docNumber)}
                className="h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Icon name="Search" className="h-3.5 w-3.5" />
                Consultar
              </Button>
            )}
          </div>
        );
      },
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
        message="Erro ao carregar os erros fiscais da AGT"
      />
    );
  }

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between">
        <div className="space-y-1 w-full sm:w-auto">
          <h3 className="text-lg font-semibold">Erros Fiscais e Inconformidades</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe os motivos de rejeição emitidos pela AGT e reenvie os documentos após correcção.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            className="w-full sm:w-auto gap-2"
          >
            <Icon name="RefreshCw" className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros em Português */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            name="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por número de documento, código de erro ou motivo..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="ALL">Todas as Origens</option>
            <option value="SUBMISSION">Submissão</option>
            <option value="VALIDATION">Validação</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="ALL">Todas as Severidades</option>
            <option value="CRITICAL">Crítico</option>
            <option value="HIGH">Alto</option>
            <option value="MEDIUM">Médio</option>
            <option value="LOW">Baixo</option>
          </select>
        </div>
      </div>

      {errors.length > 0 ? (
        <GenericTable<AgtError>
          page={page}
          data={errors}
          columns={columns}
          total={total}
          totalPages={totalPages}
          setPage={setPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhum erro fiscal encontrado"
        />
      ) : (
        <EmptyState
          description="Nenhuma inconformidade ou erro fiscal registado para os critérios selecionados."
          title="Tudo em conformidade fiscal"
          icon="CircleCheck"
        />
      )}
    </div>
  );
}
