"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  EmptyState,
  Badge,
  Button,
  Icon,
  ItemPaginationControls,
  TitleList,
} from "@/components";
import { useModal } from "@/stores";
import { useAuditFilters } from "@/hooks";
import { AuditFilters } from "./audit-filters";
import { AuditDetailModal } from "./audit-detail-modal";
import { AuditTrailResponse } from "@/types";
import { formatDateTime } from "@/utils";
import { ACTION_BADGES, ENTITY_LABELS } from "./constants";
import { getEntityIdentifier } from "./audit-diff-table";

export function AccessControlContent() {
  const { filters, page, setPage } = useAuditFilters();
  const { openModal } = useModal();

  const {
    data: logs,
    total,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<AuditTrailResponse>({
    endpoint: "/audit-trails",
    queryKey: ["audit-trails"],
    queryParams: {
      ...filters,
      page,
      limit: 20,
    },
  });

  const columns: Column<AuditTrailResponse>[] = [
    {
      key: "user",
      header: "Colaborador",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.user?.name || "N/A"}</span>
          <span className="text-xs text-muted-foreground">{item.user?.email || `ID: ${item.userId}`}</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => {
        const badge = ACTION_BADGES[item.action] || { variant: "default", label: item.action };
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
    {
      key: "entity",
      header: "Entidade",
      render: (_, item) => {
        const identifier = getEntityIdentifier(item);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {ENTITY_LABELS[item.entity] || item.entity}
            </span>
            {identifier ? (
              <span className="text-xs text-primary font-medium truncate max-w-[180px]" title={identifier}>
                {identifier}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]" title={item.entityId}>
                ID: {item.entityId}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "ipAddress",
      header: "IP de Origem",
      render: (val) => <span className="text-sm font-mono text-muted-foreground">{val || "-"}</span>,
    },
    {
      key: "createdAt",
      header: "Data / Hora",
      render: (val) => <span className="text-sm text-muted-foreground">{formatDateTime(val)}</span>,
    },
    {
      key: "actions",
      header: "Acções",
      render: (_, item) => (
        <Button variant="outline" size="sm" onClick={() => openModal("view-audit", item)}>
          <Icon name="Eye" className="w-4 h-4 mr-2" />
          Ver Detalhes
        </Button>
      ),
    },
  ];

  if (isLoading) return <ListSkeleton />;

  if (isError) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div data-tour="reports-access-header">
          <TitleList
            title="Acesso e Auditoria"
            suTitle="Acompanhe as actividades dos utilizadores, os registos de acesso e as alterações críticas de dados."
          />
        </div>
        <div className="rounded-lg border p-6 bg-card" data-tour="reports-access-filters">
          <AuditFilters />
        </div>
        <RequestError refetch={refetch} message="Não foi possível carregar os registos de auditoria" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div data-tour="reports-access-header">
          <TitleList
            title="Acesso e Auditoria"
            suTitle="Acompanhe as actividades dos utilizadores, os registos de acesso e as alterações críticas de dados."
          />
        </div>

        <div className="rounded-lg border p-6 bg-card shadow-sm" data-tour="reports-access-filters">
          <AuditFilters />
        </div>

        {logs.length === 0 ? (
          <div data-tour="reports-access-list">
            <EmptyState
              description="Não foi encontrado qualquer registo de auditoria com os filtros seleccionados."
              title="Sem Auditorias"
              icon="Activity"
            />
          </div>
        ) : (
          <div data-tour="reports-access-list">
            <GenericTable<AuditTrailResponse>
              page={page}
              data={logs}
              columns={columns}
              total={total}
              totalPages={totalPages}
              setPage={setPage}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
              emptyMessage="Nenhum registo de auditoria encontrado"
            />
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <ItemPaginationControls
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
            />
          </div>
        )}
      </div>

      <AuditDetailModal />
    </>
  );
}
