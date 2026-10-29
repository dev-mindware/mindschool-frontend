"use client";

import { formatDateTime, formatIdDocument } from "@/utils";
import { useEffect, useState, useMemo } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Can,
  Badge,
  Button,
  ButtonOnlyAction,
  ConfirmModal,
  DataList,
  EmptyState,
  FormCombobox,
  FormModal,
  Icon,
  Input,
  SelectField,
  TitleList,
  type Column,
} from "@/components";
import { GenericTable } from "@/components/common/generic-table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { readRawSettings } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useAdmissionSession, useAdmissionSessions } from "@/hooks/school/use-phase6";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { admissionsService } from "@/services/admissions-service";
import { EDUCATION_CYCLES } from "../candidate-application-drawer";

const fail = (e: unknown) => {
  ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
  throw e;
};

const STATUS = {
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
} as const;

function NewSessionModal() {
  const { levels, create, hasYear } = useAdmissionSessions();
  const [f, setF] = useState({
    title: "",
    when: "",
    location: "",
    capacity: 40,
    cycleId: "i-ciclo",
    levelId: "all",
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  // Classes pertencentes ao ciclo selecionado
  const availableClassesInCycle = useMemo(() => {
    const cycle = EDUCATION_CYCLES.find((c) => c.id === f.cycleId);
    if (!cycle) return levels;

    // Filtra os levels da escola que combinam com as classes do ciclo
    return levels.filter((lvl) =>
      cycle.classes.some(
        (cl) =>
          lvl.name.toLowerCase().includes(cl.name.toLowerCase()) ||
          cl.name.toLowerCase().includes(lvl.name.toLowerCase())
      )
    );
  }, [f.cycleId, levels]);

  // a API recusa uma sessão no passado: avisa-se no próprio campo, antes de submeter
  const whenInPast = Boolean(f.when) && new Date(f.when).getTime() <= Date.now();

  const handleCycleChange = (cycleId: string) => {
    set("cycleId", cycleId);
    set("levelId", "all");
  };

  return (
    <FormModal
      id="session-new"
      title="Nova Sessão de Prova de Acesso"
      description={
        hasYear
          ? "Defina data, local, vagas e a classe designada da prova de acesso."
          : "Não há ano letivo ativo."
      }
      submitLabel="Criar Sessão de Prova"
      isLoading={create.isPending}
      disabled={!hasYear || f.title.trim().length < 3 || !f.when || whenInPast}
      onSubmit={() =>
        create
          .mutateAsync({
            title: f.title.trim(),
            scheduledAt: new Date(f.when).toISOString(),
            location: f.location.trim() || undefined,
            capacity: f.capacity,
            classLevelId: f.levelId === "all" ? undefined : f.levelId,
          })
          .then(() => SucessMessage("Sessão de prova criada com sucesso."))
          .catch(fail)
      }
    >
      <div className="sm:col-span-2">
        <Input
          label="Título da Prova de Acesso *"
          placeholder="Ex: Prova de Acesso Curricular de Matemática e Português"
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <Input
        label="Data e Hora da Prova *"
        type="datetime-local"
        value={f.when}
        onChange={(e) => set("when", e.target.value)}
        error={whenInPast ? "A sessão tem de ser no futuro." : undefined}
      />

      <Input
        label="Capacidade de Vagas *"
        type="quantity"
        value={f.capacity}
        onChange={(e) => set("capacity", Math.max(1, Number(e.target.value) || 1))}
      />

      <Input
        label="Sala / Local da Prova"
        placeholder="Ex: Sala 04 (Bloco B)"
        startIcon="MapPin"
        value={f.location}
        onChange={(e) => set("location", e.target.value)}
      />

      {/* 2 selects separados: Ciclo e Classe */}
      <SelectField
        label="Ciclo de Ensino *"
        value={f.cycleId}
        onValueChange={handleCycleChange}
        options={EDUCATION_CYCLES.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
      />

      <SelectField
        label="Classe Designada *"
        value={f.levelId}
        onValueChange={(val) => set("levelId", val)}
        options={[
          { value: "all", label: "Todas as classes do ciclo" },
          ...availableClassesInCycle.map((l) => ({
            value: l.id,
            label: l.name,
          })),
        ]}
      />
    </FormModal>
  );
}

/** `YYYY-MM-DDTHH:mm` na hora local, o formato do campo `datetime-local`. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

/** Edição de uma sessão agendada (título, data, local e vagas). A classe e o ano não mudam. */
function EditSessionModal({ session }: { session: SessionRow | null }) {
  const { update } = useAdmissionSessions();
  const [f, setF] = useState({ title: "", when: "", location: "", capacity: 1 });
  useEffect(() => {
    if (session) setF({ title: session.title, when: toLocalInput(session.scheduled_at), location: session.location ?? "", capacity: session.capacity });
  }, [session]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const whenInPast = Boolean(f.when) && new Date(f.when).getTime() <= Date.now();
  const belowRegistered = Boolean(session) && f.capacity < (session?.registered ?? 0);

  return (
    <FormModal
      id="session-edit"
      title="Editar sessão da prova de acesso"
      description="Só se editam sessões agendadas. As vagas não podem ficar abaixo dos candidatos já inscritos."
      submitLabel="Guardar alterações"
      isLoading={update.isPending}
      disabled={!session || f.title.trim().length < 3 || !f.when || whenInPast || belowRegistered}
      onSubmit={() =>
        session
          ? update
              .mutateAsync({ id: session.id, title: f.title.trim(), scheduledAt: new Date(f.when).toISOString(), location: f.location.trim() || null, capacity: f.capacity })
              .then(() => SucessMessage("Sessão atualizada."))
              .catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível atualizar a sessão.")); throw e; })
          : undefined
      }
    >
      <div className="sm:col-span-2">
        <Input label="Título da Prova de Acesso *" value={f.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <Input label="Data e Hora da Prova *" type="datetime-local" value={f.when} error={whenInPast ? "A sessão tem de ser no futuro." : undefined} onChange={(e) => set("when", e.target.value)} />
      <Input
        label="Capacidade de Vagas *"
        type="quantity"
        value={f.capacity}
        error={belowRegistered ? `Já há ${session?.registered} inscritos: as vagas não podem ser menos.` : undefined}
        onChange={(e) => set("capacity", Math.max(1, Number(e.target.value) || 1))}
      />
      <div className="sm:col-span-2">
        <Input label="Sala / Local da Prova" startIcon="MapPin" value={f.location} onChange={(e) => set("location", e.target.value)} />
      </div>
    </FormModal>
  );
}

type Row = { status: "presente" | "ausente"; score: string };
/** Depois da decisão (aprovada, matriculada...) a nota da prova fica fechada: a API só aceita notas enquanto a candidatura está em avaliação. */
const canEditScore = (applicationStatus?: string) => !applicationStatus || ["documentos_validados", "em_avaliacao"].includes(applicationStatus);

function SessionModal({ id }: { id: string | null }) {
  const { session, register, putResults, accessToken } = useAdmissionSession(id ?? undefined);
  const { applications } = useAdmissionSessions();
  const { open, closeModal, openModal } = useModal();
  const isOpen = Boolean(open["session-detail"]);
  // Nota mínima da prova: a da política da escola (Definições › Políticas); sem ela, 10.
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const settings = useQuery({ queryKey: ["settings-raw", schoolId], queryFn: readRawSettings, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const minScore = Number((settings.data?.["admission"] as { min_pass_score?: number | null } | undefined)?.min_pass_score ?? 10);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [pick, setPick] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!session) return;
    setRows(
      Object.fromEntries(
        session.registrations.map((r) => [
          r.application_id,
          {
            status: (r.status === "ausente" ? "ausente" : "presente") as Row["status"],
            score: r.score !== null && r.score !== undefined ? String(r.score) : "",
          },
        ])
      )
    );
  }, [session]);

  const cancelled = session?.status === "cancelada";
  const registered = new Set(session?.registrations.map((r) => r.application_id));
  const eligible = applications.filter(
    (a) =>
      a.requires_entrance_exam &&
      !registered.has(a.id) &&
      ["documentos_validados", "em_avaliacao", "submetida"].includes(a.status)
  );

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const list = session?.registrations ?? [];
    let presentCount = 0;
    let absentCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    for (const r of list) {
      const d = rows[r.application_id];
      if (d) {
        if (d.status === "presente") {
          presentCount++;
          if (d.score !== "") {
            const num = Number(d.score);
            if (num >= minScore) approvedCount++;
            else rejectedCount++;
          }
        } else if (d.status === "ausente") {
          absentCount++;
          rejectedCount++;
        }
      }
    }

    return {
      total: list.length,
      presentCount,
      absentCount,
      approvedCount,
      rejectedCount,
    };
  }, [session, rows, minScore]);

  const handleSaveAndProcess = async () => {
    const results = (session?.registrations ?? []).flatMap<{
      application_id: string;
      status: "presente" | "ausente";
      score?: number;
    }>((r) => {
      const d = rows[r.application_id];
      if (!d || r.status === "cancelado" || !canEditScore(r.application_status)) return [];
      if (d.status === "ausente") return [{ application_id: r.application_id, status: "ausente" as const }];
      return d.score === "" ? [] : [{ application_id: r.application_id, status: "presente" as const, score: Number(d.score) }];
    });

    if (results.length === 0) {
      ErrorMessage("Por favor, preencha as notas dos candidatos presentes para gravar.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Gravar resultados no backend
      await putResults.mutateAsync(results);

      // 2. Processar admissão automática de aprovados e notificação de reprovados
      let approvedTotal = 0;
      let waitlistedTotal = 0;
      let rejectedTotal = 0;
      const failures: string[] = [];
      const nameOf = (id: string) => session?.registrations.find((r) => r.application_id === id)?.candidate ?? "Candidato";

      const decide = async (applicationId: string, decision: "aprovada" | "reprovada", notes: string) => {
        try {
          const done = await admissionsService.decide(applicationId, decision, notes);
          // sem vagas, a API converte «aprovada» em lista de espera
          if (decision === "aprovada" && done.status === "lista_espera") waitlistedTotal++;
          else if (decision === "aprovada") approvedTotal++;
          else rejectedTotal++;
        } catch (err) {
          failures.push(`${nameOf(applicationId)}: ${getApiErrorMessage(err, "não foi possível decidir")}`);
        }
      };

      for (const res of results) {
        if (res.status === "presente" && res.score !== undefined) {
          if (res.score >= minScore) {
            await decide(res.application_id, "aprovada", `Aprovado na Prova de Acesso com classificação de ${res.score} valores.`);
          } else {
            await decide(res.application_id, "reprovada", `Não admitido na Prova de Acesso com classificação de ${res.score} valores (mínimo exigido: ${minScore} valores).`);
          }
        } else if (res.status === "ausente") {
          await decide(res.application_id, "reprovada", "Não admitido por ausência à Prova de Acesso agendada.");
        }
      }

      SucessMessage(
        `Notas gravadas. Decisões: ${approvedTotal} aprovado(s), ${waitlistedTotal} em lista de espera (sem vagas), ${rejectedTotal} não admitido(s).`
      );
      if (failures.length > 0) {
        // Ex.: documentos por validar, candidatura já decidida: o candidato fica como estava e decide-se à mão.
        ErrorMessage(`${failures.length} candidato(s) ficaram por decidir: ${failures.join(" · ")}`);
      }
      closeModal("session-detail");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Ocorreu um erro ao processar os resultados."));
    } finally {
      setIsProcessing(false);
    }
  };

  type RegistrationRow = NonNullable<typeof session>["registrations"][number] & { id: string };

  const registrationRows: RegistrationRow[] = useMemo(
    () => (session?.registrations ?? []).map((r) => ({ ...r, id: r.application_id })),
    [session]
  );

  const registrationColumns: Column<RegistrationRow>[] = [
    {
      key: "candidate",
      header: "Candidato & Documento",
      render: (_, r) => (
        <div>
          <p className="font-semibold text-foreground text-xs">{r.candidate}</p>
          <p className="text-xs text-muted-foreground font-mono">
            BI: {formatIdDocument(r.document_number)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Presença",
      className: "w-36",
      render: (_, r) => {
        const d = rows[r.application_id];
        if (r.status === "cancelado") {
          return <Badge variant="secondary">Cancelado</Badge>;
        }
        if (!d) return null;
        return (
          <Select
            disabled={cancelled}
            value={d.status}
            onValueChange={(val) =>
              setRows((c) => ({
                ...c,
                [r.application_id]: {
                  ...d,
                  status: val as Row["status"],
                },
              }))
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presente">Presente</SelectItem>
              <SelectItem value="ausente">Ausente</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      key: "score",
      header: "Nota (0–20)",
      className: "w-32",
      render: (_, r) => {
        const d = rows[r.application_id];
        if (d && d.status === "presente") {
          return (
            <Input
              label=""
              type="number"
              min={0}
              max={20}
              step={0.5}
              disabled={cancelled || !canEditScore(r.application_status)}
              placeholder="Ex: 14.5"
              value={d.score}
              onChange={(e) => {
                const val = e.target.value;
                setRows((c) => ({
                  ...c,
                  [r.application_id]: { ...d, score: val },
                }));
              }}
              className="h-8 text-xs font-semibold"
            />
          );
        }
        return <span className="text-muted-foreground italic text-xs">—</span>;
      },
    },
    {
      key: "result",
      header: "Resultado",
      className: "w-32 text-center",
      render: (_, r) => {
        const d = rows[r.application_id];
        const numScore = d?.score !== "" ? Number(d?.score) : null;
        const isApproved = numScore !== null && numScore >= minScore;
        if (d?.status === "ausente") {
          return (
            <Badge variant="secondary" className="text-xs">
              Ausente
            </Badge>
          );
        }
        if (numScore !== null) {
          return isApproved ? (
            <Badge variant="success" className="text-xs">
              Aprovado (≥{minScore})
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              Reprovado (&lt;{minScore})
            </Badge>
          );
        }
        return <span className="text-muted-foreground italic text-xs">Pendente</span>;
      },
    },
    {
      key: "action",
      header: "Ação",
      className: "w-28 text-right",
      render: (_, r) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1 text-xs"
          onClick={() =>
            accessToken
              .mutateAsync(r.application_id)
              .then((t) => {
                setToken(`${r.candidate}: ${t.token}`);
                SucessMessage("Código de consulta gerado.");
              })
              .catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))
          }
        >
          <Icon name="Key" className="size-3.5" />
          Código
        </Button>
      ),
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && closeModal("session-detail")}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{session?.title ?? "Prova de Acesso"}</SheetTitle>
          <SheetDescription>
            {session
              ? `${formatDateTime(session.scheduled_at)} • ${session.location ?? "Sala por definir"} • ${session.registered}/${session.capacity} inscritos`
              : undefined}
          </SheetDescription>
        </SheetHeader>

        {session && (
          <div className="space-y-5 text-sm">
            {/* Header de Resumo & Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xs bg-muted/30 p-3 space-y-1">
                <span className="text-xs text-muted-foreground">Inscritos na Prova</span>
                <p className="text-lg font-bold text-foreground">
                  {stats.total} / {session.capacity}
                </p>
              </div>
              <div className="rounded-xs bg-muted/30 p-3 space-y-1">
                <span className="text-xs text-muted-foreground">Presentes</span>
                <p className="text-lg font-bold text-emerald-600">{stats.presentCount}</p>
              </div>
              <div className="rounded-xs bg-muted/30 p-3 space-y-1">
                <span className="text-xs text-muted-foreground">Aprovados (≥ {minScore})</span>
                <p className="text-lg font-bold text-primary">{stats.approvedCount}</p>
              </div>
              <div className="rounded-xs bg-muted/30 p-3 space-y-1">
                <span className="text-xs text-muted-foreground">Reprovados / Ausentes</span>
                <p className="text-lg font-bold text-destructive">{stats.rejectedCount}</p>
              </div>
            </div>

            {/* Inscrever candidato pontualmente (caso necessário) */}
            {!cancelled && eligible.length > 0 && (
              <div className="flex items-end gap-2 p-3 rounded-xs border bg-muted/30">
                <div className="flex-1">
                  <FormCombobox
                    label="Vincular Candidato Adicional a Esta Prova"
                    value={pick}
                    onValueChange={setPick}
                    options={eligible.map((a) => ({
                      value: a.id,
                      label: `${a.candidate.full_name} (${formatIdDocument(a.candidate.document_number)})`,
                    }))}
                  />
                </div>
                <Button
                  size="sm"
                  className="h-10"
                  disabled={!pick || register.isPending}
                  onClick={() =>
                    register
                      .mutateAsync(pick)
                      .then(() => {
                        SucessMessage("Candidato inscrito na prova.");
                        setPick("");
                      })
                      .catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))
                  }
                >
                  Inscrever
                </Button>
              </div>
            )}

            {/* Tabela dos Candidatos e Lançamento de Notas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="Users" className="h-4 w-4 text-primary" />
                  Candidatos Convocados ({session.registrations.length})
                </h4>
                <span className="text-xs text-muted-foreground">
                  Escala de avaliação: 0 a 20 valores (Aprovação: ≥ {minScore})
                </span>
              </div>

              {session.registrations.length === 0 ? (
                <div className="rounded-xs border border-dashed p-6 text-center text-muted-foreground">
                  <p>Nenhum candidato inscrito nesta sessão de prova de acesso até ao momento.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os candidatos são vinculados automaticamente ao submeter a candidatura de admissão.
                  </p>
                </div>
              ) : (
                <GenericTable
                  data={registrationRows}
                  columns={registrationColumns}
                  emptyMessage="Nenhum candidato inscrito nesta sessão."
                />
              )}
            </div>

            {token && (
              <p className="break-all rounded-xs border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 font-mono text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Token de Acesso:</span> {token}
                <br />
                <span className="font-sans text-xs text-amber-700 dark:text-amber-400">
                  Entregue este código ao candidato/encarregado para consulta online do resultado.
                </span>
              </p>
            )}
          </div>
        )}

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => closeModal("session-detail")}>
            Fechar
          </Button>
          {session && !cancelled && session.registrations.length > 0 && (
            <Button
              type="button"
              onClick={() => openModal("session-process-confirm")}
              disabled={isProcessing || putResults.isPending}
              className="gap-2"
            >
              <Icon name="CheckCircle2" className="size-4" />
              {isProcessing
                ? "A gravar e decidir..."
                : "Gravar notas e decidir candidaturas"}
            </Button>
          )}
        </SheetFooter>

        <ConfirmModal
          id="session-process-confirm"
          title="Gravar notas e decidir candidaturas"
          description="Grava as notas e decide, em lote, todos os candidatos com nota ou ausência."
          confirmLabel="Gravar e decidir"
          irreversible
          effects={[
            `Nota igual ou acima de ${minScore}: «aprovada». Abaixo, ou ausente: «não admitido».`,
            "Sem vagas na classe, a aprovação passa automaticamente a lista de espera.",
            "Só se decide quem tem os documentos validados; os restantes ficam por decidir e aparecem listados no fim.",
            "Cada decisão fica registada em seu nome e só se reverte pelo processo próprio (lista de espera, desistência).",
          ]}
          onConfirm={handleSaveAndProcess}
        />
      </SheetContent>
    </Sheet>
  );
}

type SessionRow = ReturnType<typeof useAdmissionSessions>["sessions"][number];

/** Sessões presenciais da prova de acesso: vagas, inscrição de candidaturas, lançamento de notas e admissão automática. */
export function AdmissionSessionsPageContent() {
  const { sessions, isLoading, forbidden, cancel, levels } = useAdmissionSessions();
  const { openModal } = useModal();
  const [openId, setOpenId] = useState<string | null>(null);
  const [target, setTarget] = useState<SessionRow | null>(null);
  const [editing, setEditing] = useState<SessionRow | null>(null);

  if (forbidden)
    return (
      <EmptyState
        icon="Lock"
        title="Sem acesso"
        description="O seu perfil não tem acesso às sessões de provas de acesso."
      />
    );

  const columns: Column<SessionRow>[] = [
    {
      key: "title",
      header: "Sessão / Prova de Acesso",
      render: (_, s) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{s.title}</span>
          <span className="text-xs text-muted-foreground">{s.class_level?.name ?? "Todas as classes"}</span>
        </div>
      ),
    },
    {
      key: "scheduled_at",
      header: "Data & Hora",
      render: (_, s) => <span className="text-xs">{formatDateTime(s.scheduled_at)}</span>,
    },
    {
      key: "location",
      header: "Local / Sala",
      render: (_, s) => s.location ?? "—",
    },
    {
      key: "registered",
      header: "Inscritos / Vagas",
      render: (_, s) => (
        <span className="font-mono text-xs">
          {s.registered} / {s.capacity} ({s.seats_left} vagas restantes)
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, s) => (
        <Badge variant={s.status === "cancelada" ? "secondary" : s.status === "realizada" ? "default" : "outline"}>
          {STATUS[s.status]}
        </Badge>
      ),
    },
    {
      key: "action",
      header: "Ações",
      render: (_, s) => (
        <ButtonOnlyAction
          data={s}
          actions={[
            {
              label: "Gerir Prova & Lançar Notas",
              icon: "Eye",
              onClick: (x) => {
                setOpenId(x.id);
                openModal("session-detail");
              },
            },
            ...(s.status === "agendada"
              ? [
                  {
                    permission: "admission:write",
                    label: "Editar Sessão",
                    icon: "Pencil" as const,
                    onClick: (x: SessionRow) => {
                      setEditing(x);
                      openModal("session-edit");
                    },
                  },
                  {
                    permission: "admission:write",
                    label: "Cancelar Prova",
                    icon: "X" as const,
                    variant: "destructive" as const,
                    onClick: (x: SessionRow) => {
                      setTarget(x);
                      openModal("session-cancel");
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Provas de Acesso & Sessões Presenciais"
        suTitle="Gestão das provas de admissão, lançamento de notas e aprovação direta de novos estudantes."
      >
        <Can permission="admission:write">
          <Button size="sm" className="gap-1.5" onClick={() => openModal("session-new")}>
            <Icon name="Plus" className="size-4" />
            Nova Prova de Acesso
          </Button>
        </Can>
      </TitleList>

      <DataList<SessionRow>
        prefix="sessoes-acesso"
        rows={sessions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por título ou local da prova..."
        searchText={(s) => `${s.title} ${s.location ?? ""}`}
        filters={[
          {
            key: "estado",
            label: "Estado",
            icon: "CircleDot",
            options: Object.entries(STATUS).map(([value, label]) => ({ value, label })),
            match: (s, v) => s.status === v,
          },
          {
            key: "classe",
            label: "Classe",
            icon: "GraduationCap",
            options: levels.map((l) => ({ value: l.id, label: l.name })),
            match: (s, v) => s.class_level?.name === levels.find((l) => l.id === v)?.name,
          },
          {
            key: "vagas",
            label: "Vagas",
            icon: "Armchair",
            options: [
              { value: "livres", label: "Com vagas disponíveis" },
              { value: "cheia", label: "Esgotadas" },
            ],
            match: (s, v) => (v === "livres" ? s.seats_left > 0 : s.seats_left <= 0),
          },
        ]}
        dateFilters={[{ key: "data", label: "Data da Prova", getDate: (s) => s.scheduled_at }]}
        sorts={[
          { value: "data", label: "Data", compare: (a, b) => a.scheduled_at.localeCompare(b.scheduled_at) },
          { value: "inscritos", label: "Inscritos", compare: (a, b) => a.registered - b.registered },
        ]}
        emptyTitle="Ainda não há provas de acesso agendadas"
        emptyDescription="Crie a primeira prova de acesso para habilitar o registo de candidaturas na escola."
        emptyIcon="ClipboardList"
      />

      <NewSessionModal />
      <SessionModal id={openId} />
      <EditSessionModal session={editing} />
      <ConfirmModal
        id="session-cancel"
        destructive
        title="Cancelar Sessão de Prova"
        description={`Tem a certeza de que deseja cancelar «${target?.title ?? ""}»? Todas as inscrições associadas ficarão canceladas.`}
        confirmLabel="Cancelar Sessão"
        isLoading={cancel.isPending}
        onConfirm={() =>
          target
            ? cancel
                .mutateAsync(target.id)
                .then(() => SucessMessage("Sessão de prova cancelada."))
                .catch(fail)
            : undefined
        }
      />
    </div>
  );
}
