"use client";

import { useEffect, useMemo, useState } from "react";
import { SucessMessage, ErrorMessage, WarningMessage } from "@/utils/messages";
import {
  Can,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  ConfirmModal,
  DataList,
  EmptyState,
  FormModal,
  FormSelect,
  Icon,
  Input,
  ButtonOnlyAction,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  StatusLegend,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
  type Column,
} from "@/components";
import {
  useEffectivePermissions,
  useMemberships,
  useSchoolRolesAndPermissions,
} from "@/hooks/school/use-admin-school";
import {
  INVITE_FAILURE,
  ROLE_LABEL,
  type ApiMembership,
  type ApiPermissionCatalogItem,
  type ApiRoleAuditEntry,
  type ApiSchoolRoleConfig,
  type SchoolRole,
} from "@/services/admin-school-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatDate } from "@/utils/format-date";

const ASSIGNABLE: SchoolRole[] = [
  "direccao_pedagogica",
  "secretaria",
  "professor",
  "financeiro",
  "encarregado",
  "aluno",
];

const MODULE_LABELS: Record<string, string> = {
  instituicao: "Instituição e Governação",
  academico: "Estrutura Académica e Horários",
  pessoas: "Alunos, Professores e Encarregados",
  admissao_matricula: "Admissões e Matrículas",
  avaliacao: "Avaliações, Notas e Pautas",
  assiduidade: "Assiduidade e Presenças",
  financeiro: "Propinas, Facturação e Fiscal",
  documentos_relatorios: "Documentos, Mapas MED e Importações",
  servicos_comunicacao: "Serviços Escolares e Comunicação",
  portal: "Portal da Família e do Aluno",
  seguranca_auditoria: "Segurança e Auditoria",
};

const ACTION_LABELS: Record<string, string> = {
  read: "Leitura",
  create: "Criação",
  update: "Actualização",
  delete: "Remoção",
  approve: "Aprovação",
  export: "Exportação",
  manage: "Gestão",
};

const fail = (e: unknown) => {
  ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
  throw e;
};

function AddUserModal() {
  const { grant } = useMemberships();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<SchoolRole>("professor");
  const [mode, setMode] = useState<"invite" | "password" | "existing">("invite");
  const [password, setPassword] = useState("");

  const submit = () =>
    grant
      .mutateAsync({
        email: email.trim(),
        role,
        invite: mode === "invite",
        fullName: mode === "existing" ? undefined : name.trim() || undefined,
        password: mode === "password" ? password : undefined,
      })
      .then((res) => {
        if (mode === "invite" && res.invite && !res.invite.sent) {
          WarningMessage(
            `Utilizador criado, mas o convite não foi enviado. ${INVITE_FAILURE[res.invite.reason ?? "falha_no_envio"]} Reenvie o convite na lista quando o e-mail estiver a funcionar.`,
          );
        } else {
          SucessMessage(
            mode === "invite"
              ? "Convite enviado."
              : mode === "existing"
                ? "Papel atribuído."
                : "Utilizador criado.",
          );
        }
        setEmail("");
        setName("");
        setPassword("");
      })
      .catch(fail);

  return (
    <FormModal
      id="settings-add-user"
      title="Adicionar Utilizador"
      description="Pessoa nova: «Convite por e-mail» envia-lhe uma ligação para definir a palavra-passe; «Palavra-passe inicial» define-a você e comunica-a (validada pela política de segurança). Pessoa que já tem conta (mesmo e-mail): escolha «Conta existente» e só se atribui o papel."
      submitLabel="Adicionar"
      isLoading={grant.isPending}
      onSubmit={submit}
      disabled={!email.trim() || (mode === "password" && password.length < 8)}
    >
      <Input
        label="E-mail *"
        type="email"
        startIcon="Mail"
        placeholder="exemplo@escola.ao"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {mode !== "existing" && (
        <Input
          label="Nome * (pessoa nova)"
          startIcon="User"
          placeholder="Ex.: João Manuel da Silva"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}
      <FormSelect
        label="Papel *"
        value={role}
        onValueChange={(v) => setRole(v as SchoolRole)}
        options={ASSIGNABLE.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
      />
      <FormSelect
        label="Acesso"
        value={mode}
        onValueChange={(v) => setMode(v as "invite" | "password" | "existing")}
        options={[
          { value: "invite", label: "Pessoa nova: convite por e-mail" },
          { value: "password", label: "Pessoa nova: palavra-passe inicial" },
          { value: "existing", label: "Conta existente: só atribuir o papel" },
        ]}
      />
      {mode === "password" && (
        <Input
          label="Palavra-passe inicial *"
          type="password"
          placeholder="Defina uma palavra-passe forte..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}
    </FormModal>
  );
}

function EffectivePermissionsSheet({
  membership,
  onClose,
}: {
  membership: ApiMembership | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useEffectivePermissions(membership?.id ?? null);
  const [search, setSearch] = useState("");

  const filteredSources = useMemo(() => {
    const list = data?.sources ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.display_code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [data?.sources, search]);

  return (
    <Sheet open={Boolean(membership)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Permissões Efectivas</SheetTitle>
          <SheetDescription>
            {membership
              ? `${membership.user.full_name} (${membership.user.email})`
              : "Consulta de permissões activas na escola"}
          </SheetDescription>
        </SheetHeader>

        {isLoading || !data ? (
          <div className="py-8 text-sm text-muted-foreground">
            A carregar permissões efectivas...
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="rounded-lg border p-3.5 space-y-2 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Funções activas nesta escola</span>
                <span>Versão de autorização v{data.authz_version}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.active_roles.map((r) => (
                  <Badge key={r.membership_id} variant="outline">
                    {ROLE_LABEL[r.role] ?? r.role_name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de <strong>{data.permissions.length}</strong> permissões efectivas resultantes da união das funções activas.
              </p>
            </div>

            <Input
              placeholder="Filtrar permissões por nome ou código..."
              startIcon="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {filteredSources.map((item) => (
                <div
                  key={item.code}
                  className="rounded-md border p-3 flex flex-col gap-1.5 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      {item.is_sensitive && (
                        <Badge variant="warning" className="text-[10px]">
                          Sensível
                        </Badge>
                      )}
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {item.display_code}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                    <span>Origem:</span>
                    {item.granted_by_roles.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">
                        {ROLE_LABEL[r] ?? r}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function RolesAndPermissionsTab() {
  const { roles, catalog, authzVersion, isLoading, updateRole, resetRole } =
    useSchoolRolesAndPermissions();
  const [selectedRoleKey, setSelectedRoleKey] = useState<SchoolRole>("secretaria");
  const [selectedModule, setSelectedModule] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [draftPermissions, setDraftPermissions] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState("");

  const selectedRole: ApiSchoolRoleConfig | undefined = useMemo(
    () => roles.find((r) => r.role === selectedRoleKey) ?? roles[0],
    [roles, selectedRoleKey],
  );

  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(new Set(selectedRole.permissions));
    }
  }, [selectedRole]);

  const groupedCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = catalog.filter((item) => {
      if (selectedModule !== "todos" && item.module !== selectedModule) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.display_code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
    const groups = new Map<string, ApiPermissionCatalogItem[]>();
    for (const item of filtered) {
      const list = groups.get(item.module) ?? [];
      list.push(item);
      groups.set(item.module, list);
    }
    return [...groups.entries()];
  }, [catalog, selectedModule, search]);

  const hasChanges = useMemo(() => {
    if (!selectedRole) return false;
    const current = new Set(selectedRole.permissions);
    if (current.size !== draftPermissions.size) return true;
    for (const p of draftPermissions) {
      if (!current.has(p)) return true;
    }
    return false;
  }, [selectedRole, draftPermissions]);

  const togglePermission = (code: string) => {
    if (!selectedRole?.is_customizable) return;
    setDraftPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSave = () => {
    if (!selectedRole) return;
    const assignableCodes = new Set(
      catalog.filter((c) => c.is_assignable).map((c) => c.code),
    );
    const permissionsToSave = [...draftPermissions].filter((code) =>
      assignableCodes.has(code),
    );
    if (permissionsToSave.length === 0) {
      WarningMessage("Seleccione pelo menos uma permissão atribuível para a função.");
      return;
    }
    updateRole
      .mutateAsync({
        role: selectedRole.role,
        permissions: permissionsToSave,
        reason: reason.trim() || undefined,
      })
      .then(() => {
        SucessMessage(`Permissões de ${selectedRole.name} actualizadas.`);
        setReason("");
      })
      .catch(fail);
  };

  const handleReset = () => {
    if (!selectedRole) return;
    resetRole
      .mutateAsync({
        role: selectedRole.role,
        reason: reason.trim() || "Reposição do perfil predefinido",
      })
      .then(() => {
        SucessMessage(`Permissões de ${selectedRole.name} repostas para o padrão.`);
        setReason("");
      })
      .catch(fail);
  };

  if (isLoading) {
    return (
      <div className="py-10 text-sm text-muted-foreground">
        A carregar catálogo de funções e permissões...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Funções da Escola
          </span>
          <Badge variant="outline" className="font-mono text-xs">
            v{authzVersion}
          </Badge>
        </div>

        {roles.map((r) => {
          const isSelected = selectedRole?.role === r.role;
          return (
            <button
              key={r.role}
              type="button"
              onClick={() => setSelectedRoleKey(r.role)}
              className={`w-full text-left rounded-lg border p-3.5 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{r.name}</span>
                <div className="flex items-center gap-1.5">
                  {r.is_protected ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Protegida
                    </Badge>
                  ) : r.is_customized ? (
                    <Badge variant="warning" className="text-[10px]">
                      Personalizada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      Padrão
                    </Badge>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {r.description}
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{r.active_members_count} utilizador(es) ativo(s)</span>
                <span>{r.permissions.length} permissões</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-8">
        {selectedRole && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {selectedRole.name}
                    {selectedRole.is_protected && (
                      <Badge variant="secondary">Função Protegida do Sistema</Badge>
                    )}
                    {selectedRole.is_customized && (
                      <Badge variant="warning">Personalizada nesta escola</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedRole.description}
                  </CardDescription>
                </div>

                {selectedRole.is_customizable && (
                  <Can permission="membership:write">
                    <div className="flex items-center gap-2">
                      {selectedRole.is_customized && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resetRole.isPending}
                          onClick={handleReset}
                        >
                          Repor padrão
                        </Button>
                      )}
                      <Button
                        size="sm"
                        disabled={!hasChanges || updateRole.isPending}
                        onClick={handleSave}
                      >
                        Guardar permissões
                      </Button>
                    </div>
                  </Can>
                )}
              </div>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Pesquisar"
                  placeholder="Pesquisar permissão por nome ou código..."
                  startIcon="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FormSelect
                  label="Módulo"
                  value={selectedModule}
                  onValueChange={setSelectedModule}
                  options={[
                    { value: "todos", label: "Todos os módulos" },
                    ...Object.entries(MODULE_LABELS).map(([k, v]) => ({
                      value: k,
                      label: v,
                    })),
                  ]}
                />
              </div>

              {selectedRole.is_customizable && hasChanges && (
                <div className="pt-2">
                  <Input
                    label="Motivo da alteração (registo de auditoria)"
                    placeholder="Ex.: Ajustar perfil da secretaria para o novo fluxo de atendimento"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6 max-h-[65vh] overflow-y-auto">
              {groupedCatalog.map(([mod, items]) => (
                <div key={mod} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b pb-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {MODULE_LABELS[mod] ?? mod}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {items.filter((i) => draftPermissions.has(i.code)).length} / {items.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {items.map((perm) => {
                      const checked = draftPermissions.has(perm.code);
                      const disabled =
                        !selectedRole.is_customizable || !perm.is_assignable;
                      return (
                        <label
                          key={perm.code}
                          className={`flex items-start gap-3 rounded-md border p-3 text-sm transition-colors ${
                            checked ? "bg-primary/5 border-primary/30" : ""
                          } ${disabled ? "opacity-75 cursor-default" : "cursor-pointer hover:bg-muted/40"}`}
                        >
                          <Checkbox
                            checked={checked}
                            disabled={disabled}
                            onCheckedChange={() => togglePermission(perm.code)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="font-medium leading-tight">
                                {perm.name}
                              </span>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[10px]">
                                  {ACTION_LABELS[perm.action] ?? perm.action}
                                </Badge>
                                {perm.is_sensitive && (
                                  <Badge variant="warning" className="text-[10px]">
                                    Sensível
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug">
                              {perm.description}
                            </p>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {perm.display_code} ({perm.code})
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RolesAuditTab() {
  const { auditEntries, isAuditLoading } = useSchoolRolesAndPermissions();

  const columns: Column<ApiRoleAuditEntry>[] = [
    {
      key: "performed_at",
      header: "Data",
      render: (_, r) => (
        <span className="font-mono text-xs">{formatDate(r.performed_at)}</span>
      ),
    },
    {
      key: "performed_by",
      header: "Autor",
      render: (_, r) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {r.performed_by?.full_name ?? "Sistema"}
          </span>
          <span className="text-xs text-muted-foreground">
            {r.performed_by?.email ?? ""}
          </span>
        </div>
      ),
    },
    {
      key: "entity_type",
      header: "Tipo",
      render: (_, r) => (
        <Badge variant="outline">
          {r.entity_type === "school_role_permission"
            ? "Permissões de Função"
            : "Atribuição de Papel"}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, r) => (
        <Badge
          variant={
            r.action === "anulacao"
              ? "destructive"
              : r.action === "criacao"
                ? "success"
                : "secondary"
          }
        >
          {r.action}
        </Badge>
      ),
    },
    {
      key: "reason",
      header: "Detalhe / Motivo",
      render: (_, r) => {
        const roleCode =
          (r.after?.role as SchoolRole | undefined) ??
          (r.before?.role as SchoolRole | undefined);
        return (
          <div className="text-xs space-y-0.5">
            {roleCode && (
              <div className="font-medium">
                Função: {ROLE_LABEL[roleCode] ?? roleCode}
              </div>
            )}
            <div className="text-muted-foreground">
              {r.reason ?? "Registo automático de auditoria"}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <DataList<ApiRoleAuditEntry>
      prefix="role-audit"
      rows={auditEntries}
      columns={columns}
      isLoading={isAuditLoading}
      searchPlaceholder="Pesquisar por autor, função ou motivo..."
      searchText={(r) =>
        `${r.performed_by?.full_name ?? ""} ${r.performed_by?.email ?? ""} ${r.reason ?? ""} ${JSON.stringify(r.after ?? {})}`
      }
      emptyTitle="Sem alterações registadas"
      emptyIcon="History"
    />
  );
}

/** Utilizadores da escola, funções, catálogo de permissões e histórico de alterações. */
export function UsersPageContent() {
  const { members, isLoading, forbidden, revoke, resendInvite } = useMemberships();
  const { openModal } = useModal();
  const [target, setTarget] = useState<ApiMembership | null>(null);
  const [inspectTarget, setInspectTarget] = useState<ApiMembership | null>(null);

  const resend = (m: ApiMembership) =>
    resendInvite.mutateAsync(m.id).then(
      (res) =>
        res.sent
          ? SucessMessage(`Convite reenviado para ${m.user.email}.`)
          : WarningMessage(
              `O convite não foi enviado. ${INVITE_FAILURE[res.reason ?? "falha_no_envio"]}`,
            ),
      (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível reenviar o convite.")),
    );

  if (forbidden) {
    return (
      <EmptyState
        icon="Lock"
        title="Sem acesso"
        description="O seu perfil não gere utilizadores."
      />
    );
  }

  const columns: Column<ApiMembership>[] = [
    {
      key: "user.full_name",
      header: "Utilizador",
      render: (_, m) => (
        <div className="flex flex-col">
          <span className="font-medium">{m.user.full_name}</span>
          <span className="text-xs text-muted-foreground">{m.user.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Papel",
      render: (_, m) => (
        <Badge variant={m.is_active ? "outline" : "secondary"}>
          {ROLE_LABEL[m.role] ?? m.role}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Estado",
      render: (_, m) =>
        m.is_active ? (
          m.user.invite_pending ? (
            <Badge variant="warning">Convite pendente</Badge>
          ) : (
            <Badge variant="success">Ativo</Badge>
          )
        ) : (
          <Badge variant="secondary">Revogado</Badge>
        ),
    },
    {
      key: "granted_at",
      header: "Desde",
      render: (_, m) => (
        <span className="font-mono text-xs">{formatDate(m.granted_at)}</span>
      ),
    },
    {
      key: "action",
      header: "Ação",
      render: (_, m) =>
        m.is_active ? (
          <ButtonOnlyAction
            data={m}
            actions={[
              {
                permission: "membership:read",
                label: "Permissões efectivas",
                icon: "ShieldCheck",
                onClick: (x: ApiMembership) => setInspectTarget(x),
              },
              ...(m.user.invite_pending
                ? [
                    {
                      permission: "membership:write",
                      label: "Reenviar convite",
                      icon: "Mail" as const,
                      onClick: (x: ApiMembership) => {
                        void resend(x);
                      },
                    },
                  ]
                : []),
              {
                permission: "membership:write",
                label: "Revogar papel",
                icon: "UserX",
                variant: "destructive",
                onClick: (x) => {
                  setTarget(x);
                  openModal("settings-revoke-user");
                },
              },
            ]}
          />
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Utilizadores e Permissões"
        suTitle="Contas de acesso, personalização de permissões por função e auditoria de segurança da escola."
      >
        <Can permission="membership:write">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => openModal("settings-add-user")}
          >
            <Icon name="UserPlus" className="size-4" />
            Adicionar utilizador
          </Button>
        </Can>
      </TitleList>

      <Tabs defaultValue="utilizadores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="utilizadores">Utilizadores</TabsTrigger>
          <TabsTrigger value="funcoes">Funções e Permissões</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Alterações</TabsTrigger>
        </TabsList>

        <TabsContent value="utilizadores" className="space-y-6">
          <StatusLegend
            title="O que cada papel pode fazer"
            items={[
              {
                label: "Direção Geral (Titular)",
                description:
                  "Gestão da escola: subscrição e plano, utilizadores e papéis, definições e relatórios. Tem de haver sempre um titular ativo.",
              },
              {
                label: "Direção Pedagógica",
                description:
                  "Turmas, disciplinas, horários, calendário, pautas (fecha e reabre), conselhos de turma, decisão das candidaturas e dias não letivos.",
              },
              {
                label: "Secretaria",
                description:
                  "Candidaturas, alunos, matrículas, encarregados e documentos oficiais.",
              },
              {
                label: "Financeiro",
                description:
                  "Propinas, faturas, pagamentos, comprovativos e dados bancários.",
              },
              {
                label: "Professor",
                description: "Notas e faltas das suas turmas e disciplinas.",
              },
              {
                label: "Encarregado / Aluno",
                description:
                  "Só o portal da família ou do aluno (notas, horário, propinas e documentos do próprio). Liga-se ao aluno pela ficha do encarregado.",
              },
            ]}
          />

          <DataList<ApiMembership>
            prefix="users"
            rows={members}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Pesquisar por nome ou e-mail"
            searchText={(m) => `${m.user.full_name} ${m.user.email}`}
            filters={[
              {
                key: "role",
                label: "Papel",
                icon: "Shield",
                options: (Object.keys(ROLE_LABEL) as SchoolRole[]).map((r) => ({
                  value: r,
                  label: ROLE_LABEL[r],
                })),
                match: (m, v) => m.role === v,
              },
              {
                key: "status",
                label: "Estado",
                icon: "Tag",
                options: [
                  { value: "active", label: "Ativo" },
                  { value: "revoked", label: "Revogado" },
                ],
                match: (m, v) => (v === "active" ? m.is_active : !m.is_active),
              },
              {
                key: "account",
                label: "Conta",
                icon: "User",
                options: [
                  { value: "active", label: "Conta ativa" },
                  { value: "blocked", label: "Conta bloqueada" },
                ],
                match: (m, v) =>
                  v === "blocked"
                    ? m.user.status === "bloqueado"
                    : m.user.status !== "bloqueado",
              },
            ]}
            dateFilters={[
              { key: "since", label: "Atribuído", getDate: (m) => m.granted_at },
            ]}
            sorts={[
              {
                value: "name",
                label: "Nome",
                compare: (a, b) => a.user.full_name.localeCompare(b.user.full_name),
              },
              {
                value: "role",
                label: "Papel",
                compare: (a, b) => a.role.localeCompare(b.role),
              },
              {
                value: "date",
                label: "Data de atribuição",
                compare: (a, b) => a.granted_at.localeCompare(b.granted_at),
              },
            ]}
            emptyTitle="Sem utilizadores"
            emptyIcon="Users"
          />
        </TabsContent>

        <TabsContent value="funcoes">
          <RolesAndPermissionsTab />
        </TabsContent>

        <TabsContent value="historico">
          <RolesAuditTab />
        </TabsContent>
      </Tabs>

      <AddUserModal />
      <EffectivePermissionsSheet
        membership={inspectTarget}
        onClose={() => setInspectTarget(null)}
      />
      <ConfirmModal
        id="settings-revoke-user"
        destructive
        title="Revogar papel"
        description={`Revogar o papel ${target ? `${ROLE_LABEL[target.role]} de ${target.user.full_name}` : ""}?`}
        effects={[
          "O efeito é imediato: a pessoa perde o acesso a esta escola com este papel.",
          "A conta e os registos que fez (notas, documentos, pagamentos) mantêm-se, com o nome dela, na auditoria.",
          "Não se pode revogar o seu próprio acesso nem o último titular ativo da escola.",
          "Para devolver o acesso, atribua o papel de novo (Adicionar utilizador, com o mesmo e-mail).",
        ]}
        confirmLabel="Revogar"
        isLoading={revoke.isPending}
        onConfirm={() =>
          target
            ? revoke
                .mutateAsync(target.id)
                .then(() => SucessMessage("Papel revogado."))
                .catch(fail)
            : undefined
        }
      />
    </div>
  );
}
