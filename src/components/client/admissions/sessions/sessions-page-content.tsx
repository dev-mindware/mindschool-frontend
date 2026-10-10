"use client";
import { formatDateTime } from "@/utils";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, EmptyState, FormCombobox, FormModal, FormSelect, Icon, Input, TitleList, type Column } from "@/components";
import { useAdmissionSession, useAdmissionSessions } from "@/hooks/school/use-phase6";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const STATUS = { agendada: "Agendada", realizada: "Realizada", cancelada: "Cancelada" } as const;

function NewSessionModal() {
  const { levels, create, hasYear } = useAdmissionSessions();
  const [f, setF] = useState({ title: "", when: "", location: "", capacity: 40, levelId: "" });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <FormModal id="session-new" title="Nova sessão de prova de acesso" description={hasYear ? "Defina data, local e vagas." : "Não há ano lectivo activo."} submitLabel="Criar sessão" isLoading={create.isPending} disabled={!hasYear || f.title.trim().length < 3 || !f.when} onSubmit={() => create.mutateAsync({ title: f.title.trim(), scheduledAt: new Date(f.when).toISOString(), location: f.location.trim() || undefined, capacity: f.capacity, classLevelId: f.levelId || undefined }).then(() => SucessMessage("Sessão criada.")).catch(fail)}>
      <div className="sm:col-span-2"><Input label="Título *" placeholder="Prova de acesso — 7.ª Classe" value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
      <Input label="Data e hora *" type="datetime-local" value={f.when} onChange={(e) => set("when", e.target.value)} />
      <Input label="Vagas *" type="quantity" value={f.capacity} onChange={(e) => set("capacity", Math.max(1, Number(e.target.value) || 1))} />
      <Input label="Sala / local" startIcon="MapPin" value={f.location} onChange={(e) => set("location", e.target.value)} />
      <FormSelect label="Classe" value={f.levelId || "all"} onValueChange={(v) => set("levelId", v === "all" ? "" : v)} options={[{ value: "all", label: "Todas as classes" }, ...levels.map((l) => ({ value: l.id, label: l.name }))]} />
    </FormModal>
  );
}

type Row = { status: "presente" | "ausente"; score: string };

function SessionModal({ id }: { id: string | null }) {
  const { session, register, putResults, accessToken } = useAdmissionSession(id ?? undefined);
  const { applications } = useAdmissionSessions();
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [pick, setPick] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setRows(Object.fromEntries(session.registrations.map((r) => [r.application_id, { status: (r.status === "ausente" ? "ausente" : "presente") as Row["status"], score: r.score?.toString() ?? "" }])));
  }, [session]);

  const cancelled = session?.status === "cancelada";
  const registered = new Set(session?.registrations.map((r) => r.application_id));
  const eligible = applications.filter((a) => a.requires_entrance_exam && !registered.has(a.id) && ["documentos_validados", "em_avaliacao", "submetida"].includes(a.status));

  const save = () => {
    const results = (session?.registrations ?? []).flatMap<{ application_id: string; status: "presente" | "ausente"; score?: number }>((r) => {
      const d = rows[r.application_id];
      if (!d || r.status === "cancelado") return [];
      if (d.status === "ausente") return [{ application_id: r.application_id, status: "ausente" as const }];
      return d.score === "" ? [] : [{ application_id: r.application_id, status: "presente" as const, score: Number(d.score) }];
    });
    if (results.length === 0) return ErrorMessage("Nada para gravar.");
    void putResults.mutateAsync(results).then(() => SucessMessage("Resultados gravados.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));
  };

  return (
    <FormModal id="session-detail" title={session?.title ?? "Sessão"} description={session ? `${formatDateTime(session.scheduled_at)} • ${session.location ?? "sem local"} • ${session.registered}/${session.capacity} inscritos` : undefined} size="lg" readOnly onSubmit={() => undefined}>
      {session && (
        <div className="sm:col-span-2 space-y-4 text-sm">
          {!cancelled && (
            <div className="flex items-end gap-2">
              <div className="flex-1"><FormCombobox label="Inscrever candidato" value={pick} onValueChange={setPick} options={eligible.map((a) => ({ value: a.id, label: a.candidate.full_name }))} /></div>
              <Button size="sm" className="h-10" disabled={!pick || register.isPending} onClick={() => register.mutateAsync(pick).then(() => { SucessMessage("Candidato inscrito."); setPick(""); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Inscrever</Button>
            </div>
          )}
          {session.registrations.length === 0 && <p className="py-4 text-center text-muted-foreground">Sem inscritos.</p>}
          <div className="space-y-2">
            {session.registrations.map((r) => {
              const d = rows[r.application_id];
              return (
                <div key={r.application_id} className="grid items-center gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1.4fr_auto]">
                  <div><p className="font-medium">{r.candidate}</p><p className="font-mono text-xs text-muted-foreground">{r.document_number}</p></div>
                  <div>
                    {r.status === "cancelado" ? <Badge variant="secondary">Cancelado</Badge> : d && (
                      <div className="flex gap-2">
                        <FormSelect label="" value={d.status} onValueChange={(v) => setRows((c) => ({ ...c, [r.application_id]: { ...d, status: v as Row["status"] } }))} options={[{ value: "presente", label: "Presente" }, { value: "ausente", label: "Ausente" }]} disabled={cancelled} className="flex-1" />
                        {d.status === "presente" && <div className="w-24"><Input label="" type="number" disabled={cancelled} placeholder="Nota" value={d.score} onChange={(e) => setRows((c) => ({ ...c, [r.application_id]: { ...d, score: e.target.value } }))} /></div>}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" className="gap-1" onClick={() => accessToken.mutateAsync(r.application_id).then((t) => { setToken(`${r.candidate}: ${t.token}`); SucessMessage("Código gerado."); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}><Icon name="Key" className="size-3.5" />Código</Button>
                </div>
              );
            })}
          </div>
          {token && <p className="break-all rounded-lg border border-amber-200 bg-amber-50 p-2 font-mono text-xs">{token}<br /><span className="font-sans text-amber-800">Entregue ao candidato/encarregado: não volta a ser mostrado.</span></p>}
          {!cancelled && <Button size="sm" onClick={save} disabled={putResults.isPending || session.registrations.length === 0}>Gravar resultados</Button>}
        </div>
      )}
    </FormModal>
  );
}

type SessionRow = ReturnType<typeof useAdmissionSessions>["sessions"][number];

/** Sessões presenciais da prova de acesso: vagas, inscrição de candidaturas, lançamento de notas e código de acesso do candidato. */
export function AdmissionSessionsPageContent() {
  const { sessions, isLoading, forbidden, cancel, levels } = useAdmissionSessions();
  const { openModal } = useModal();
  const [openId, setOpenId] = useState<string | null>(null);
  const [target, setTarget] = useState<SessionRow | null>(null);

  if (forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não tem acesso às sessões." />;

  const columns: Column<SessionRow>[] = [
    { key: "title", header: "Sessão", render: (_, s) => (<div className="flex flex-col"><span className="font-medium">{s.title}</span><span className="text-xs text-muted-foreground">{s.class_level?.name ?? "Todas as classes"}</span></div>) },
    { key: "scheduled_at", header: "Data", render: (_, s) => <span className="text-xs">{formatDateTime(s.scheduled_at)}</span> },
    { key: "location", header: "Local", render: (_, s) => s.location ?? "—" },
    { key: "registered", header: "Inscritos", render: (_, s) => <span className="font-mono text-xs">{s.registered} / {s.capacity} ({s.seats_left} vagas)</span> },
    { key: "status", header: "Estado", render: (_, s) => <Badge variant={s.status === "cancelada" ? "secondary" : "outline"}>{STATUS[s.status]}</Badge> },
    {
      key: "action", header: "Acção",
      render: (_, s) => (
        <ButtonOnlyAction data={s} actions={[
          { label: "Abrir sessão", icon: "Eye", onClick: (x) => { setOpenId(x.id); openModal("session-detail"); } },
          ...(s.status === "agendada" ? [{ permission: "admission:write", label: "Cancelar sessão", icon: "X" as const, variant: "destructive" as const, onClick: (x: SessionRow) => { setTarget(x); openModal("session-cancel"); } }] : []),
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Sessões da Prova de Acesso" suTitle="Datas, salas e vagas; o candidato consulta o estado com um código, sem conta.">
        <Can permission="admission:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("session-new")}><Icon name="Plus" className="size-4" />Nova sessão</Button></Can>
      </TitleList>

      <DataList<SessionRow>
        prefix="sessoes-acesso"
        rows={sessions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por título ou local"
        searchText={(s) => `${s.title} ${s.location ?? ""}`}
        filters={[
          { key: "estado", label: "Estado", icon: "CircleDot", options: Object.entries(STATUS).map(([value, label]) => ({ value, label })), match: (s, v) => s.status === v },
          { key: "classe", label: "Classe", icon: "GraduationCap", options: levels.map((l) => ({ value: l.id, label: l.name })), match: (s, v) => s.class_level?.name === levels.find((l) => l.id === v)?.name },
          { key: "vagas", label: "Vagas", icon: "Armchair", options: [{ value: "livres", label: "Com vagas" }, { value: "cheia", label: "Lotada" }], match: (s, v) => (v === "livres" ? s.seats_left > 0 : s.seats_left <= 0) },
        ]}
        dateFilters={[{ key: "data", label: "Sessão", getDate: (s) => s.scheduled_at }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.scheduled_at.localeCompare(b.scheduled_at) }, { value: "inscritos", label: "Inscritos", compare: (a, b) => a.registered - b.registered }]}
        emptyTitle="Ainda não há sessões"
        emptyIcon="ClipboardList"
      />

      <NewSessionModal />
      <SessionModal id={openId} />
      <ConfirmModal id="session-cancel" destructive title="Cancelar sessão" description={`Cancelar «${target?.title ?? ""}»? As inscrições ficam canceladas.`} confirmLabel="Cancelar sessão" isLoading={cancel.isPending} onConfirm={() => (target ? cancel.mutateAsync(target.id).then(() => SucessMessage("Sessão cancelada.")).catch(fail) : undefined)} />
    </div>
  );
}
