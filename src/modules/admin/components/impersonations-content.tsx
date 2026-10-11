"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, ButtonOnlyAction, ConfirmModal, DataList, EmptyState, TitleList, type Column } from "@/components";
import { adminImpersonationService, type AdminImpersonation } from "@/modules/admin/services/admin-impersonation-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MODAL = "admin-impersonation-revoke";
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" }) : "—");

/** Registo das personificações (activas e passadas): quem assumiu quem, onde, porquê, em que modo, e revogação imediata. */
export function ImpersonationsContent() {
  const qc = useQueryClient();
  const { openModal } = useModal();
  const q = useQuery({ queryKey: ["admin-impersonations"], queryFn: adminImpersonationService.list, staleTime: 15_000, retry: false });
  const [target, setTarget] = useState<AdminImpersonation | null>(null);
  const revoke = useMutation({ mutationFn: (id: string) => adminImpersonationService.revoke(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-impersonations"] }) });

  const columns: Column<AdminImpersonation>[] = [
    { key: "admin", header: "Administrador", render: (_, i) => (<div><p className="text-sm font-medium">{i.admin?.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{i.admin?.email}</p></div>) },
    { key: "target", header: "Personificou", render: (_, i) => (<div><p className="text-sm font-medium">{i.target?.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{i.target?.email} · {i.school?.name}</p></div>) },
    { key: "reason", header: "Motivo", render: (_, i) => <span className="line-clamp-2 max-w-xs text-xs" title={i.reason}>{i.reason}</span> },
    { key: "mode", header: "Modo", render: (_, i) => <Badge variant={i.mode === "escrita" ? "warning" : "secondary"}>{i.mode === "escrita" ? "Escrita" : "Leitura"}</Badge> },
    { key: "period", header: "Período", render: (_, i) => <span className="text-xs">{when(i.started_at)}<br />até {when(i.revoked_at ?? i.expires_at)}</span> },
    { key: "state", header: "Estado", render: (_, i) => i.active ? <Badge variant="success">Activa</Badge> : <Badge variant="outline">{i.revoked_at ? "Terminada" : "Expirada"}</Badge> },
    { key: "actions", header: "Acção", render: (_, i) => i.active ? <ButtonOnlyAction data={i} actions={[{ label: "Revogar agora", icon: "Ban", variant: "destructive", onClick: (x: AdminImpersonation) => { setTarget(x); openModal(MODAL); } }]} /> : null },
  ];

  if (q.isError) return <EmptyState icon="ShieldAlert" title="Área restrita" description="Esta área é só para a administração do sistema." />;

  return (
    <div className="space-y-6">
      <TitleList title="Personificações" suTitle="Todas as vezes que alguém da plataforma assumiu a identidade de um utilizador. Cada uma tem motivo, duração máxima de 30 minutos e fica na auditoria da escola. Para iniciar uma, use Utilizadores › Personificar." />
      <DataList
        prefix="personificacoes" rows={q.data ?? []} columns={columns} isLoading={q.isLoading} isError={q.isError} refetch={() => void q.refetch()}
        searchPlaceholder="Pesquisar por administrador, utilizador, escola ou motivo..."
        searchText={(i) => `${i.admin?.full_name ?? ""} ${i.admin?.email ?? ""} ${i.target?.full_name ?? ""} ${i.target?.email ?? ""} ${i.school?.name ?? ""} ${i.reason}`}
        filters={[{ key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "activa", label: "Activas" }, { value: "terminada", label: "Terminadas/expiradas" }], match: (i, v) => (v === "activa" ? i.active : !i.active) }, { key: "modo", label: "Modo", icon: "Pencil", options: [{ value: "leitura", label: "Leitura" }, { value: "escrita", label: "Escrita" }], match: (i, v) => i.mode === v }]}
        emptyTitle="Sem personificações" emptyDescription="Ainda ninguém assumiu a identidade de um utilizador." emptyIcon="UserCog"
      />
      <ConfirmModal
        id={MODAL} destructive title="Revogar personificação" description={target ? `A sessão de ${target.admin?.full_name ?? "administrador"} como ${target.target?.full_name ?? "utilizador"} termina imediatamente.` : ""}
        onConfirm={() => (target ? revoke.mutateAsync(target.id).then(() => { SucessMessage("Personificação revogada."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível revogar.")); throw e; }) : Promise.resolve())}
      />
    </div>
  );
}
