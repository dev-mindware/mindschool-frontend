"use client";

import { useEffect, useState } from "react";
import { Badge, Button, ButtonOnlyAction, DataList, EmptyState, FormModal, FormSelect, FormTextarea, Icon, Input, TitleList, type Column } from "@/components";
import { canImpersonate, IMPERSONATE_MODAL, ImpersonateModal } from "@/modules/admin/components/impersonate-modal";
import { useAdminUsers } from "@/modules/admin/hooks/use-admin-directory";
import { EMAIL_FAILURE_LABEL, USER_ACTION_LABEL, type AdminUser, type EmailActionResult, type UserAction } from "@/modules/admin/services/admin-directory-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MODAL = "admin-user-action";

const ROLE_LABEL: Record<string, string> = {
  titular: "Titular", direccao_pedagogica: "Direcção Pedagógica", secretaria: "Secretaria", professor: "Professor", financeiro: "Financeiro",
  encarregado: "Encarregado", aluno: "Aluno", admin_sistema: "Administrador de sistema", auditor_med: "Auditor do MED",
};
const STATUS_VARIANT = { activo: "success", suspenso: "warning", bloqueado: "destructive" } as const;
const DONE: Record<UserAction, string> = { block: "Utilizador bloqueado.", unblock: "Utilizador desbloqueado.", "mfa/reset": "Segundo factor reposto: o utilizador tem de o configurar de novo.", "sessions/revoke": "Sessões terminadas.", "password-reset": "Enviámos ao utilizador um link para repor a palavra-passe.", "invite/resend": "Convite reenviado: o link anterior deixou de funcionar." };

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-PT") : "nunca");

/** Directório de utilizadores de todas as escolas, com as acções de suporte (todas auditadas e com reautenticação). */
export function UsersContent({ schoolId, embedded = false }: { schoolId?: string; embedded?: boolean } = {}) {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => { const t = setTimeout(() => setTerm(search), 350); return () => clearTimeout(t); }, [search]);

  const { users, isLoading, isError, hasMore, loadMore, isLoadingMore, act } = useAdminUsers(term, status, schoolId ?? "");
  const { openModal } = useModal();
  const [target, setTarget] = useState<{ user: AdminUser; action: UserAction } | null>(null);
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");
  const [impTarget, setImpTarget] = useState<AdminUser | null>(null);

  const start = (user: AdminUser, action: UserAction) => { setTarget({ user, action }); setReason(""); setTicket(""); openModal(MODAL); };
  const submit = () => target
    ? act.mutateAsync({ id: target.user.id, action: target.action, reason: reason.trim(), ...(ticket.trim() ? { ticket: ticket.trim() } : {}) })
      .then((res) => {
        const r = res as Partial<EmailActionResult> | undefined;
        if (r?.sent === false) ErrorMessage(`A acção ficou registada, mas o email não saiu: ${EMAIL_FAILURE_LABEL[r.reason ?? ""] ?? "o envio falhou"}.`);
        else SucessMessage(DONE[target.action]);
      })
      .catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; })
    : Promise.resolve();

  const columns: Column<AdminUser>[] = [
    { key: "user", header: "Utilizador", render: (_, u) => (<div><p className="text-sm font-semibold">{u.full_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>) },
    {
      key: "roles", header: "Escolas e papéis",
      render: (_, u) => u.memberships.length === 0 ? <span className="text-xs text-muted-foreground">Sem papéis</span> : (
        <div className="flex max-w-sm flex-wrap gap-1">
          {u.memberships.slice(0, 3).map((m) => (<Badge key={`${m.school.id}-${m.role}`} variant={m.is_active ? "outline" : "secondary"} className="text-[10px]" title={m.is_active ? "" : "Revogado"}>{m.school.name} · {ROLE_LABEL[m.role] ?? m.role}</Badge>))}
          {u.memberships.length > 3 && <Badge variant="secondary" className="text-[10px]">+{u.memberships.length - 3}</Badge>}
        </div>
      ),
    },
    { key: "status", header: "Estado", render: (_, u) => (<div className="flex flex-col items-start gap-1"><Badge variant={STATUS_VARIANT[u.status]}>{u.status}</Badge>{u.locked && <Badge variant="warning" className="text-[10px]">Bloqueio temporário</Badge>}{u.invite_pending && <Badge variant="outline" className="text-[10px]">Convite pendente</Badge>}</div>) },
    { key: "mfa", header: "2FA", render: (_, u) => u.mfa_enabled ? <Badge variant="outline" className="gap-1 text-[10px]"><Icon name="ShieldCheck" className="size-3" />Activo</Badge> : <span className="text-xs text-muted-foreground">—</span> },
    { key: "last", header: "Último acesso", render: (_, u) => <span className="text-xs">{day(u.last_login_at)}</span> },
    {
      key: "actions", header: "Acção",
      render: (_, u) => (
        <ButtonOnlyAction data={u} actions={[
          ...(u.status === "bloqueado" || u.locked ? [{ label: USER_ACTION_LABEL.unblock, icon: "LockOpen" as const, onClick: (x: AdminUser) => start(x, "unblock") }] : []),
          ...(u.status === "activo" ? [{ label: USER_ACTION_LABEL.block, icon: "Ban" as const, variant: "destructive" as const, onClick: (x: AdminUser) => start(x, "block") }] : []),
          ...(u.status === "activo" && u.invite_pending ? [{ label: USER_ACTION_LABEL["invite/resend"], icon: "Mail" as const, onClick: (x: AdminUser) => start(x, "invite/resend") }] : []),
          ...(u.status === "activo" && !u.invite_pending ? [{ label: USER_ACTION_LABEL["password-reset"], icon: "KeyRound" as const, onClick: (x: AdminUser) => start(x, "password-reset") }] : []),
          ...(u.mfa_enabled ? [{ label: USER_ACTION_LABEL["mfa/reset"], icon: "ShieldOff" as const, onClick: (x: AdminUser) => start(x, "mfa/reset") }] : []),
          ...(canImpersonate(u) ? [{ label: "Personificar", icon: "UserCog" as const, onClick: (x: AdminUser) => { setImpTarget(x); openModal(IMPERSONATE_MODAL); } }] : []),
          { label: USER_ACTION_LABEL["sessions/revoke"], icon: "LogOut" as const, onClick: (x: AdminUser) => start(x, "sessions/revoke") },
        ]} />
      ),
    },
  ];

  if (isError) return <EmptyState icon="ShieldAlert" title="Área restrita" description="Esta área é só para a administração do sistema." />;

  return (
    <div className="space-y-6">
      {!embedded && <TitleList title="Utilizadores" suTitle="Encontre qualquer utilizador da plataforma e resolva problemas de acesso. Cada acção exige motivo e reautenticação, e fica auditada." />}

      <div className="flex flex-wrap items-center gap-2">
        <div className="w-80"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar por email ou nome (mín. 2 letras)" /></div>
        <div className="w-48"><FormSelect label="Estado" value={status || "todos"} onValueChange={(v) => setStatus(v === "todos" ? "" : v)} options={[{ value: "todos", label: "Todos os estados" }, { value: "activo", label: "Activos" }, { value: "suspenso", label: "Suspensos" }, { value: "bloqueado", label: "Bloqueados" }]} /></div>
      </div>

      <DataList
        prefix="utilizadores" rows={users} columns={columns} isLoading={isLoading} pageSize={25}
        emptyTitle="Sem utilizadores" emptyDescription="Nenhum utilizador corresponde à pesquisa." emptyIcon="Users"
      />

      {hasMore && <div className="flex justify-center"><Button variant="outline" size="sm" disabled={isLoadingMore} onClick={loadMore}>{isLoadingMore ? "A carregar…" : "Carregar mais utilizadores"}</Button></div>}

      <ImpersonateModal user={impTarget} />

      <FormModal id={MODAL} title={target ? USER_ACTION_LABEL[target.action] : "Acção"} description={target ? `${target.user.full_name} (${target.user.email}). O motivo fica registado na auditoria.` : undefined} submitLabel="Confirmar" isLoading={act.isPending} disabled={reason.trim().length < 10} onSubmit={submit}>
        <div className="sm:col-span-2"><FormTextarea label="Motivo * (mínimo 10 caracteres)" value={reason} onChange={setReason} rows={3} placeholder="Ex.: Pedido do Titular por telefone, confirmado por email." /></div>
        <div className="sm:col-span-2"><Input label="Referência do pedido de suporte (opcional)" value={ticket} onChange={(e) => setTicket(e.target.value)} /></div>
      </FormModal>
    </div>
  );
}
