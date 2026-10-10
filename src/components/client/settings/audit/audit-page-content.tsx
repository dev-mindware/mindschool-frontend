"use client";
import { formatDateTime } from "@/utils";

import { useState } from "react";
import { Badge, ButtonOnlyAction, DataList, EmptyState, FormModal, TitleList, type Column } from "@/components";
import { useAudit } from "@/hooks/school/use-admin-school";
import { adminSchoolService, type ApiAuditEvent } from "@/services/admin-school-service";
import { useModal } from "@/stores/modal/use-modal-store";

const MODULES = ["academico", "avaliacao", "pessoas", "financeiro", "documentos", "organizacao", "comunicacao", "relatorios"];
const ACTIONS = ["criacao", "actualizacao", "fecho", "reabertura", "anulacao"];
const label = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

type Detail = { before?: unknown; after?: unknown; reason?: string | null };

/** Registo de auditoria da escola (só leitura, sem segredos): quem fez o quê, quando e porquê. */
export function AuditPageContent() {
  const { events, hasMore, isLoading, forbidden } = useAudit({});
  const { openModal } = useModal();
  const [current, setCurrent] = useState<ApiAuditEvent | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  if (forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não consulta a auditoria." />;

  const open = (e: ApiAuditEvent) => {
    setCurrent(e);
    setDetail(null);
    openModal("settings-audit-detail");
    void adminSchoolService.auditEvent(e.id).then(setDetail);
  };

  const actors = [...new Map(events.map((e) => [e.actor.id, e.actor.full_name])).entries()];
  const entities = [...new Set(events.map((e) => e.entity_type))].sort();

  const columns: Column<ApiAuditEvent>[] = [
    { key: "occurred_at", header: "Quando", render: (_, e) => <span className="font-mono text-xs whitespace-nowrap">{formatDateTime(e.occurred_at)}</span> },
    { key: "actor.full_name", header: "Quem", render: (_, e) => e.actor.full_name },
    { key: "action", header: "Acção", render: (_, e) => <Badge variant="outline">{label(e.action)}</Badge> },
    { key: "entity_type", header: "Entidade", render: (_, e) => (<div className="flex flex-col"><span>{e.entity_type}</span><span className="text-xs text-muted-foreground">{label(e.module)}</span></div>) },
    { key: "reason", header: "Motivo", render: (_, e) => <span className="text-muted-foreground">{e.reason ?? "—"}</span> },
    { key: "ip", header: "IP", render: (_, e) => <span className="font-mono text-xs">{e.ip ?? "—"}</span> },
    { key: "action_menu", header: "Acção", render: (_, e) => <ButtonOnlyAction data={e} actions={[{ label: "Ver detalhe", icon: "Eye", onClick: open }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Auditoria" suTitle="Registo imutável das operações; cada perfil só vê o seu domínio. Os dados sensíveis aparecem redigidos." />

      <DataList<ApiAuditEvent>
        prefix="auditoria"
        rows={events}
        columns={columns}
        isLoading={isLoading}
        pageSize={15}
        searchPlaceholder="Pesquisar por autor, entidade ou motivo"
        searchText={(e) => `${e.actor.full_name} ${e.entity_type} ${e.reason ?? ""} ${e.request_id ?? ""}`}
        filters={[
          { key: "modulo", label: "Módulo", icon: "LayoutGrid", options: MODULES.map((m) => ({ value: m, label: label(m) })), match: (e, v) => e.module === v },
          { key: "accao", label: "Acção", icon: "Zap", options: ACTIONS.map((m) => ({ value: m, label: label(m) })), match: (e, v) => e.action === v },
          { key: "autor", label: "Autor", icon: "User", options: actors.map(([id, name]) => ({ value: id, label: name })), match: (e, v) => e.actor.id === v },
          { key: "entidade", label: "Entidade", icon: "Database", options: entities.map((m) => ({ value: m, label: m })), match: (e, v) => e.entity_type === v },
        ]}
        dateFilters={[{ key: "data", label: "Ocorrido", getDate: (e) => e.occurred_at }]}
        sorts={[
          { value: "data", label: "Data", compare: (a, b) => a.occurred_at.localeCompare(b.occurred_at) },
          { value: "autor", label: "Autor", compare: (a, b) => a.actor.full_name.localeCompare(b.actor.full_name) },
          { value: "entidade", label: "Entidade", compare: (a, b) => a.entity_type.localeCompare(b.entity_type) },
        ]}
        emptyTitle="Sem eventos"
        emptyDescription={hasMore ? "Há mais eventos no servidor." : "Não existem eventos para os filtros aplicados."}
        emptyIcon="ScrollText"
      />
      {hasMore && <p className="text-center text-xs text-muted-foreground">Mostram-se os 50 eventos mais recentes; refine pela data para ver períodos anteriores.</p>}

      <FormModal id="settings-audit-detail" title="Detalhe do evento" description={current ? `${label(current.action)} em ${current.entity_type} por ${current.actor.full_name}` : undefined} size="lg" readOnly onSubmit={() => undefined}>
        <div className="sm:col-span-2 grid gap-3 text-xs md:grid-cols-2">
          {!detail && <p className="text-muted-foreground">A carregar…</p>}
          {detail && (
            <>
              <div><p className="mb-1 font-semibold">Antes</p><pre className="max-h-72 overflow-auto rounded bg-muted p-2">{JSON.stringify(detail.before ?? null, null, 2)}</pre></div>
              <div><p className="mb-1 font-semibold">Depois</p><pre className="max-h-72 overflow-auto rounded bg-muted p-2">{JSON.stringify(detail.after ?? null, null, 2)}</pre></div>
            </>
          )}
        </div>
      </FormModal>
    </div>
  );
}
