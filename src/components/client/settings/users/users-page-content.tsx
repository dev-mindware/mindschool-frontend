"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ConfirmModal, DataList, EmptyState, FormModal, FormSelect, Icon, Input, ButtonOnlyAction, TitleList, type Column } from "@/components";
import { useMemberships } from "@/hooks/school/use-admin-school";
import { ROLE_LABEL, type ApiMembership, type SchoolRole } from "@/services/admin-school-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const ASSIGNABLE: SchoolRole[] = ["direccao_pedagogica", "secretaria", "professor", "financeiro", "encarregado", "aluno"];
const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };

function AddUserModal() {
  const { grant } = useMemberships();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<SchoolRole>("professor");
  const [mode, setMode] = useState<"invite" | "password">("invite");
  const [password, setPassword] = useState("");

  const submit = () =>
    grant
      .mutateAsync({ email: email.trim(), role, fullName: name.trim() || undefined, invite: mode === "invite", password: mode === "password" ? password : undefined })
      .then(() => { SucessMessage(mode === "invite" ? "Convite enviado." : "Utilizador criado."); setEmail(""); setName(""); setPassword(""); })
      .catch(fail);

  return (
    <FormModal id="settings-add-user" title="Adicionar Utilizador" description="A palavra-passe é validada pela política de segurança (comprimento, lista de palavras comuns e fugas conhecidas)." submitLabel="Adicionar" isLoading={grant.isPending} onSubmit={submit} disabled={!email.trim() || (mode === "password" && password.length < 8)}>
      <Input label="E-mail *" type="email" startIcon="Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Nome (novos utilizadores)" startIcon="User" value={name} onChange={(e) => setName(e.target.value)} />
      <FormSelect label="Papel *" value={role} onValueChange={(v) => setRole(v as SchoolRole)} options={ASSIGNABLE.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
      <FormSelect label="Acesso inicial" value={mode} onValueChange={(v) => setMode(v as "invite" | "password")} options={[{ value: "invite", label: "Convite por e-mail" }, { value: "password", label: "Palavra-passe inicial" }]} />
      {mode === "password" && <Input label="Palavra-passe inicial *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />}
    </FormModal>
  );
}

/** Utilizadores da escola e os seus papéis: convidar por e-mail (ou definir palavra-passe inicial) e revogar. */
export function UsersPageContent() {
  const { members, isLoading, forbidden, revoke } = useMemberships();
  const { openModal } = useModal();
  const [target, setTarget] = useState<ApiMembership | null>(null);

  if (forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não gere utilizadores." />;

  const columns: Column<ApiMembership>[] = [
    { key: "user.full_name", header: "Utilizador", render: (_, m) => (<div className="flex flex-col"><span className="font-medium">{m.user.full_name}</span><span className="text-xs text-muted-foreground">{m.user.email}</span></div>) },
    { key: "role", header: "Papel", render: (_, m) => <Badge variant={m.is_active ? "outline" : "secondary"}>{ROLE_LABEL[m.role] ?? m.role}</Badge> },
    { key: "is_active", header: "Estado", render: (_, m) => (m.is_active ? <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Activo</Badge> : <Badge variant="secondary">Revogado</Badge>) },
    { key: "granted_at", header: "Desde", render: (_, m) => <span className="font-mono text-xs">{m.granted_at.slice(0, 10)}</span> },
    {
      key: "action", header: "Acção",
      render: (_, m) => m.is_active ? <ButtonOnlyAction data={m} actions={[{ permission: "membership:write", label: "Revogar papel", icon: "UserX", variant: "destructive", onClick: (x) => { setTarget(x); openModal("settings-revoke-user"); } }]} /> : null,
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Utilizadores e Papéis" suTitle="Quem tem acesso à escola e com que papel. Só se atribuem os papéis que o seu perfil permite.">
        <Can permission="membership:write"><Button size="sm" className="gap-2" onClick={() => openModal("settings-add-user")}><Icon name="UserPlus" className="size-4" />Adicionar utilizador</Button></Can>
      </TitleList>

      <DataList<ApiMembership>
        prefix="utilizadores"
        rows={members}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por nome ou e-mail"
        searchText={(m) => `${m.user.full_name} ${m.user.email}`}
        filters={[
          { key: "papel", label: "Papel", icon: "Shield", options: (Object.keys(ROLE_LABEL) as SchoolRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] })), match: (m, v) => m.role === v },
          { key: "estado", label: "Estado", icon: "Tag", options: [{ value: "activo", label: "Activo" }, { value: "revogado", label: "Revogado" }], match: (m, v) => (v === "activo" ? m.is_active : !m.is_active) },
          { key: "conta", label: "Conta", icon: "User", options: [{ value: "activo", label: "Conta activa" }, { value: "bloqueado", label: "Conta bloqueada" }], match: (m, v) => (v === "bloqueado" ? m.user.status === "bloqueado" : m.user.status !== "bloqueado") },
        ]}
        dateFilters={[{ key: "desde", label: "Atribuído", getDate: (m) => m.granted_at }]}
        sorts={[
          { value: "nome", label: "Nome", compare: (a, b) => a.user.full_name.localeCompare(b.user.full_name) },
          { value: "papel", label: "Papel", compare: (a, b) => a.role.localeCompare(b.role) },
          { value: "data", label: "Data de atribuição", compare: (a, b) => a.granted_at.localeCompare(b.granted_at) },
        ]}
        emptyTitle="Sem utilizadores"
        emptyIcon="Users"
      />

      <AddUserModal />
      <ConfirmModal
        id="settings-revoke-user"
        destructive
        title="Revogar papel"
        description={`Revogar o papel ${target ? `${ROLE_LABEL[target.role]} de ${target.user.full_name}` : ""}? O efeito é imediato.`}
        confirmLabel="Revogar"
        isLoading={revoke.isPending}
        onConfirm={() => (target ? revoke.mutateAsync(target.id).then(() => SucessMessage("Papel revogado.")).catch(fail) : undefined)}
      />
    </div>
  );
}
