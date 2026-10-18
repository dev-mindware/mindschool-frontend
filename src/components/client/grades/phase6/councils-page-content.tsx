"use client";
import { formatDateTime } from "@/utils";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, Checkbox, ConfirmModal, DataList, EmptyState, FormModal, FormSelect, FormTextarea, Icon, Input, TitleList, type Column } from "@/components";
import { useCouncil, useCouncils } from "@/hooks/school/use-phase6";
import { phase6Service, OUTCOME_LABEL, type ApiCouncilAttendee, type Outcome } from "@/services/phase6-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const proposalOf = (p: unknown): Outcome | undefined => (p && typeof p === "object" && "outcome" in p ? ((p as { outcome?: Outcome }).outcome) : typeof p === "string" ? (p as Outcome) : undefined);
const ROLES = [{ value: "presidente", label: "Presidente" }, { value: "secretario", label: "Secretário" }, { value: "membro", label: "Membro" }];

function NewCouncilModal() {
  const { sections, terms, create } = useCouncils();
  const [sectionId, setSectionId] = useState("");
  const [kind, setKind] = useState<"periodico" | "final">("periodico");
  const [termId, setTermId] = useState("");
  const [when, setWhen] = useState("");
  const [agenda, setAgenda] = useState("");

  return (
    <FormModal id="council-new" title="Agendar conselho de turma" submitLabel="Agendar" isLoading={create.isPending} disabled={!sectionId || !when} onSubmit={() => create.mutateAsync({ sectionId, kind, termId: kind === "periodico" ? termId || terms[0]?.id : undefined, scheduledAt: new Date(when).toISOString(), agenda: agenda.trim() || undefined }).then(() => SucessMessage("Conselho agendado.")).catch(fail)}>
      <div className="sm:col-span-2"><FormSelect label="Turma *" value={sectionId} onValueChange={setSectionId} options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name}` }))} /></div>
      <FormSelect label="Tipo" value={kind} onValueChange={(v) => setKind(v as "periodico" | "final")} options={[{ value: "periodico", label: "Periódico (observações)" }, { value: "final", label: "Final (transição)" }]} />
      {kind === "periodico" && <FormSelect label="Trimestre" value={termId || terms[0]?.id || ""} onValueChange={setTermId} options={terms.map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` }))} />}
      <div className="sm:col-span-2"><Input label="Data e hora *" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></div>
      <FormTextarea label="Agenda (opcional)" value={agenda} onChange={setAgenda} rows={2} />
    </FormModal>
  );
}

function CouncilModal({ id }: { id: string | null }) {
  const { council, members, setAttendees, putDecisions, close } = useCouncil(id ?? undefined);
  const { openModal } = useModal();
  const [attendees, setLocalAttendees] = useState<ApiCouncilAttendee[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { outcome?: Outcome; justification: string; observation: string }>>({});
  const [minutes, setMinutes] = useState("");

  useEffect(() => {
    if (!council) return;
    setLocalAttendees(council.attendees);
    setDrafts(Object.fromEntries(council.students.map((s) => [s.enrollment_id, { outcome: s.decision?.outcome ?? undefined, justification: s.decision?.justification ?? "", observation: s.decision?.observation ?? "" }])));
  }, [council]);

  const closed = council?.status === "encerrado";
  const isFinal = council?.kind === "final";
  const staff = members.filter((m) => ["titular", "direccao_pedagogica", "professor", "secretaria"].includes(m.role));
  const toggle = (userId: string, name: string) =>
    setLocalAttendees((cur) => (cur.some((a) => a.user_id === userId) ? cur.filter((a) => a.user_id !== userId) : [...cur, { user_id: userId, name, role: cur.length === 0 ? "presidente" : "membro", present: true }]));

  const saveDecisions = () => {
    if (!council) return;
    const payload = council.students.flatMap<{ enrollment_id: string; outcome?: Outcome; justification?: string; observation?: string }>((s) => {
      const d = drafts[s.enrollment_id];
      if (!d) return [];
      if (isFinal) return d.outcome ? [{ enrollment_id: s.enrollment_id, outcome: d.outcome, ...(d.justification.trim() ? { justification: d.justification.trim() } : {}), ...(d.observation.trim() ? { observation: d.observation.trim() } : {}) }] : [];
      return d.observation.trim() ? [{ enrollment_id: s.enrollment_id, observation: d.observation.trim() }] : [];
    });
    if (payload.length === 0) return ErrorMessage("Nada para gravar.");
    void putDecisions.mutateAsync(payload).then(() => SucessMessage("Decisões gravadas.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));
  };

  const openMinutes = () => phase6Service.minutesPdf(id!).then((blob) => window.open(URL.createObjectURL(blob), "_blank")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir a acta.")));

  return (
    <FormModal id="council-detail" title={council ? `${council.section.class_level} ${council.section.name} — ${isFinal ? "Conselho final" : "Conselho periódico"}` : "Conselho de turma"} description={council ? (closed ? "Encerrado" : "Agendado") : undefined} size="xl" readOnly onSubmit={() => undefined}>
      {council && (
        <div className="sm:col-span-2 space-y-6 text-sm">
          <section className="space-y-3">
            <h4 className="font-semibold">Participantes</h4>
            {!closed && (
              <p className="text-xs text-muted-foreground">
                O primeiro que marcar fica como presidente (pode mudar o papel abaixo). Para encerrar são precisos o presidente e o mínimo de presentes das Políticas. «Gravar participantes» e «Gravar decisões» são botões separados: grave os dois antes de encerrar.
              </p>
            )}
            <div className="grid gap-2 sm:grid-cols-2">
              {staff.map((m) => (
                <label key={m.id} className="flex items-center gap-2 rounded-md border p-2"><Checkbox disabled={closed} checked={attendees.some((a) => a.user_id === m.user.id)} onCheckedChange={() => toggle(m.user.id, m.user.full_name)} />{m.user.full_name}<span className="text-xs text-muted-foreground">({m.role})</span></label>
              ))}
            </div>
            {attendees.map((a) => (
              <div key={a.user_id} className="grid items-center gap-2 sm:grid-cols-[1fr_180px_auto]">
                <span className="truncate">{a.name}</span>
                <FormSelect label="" value={a.role} onValueChange={(v) => setLocalAttendees((cur) => cur.map((x) => (x.user_id === a.user_id ? { ...x, role: v as ApiCouncilAttendee["role"] } : x)))} options={ROLES} disabled={closed} />
                <label className="flex items-center gap-2"><Checkbox disabled={closed} checked={a.present} onCheckedChange={(v) => setLocalAttendees((cur) => cur.map((x) => (x.user_id === a.user_id ? { ...x, present: Boolean(v) } : x)))} />Presente</label>
              </div>
            ))}
            {!closed && <Can permission="council:write"><Button size="sm" variant="outline" disabled={setAttendees.isPending} onClick={() => setAttendees.mutateAsync(attendees).then(() => SucessMessage("Participantes gravados.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Gravar participantes</Button></Can>}
          </section>

          <section className="space-y-3">
            <h4 className="font-semibold">{isFinal ? "Decisão de transição por aluno" : "Observações por aluno"}</h4>
            <div className="space-y-3">
              {council.students.map((s) => {
                const d = drafts[s.enrollment_id] ?? { justification: "", observation: "" };
                const proposed = proposalOf(s.system_proposal);
                const diverges = isFinal && d.outcome && proposed && d.outcome !== proposed;
                const set = (patch: Partial<typeof d>) => setDrafts((cur) => ({ ...cur, [s.enrollment_id]: { ...d, ...patch } }));
                return (
                  <div key={s.enrollment_id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2">
                    <div>
                      <p className="font-medium">{s.student.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isFinal ? (proposed ? `Proposta do sistema: ${OUTCOME_LABEL[proposed]}` : "Sem proposta (pautas por fechar)") : Object.entries(s.marks ?? {}).map(([k, v]) => `${k.slice(0, 4)} ${v ?? "—"}`).join(" · ")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {isFinal && <FormSelect label="" value={d.outcome ?? ""} onValueChange={(v) => set({ outcome: (v || undefined) as Outcome | undefined })} options={(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => ({ value: o, label: OUTCOME_LABEL[o] }))} placeholder="Decidir…" disabled={closed} />}
                      {diverges && <Input label="" disabled={closed} value={d.justification} onChange={(e) => set({ justification: e.target.value })} placeholder="Justificação (diverge da proposta)" />}
                      <Input label="" disabled={closed} value={d.observation} onChange={(e) => set({ observation: e.target.value })} placeholder="Observação" />
                    </div>
                  </div>
                );
              })}
            </div>
            {!closed && <Can permission="council:write"><Button size="sm" disabled={putDecisions.isPending} onClick={saveDecisions}>Gravar {isFinal ? "decisões" : "observações"}</Button></Can>}
          </section>

          <section className="space-y-3 border-t pt-4">
            {closed ? (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Conselho encerrado em {council.closed_at?.slice(0, 10)}.</p>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void openMinutes()}><Icon name="FileText" className="size-4" />Abrir acta (PDF)</Button>
              </div>
            ) : (
              <>
                <h4 className="font-semibold">Acta e encerramento</h4>
                <FormTextarea label="Texto da acta (mín. 30 caracteres)" value={minutes} onChange={setMinutes} rows={4} placeholder="Encerrar exige presidente, quórum e, no conselho final, aplica as decisões." />
                <Can permission="council:close"><Button size="sm" disabled={minutes.trim().length < 30 || close.isPending} onClick={() => openModal("council-close-confirm")}>Encerrar conselho</Button></Can>
                <ConfirmModal
                  id="council-close-confirm"
                  title={isFinal ? "Encerrar o conselho final" : "Encerrar o conselho"}
                  description="Encerra o conselho com a acta escrita."
                  confirmLabel="Encerrar conselho"
                  irreversible
                  isLoading={close.isPending}
                  effects={isFinal
                    ? [
                        "Exige o presidente e o mínimo de presentes definido nas Políticas (quórum), e uma decisão para todos os alunos.",
                        "As decisões de transição são APLICADAS: confirmam a progressão de cada aluno.",
                        "A acta fica fechada e disponível em PDF. Depois não se altera.",
                      ]
                    : [
                        "Exige o presidente e o mínimo de presentes definido nas Políticas (quórum).",
                        "As observações por aluno ficam registadas e a acta fica fechada, em PDF.",
                      ]}
                  onConfirm={() => close.mutateAsync(minutes.trim()).then(() => SucessMessage("Conselho encerrado.")).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; })}
                />
              </>
            )}
          </section>
        </div>
      )}
    </FormModal>
  );
}

type CouncilRow = ReturnType<typeof useCouncils>["councils"][number];

export function CouncilsPageContent() {
  const { councils, isLoading, forbidden, sections } = useCouncils();
  const { openModal } = useModal();
  const [openId, setOpenId] = useState<string | null>(null);

  if (forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não tem acesso aos conselhos de turma." />;
  const sectionName = (c: CouncilRow) => `${c.section.class_level} ${c.section.name}`.trim() || (sections.find((x) => x.id === c.section.id)?.name ?? "");

  const columns: Column<CouncilRow>[] = [
    { key: "section", header: "Turma", render: (_, c) => <span className="font-medium">{sectionName(c)}</span> },
    { key: "kind", header: "Tipo", render: (_, c) => (c.kind === "final" ? "Conselho final" : "Conselho periódico") },
    { key: "scheduled_at", header: "Agendado para", render: (_, c) => <span className="text-xs">{formatDateTime(c.scheduled_at)}</span> },
    { key: "agenda", header: "Agenda", render: (_, c) => <span className="line-clamp-1 text-muted-foreground">{c.agenda ?? "—"}</span> },
    { key: "status", header: "Estado", render: (_, c) => <Badge variant="outline">{c.status === "encerrado" ? "Encerrado" : "Agendado"}</Badge> },
    { key: "action", header: "Acção", render: (_, c) => <ButtonOnlyAction data={c} actions={[{ label: "Abrir conselho", icon: "Eye", onClick: (x) => { setOpenId(x.id); openModal("council-detail"); } }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Conselhos de Turma" suTitle="Conselhos periódicos (observações) e final (decisão de transição, com acta em PDF).">
        <Can permission="council:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("council-new")}><Icon name="Plus" className="size-4" />Agendar conselho</Button></Can>
      </TitleList>

      <DataList<CouncilRow>
        prefix="conselhos"
        rows={councils}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por turma ou agenda"
        searchText={(c) => `${sectionName(c)} ${c.agenda ?? ""}`}
        filters={[
          { key: "tipo", label: "Tipo", icon: "Tag", options: [{ value: "periodico", label: "Periódico" }, { value: "final", label: "Final" }], match: (c, v) => c.kind === v },
          { key: "estado", label: "Estado", icon: "CircleDot", options: [{ value: "agendado", label: "Agendado" }, { value: "encerrado", label: "Encerrado" }], match: (c, v) => (v === "encerrado" ? c.status === "encerrado" : c.status !== "encerrado") },
        ]}
        dateFilters={[{ key: "data", label: "Agendado", getDate: (c) => c.scheduled_at }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.scheduled_at.localeCompare(b.scheduled_at) }, { value: "turma", label: "Turma", compare: (a, b) => sectionName(a).localeCompare(sectionName(b)) }]}
        emptyTitle="Ainda não há conselhos agendados"
        emptyIcon="Users"
      />

      <NewCouncilModal />
      <CouncilModal id={openId} />
    </div>
  );
}
