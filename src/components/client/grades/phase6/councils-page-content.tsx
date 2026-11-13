"use client";
import { formatIsoDay } from "@/utils/format-date";
import { formatDateTime } from "@/utils";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, Checkbox, ConfirmModal, DataList, EmptyState, FormModal, FormSelect, FormTextarea, Icon, Input, TitleList, type Column } from "@/components";
import { GenericTable } from "@/components/common/generic-table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCouncil, useCouncils } from "@/hooks/school/use-phase6";
import { phase6Service, OUTCOME_LABEL, type ApiCouncilAttendee, type Outcome } from "@/services/phase6-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { optionalSafeTextSchema, safeTextSchema } from "@/schemas";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados do conselho de turma. Tente novamente.")); throw e; };
const proposalOf = (p: unknown): Outcome | undefined => (p && typeof p === "object" && "outcome" in p ? ((p as { outcome?: Outcome }).outcome) : typeof p === "string" ? (p as Outcome) : undefined);
const ROLES = [{ value: "presidente", label: "Presidente" }, { value: "secretario", label: "Secretário" }, { value: "membro", label: "Membro" }];

const newCouncilSchema = z
  .object({
    sectionId: z.string().trim().min(1, "Seleccione a turma."),
    kind: z.enum(["periodico", "final"]),
    termId: z.string().trim().optional(),
    when: z
      .string({ error: "A data e hora são obrigatórias." })
      .trim()
      .min(1, "A data e hora são obrigatórias.")
      .refine((v) => Number.isFinite(new Date(v).getTime()), "Data e hora inválidas."),
    agenda: optionalSafeTextSchema(500, 3, "A agenda do conselho"),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "periodico" && !data.termId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termId"],
        message: "Seleccione o trimestre.",
      });
    }
  });

type NewCouncilInput = z.input<typeof newCouncilSchema>;
type NewCouncilData = z.infer<typeof newCouncilSchema>;

const councilDivergenceSchema = safeTextSchema(5, 500, "A fundamentação da divergência");
const councilObservationSchema = optionalSafeTextSchema(500, 2, "A observação");
const councilMinutesSchema = safeTextSchema(30, 5000, "O texto da acta");

function NewCouncilModal() {
  const { sections, terms, create } = useCouncils();
  const defaultTermId = terms[0]?.id ?? "";

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewCouncilInput, unknown, NewCouncilData>({
    resolver: zodResolver(newCouncilSchema),
    mode: "onChange",
    defaultValues: {
      sectionId: "",
      kind: "periodico",
      termId: defaultTermId,
      when: "",
      agenda: "",
    },
  });

  const sectionId = watch("sectionId");
  const kind = watch("kind");
  const termId = watch("termId") ?? "";
  const agenda = watch("agenda") ?? "";

  useEffect(() => {
    if (kind === "periodico" && !termId && defaultTermId) {
      setValue("termId", defaultTermId, { shouldValidate: true });
    }
  }, [kind, termId, defaultTermId, setValue]);

  const resetDefaults = () =>
    reset({ sectionId: "", kind: "periodico", termId: terms[0]?.id ?? "", when: "", agenda: "" });

  const onSubmit = (data: NewCouncilData) =>
    create
      .mutateAsync({
        sectionId: data.sectionId,
        kind: data.kind,
        termId: data.kind === "periodico" ? data.termId : undefined,
        scheduledAt: new Date(data.when).toISOString(),
        agenda: data.agenda || undefined,
      })
      .then(() => {
        SucessMessage("Conselho agendado.");
        resetDefaults();
      })
      .catch((e) => {
        applyApiFieldErrors(e, setError);
        return fail(e);
      });

  return (
    <FormModal
      id="council-new"
      title="Agendar conselho de turma"
      submitLabel="Agendar"
      isLoading={create.isPending}
      disabled={!isValid || create.isPending}
      onClose={resetDefaults}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="sm:col-span-2">
        <FormSelect
          label="Turma *"
          value={sectionId}
          onValueChange={(v) => setValue("sectionId", v, { shouldValidate: true, shouldTouch: true })}
          options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name}` }))}
          error={errors.sectionId?.message}
        />
      </div>
      <FormSelect
        label="Tipo"
        value={kind}
        onValueChange={(v) => setValue("kind", v as "periodico" | "final", { shouldValidate: true })}
        options={[{ value: "periodico", label: "Periódico (observações)" }, { value: "final", label: "Final (transição)" }]}
        error={errors.kind?.message}
      />
      {kind === "periodico" && (
        <FormSelect
          label="Trimestre *"
          value={termId}
          onValueChange={(v) => setValue("termId", v, { shouldValidate: true, shouldTouch: true })}
          options={terms.map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` }))}
          error={errors.termId?.message}
        />
      )}
      <div className="sm:col-span-2">
        <Input
          label="Data e hora *"
          type="datetime-local"
          error={errors.when?.message}
          {...register("when")}
        />
      </div>
      <div className="sm:col-span-2">
        <FormTextarea
          label="Agenda do conselho (opcional)"
          placeholder="Ex.: Análise do aproveitamento pedagógico, assiduidade e comportamento dos alunos da turma..."
          value={agenda}
          onChange={(v) => setValue("agenda", v, { shouldValidate: true, shouldTouch: true })}
          rows={2}
          maxLength={500}
          error={errors.agenda?.message}
        />
      </div>
    </FormModal>
  );
}

type CouncilStudentRow = NonNullable<ReturnType<typeof useCouncil>["council"]>["students"][number] & { id: string };

function CouncilModal({ id }: { id: string | null }) {
  const { council, members, setAttendees, putDecisions, close } = useCouncil(id ?? undefined);
  const { open, openModal, closeModal } = useModal();
  const isOpen = Boolean(open["council-detail"]);
  const [attendees, setLocalAttendees] = useState<ApiCouncilAttendee[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { outcome?: Outcome; justification: string; observation: string }>>({});
  const [touchedDrafts, setTouchedDrafts] = useState<Record<string, { justification?: boolean; observation?: boolean }>>({});
  const [minutes, setMinutes] = useState("");
  const [minutesTouched, setMinutesTouched] = useState(false);

  useEffect(() => {
    if (!council) return;
    setLocalAttendees(council.attendees);
    setDrafts(Object.fromEntries(council.students.map((s) => [s.enrollment_id, { outcome: s.decision?.outcome ?? undefined, justification: s.decision?.justification ?? "", observation: s.decision?.observation ?? "" }])));
    setTouchedDrafts({});
    setMinutes("");
    setMinutesTouched(false);
  }, [council]);

  const closed = council?.status === "encerrado";
  const isFinal = council?.kind === "final";
  const staff = members.filter((m) => ["titular", "direccao_pedagogica", "professor", "secretaria"].includes(m.role));
  const toggle = (userId: string, name: string) =>
    setLocalAttendees((cur) => (cur.some((a) => a.user_id === userId) ? cur.filter((a) => a.user_id !== userId) : [...cur, { user_id: userId, name, role: cur.length === 0 ? "presidente" : "membro", present: true }]));

  const draftValidation = useMemo(() => {
    if (!council) return { hasErrors: false, payload: [] as Array<{ enrollment_id: string; outcome?: Outcome; justification?: string; observation?: string }> };
    let hasErrors = false;
    const payload: Array<{ enrollment_id: string; outcome?: Outcome; justification?: string; observation?: string }> = [];

    for (const s of council.students) {
      const d = drafts[s.enrollment_id];
      if (!d) continue;
      const proposed = proposalOf(s.system_proposal);
      const diverges = Boolean(isFinal && d.outcome && proposed && d.outcome !== proposed);
      const justParsed = diverges ? councilDivergenceSchema.safeParse(d.justification) : null;
      const obsParsed = councilObservationSchema.safeParse(d.observation);

      if ((justParsed && !justParsed.success) || !obsParsed.success) {
        hasErrors = true;
        continue;
      }
      if (isFinal) {
        if (d.outcome) {
          payload.push({
            enrollment_id: s.enrollment_id,
            outcome: d.outcome,
            ...(d.justification.trim() ? { justification: d.justification.trim() } : {}),
            ...(obsParsed.data ? { observation: obsParsed.data } : {}),
          });
        }
      } else if (obsParsed.data) {
        payload.push({ enrollment_id: s.enrollment_id, observation: obsParsed.data });
      }
    }
    return { hasErrors, payload };
  }, [council, drafts, isFinal]);

  const minutesParsed = useMemo(() => councilMinutesSchema.safeParse(minutes), [minutes]);
  const minutesError = minutesTouched && !minutesParsed.success ? minutesParsed.error.issues[0]?.message : undefined;

  const saveDecisions = () => {
    if (!council) return;
    if (draftValidation.hasErrors) {
      return ErrorMessage("Corrija os campos inválidos antes de gravar.");
    }
    if (draftValidation.payload.length === 0) return ErrorMessage("Nada para gravar.");
    void putDecisions.mutateAsync(draftValidation.payload).then(() => SucessMessage(isFinal ? "Decisões gravadas." : "Observações gravadas.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados do conselho de turma. Tente novamente.")));
  };

  const openMinutes = () => phase6Service.minutesPdf(id!).then((blob) => window.open(URL.createObjectURL(blob), "_blank")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir a acta.")));

  // por nome, com a ordem do português (a ordem do servidor põe «Ângela» depois do «Z»)
  const studentRows: CouncilStudentRow[] = (council?.students ?? []).map((s) => ({ ...s, id: s.enrollment_id })).sort((a, b) => a.student.full_name.localeCompare(b.student.full_name, "pt"));
  const studentColumns: Column<CouncilStudentRow>[] = [
    {
      key: "student",
      header: "Estudante",
      render: (_, s) => {
        const proposed = proposalOf(s.system_proposal);
        return (
          <div>
            <p className="font-medium">{s.student.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {isFinal ? (proposed ? `Proposta do sistema: ${OUTCOME_LABEL[proposed]}` : "Sem proposta (pautas por fechar)") : Object.entries(s.marks ?? {}).map(([k, v]) => `${k} ${v ?? "—"}`).join(" · ")}
            </p>
          </div>
        );
      },
    },
    {
      key: "decision",
      header: isFinal ? "Decisão e Observação" : "Observação",
      render: (_, s) => {
        const d = drafts[s.enrollment_id] ?? { justification: "", observation: "" };
        const t = touchedDrafts[s.enrollment_id] ?? {};
        const proposed = proposalOf(s.system_proposal);
        const diverges = Boolean(isFinal && d.outcome && proposed && d.outcome !== proposed);
        const justParsed = diverges ? councilDivergenceSchema.safeParse(d.justification) : null;
        const obsParsed = councilObservationSchema.safeParse(d.observation);
        const justError = diverges && justParsed && !justParsed.success && (t.justification || diverges)
          ? justParsed.error.issues[0]?.message
          : undefined;
        const obsError = t.observation && !obsParsed.success ? obsParsed.error.issues[0]?.message : undefined;

        const set = (patch: Partial<typeof d>) => setDrafts((cur) => ({ ...cur, [s.enrollment_id]: { ...d, ...patch } }));
        return (
          <div className="space-y-2">
            {isFinal && <FormSelect label="" value={d.outcome ?? ""} onValueChange={(v) => set({ outcome: (v || undefined) as Outcome | undefined })} options={(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => ({ value: o, label: OUTCOME_LABEL[o] }))} placeholder="Decidir…" disabled={closed} />}
            {diverges && (
              <Input
                label=""
                disabled={closed}
                maxLength={500}
                value={d.justification}
                error={justError}
                onChange={(e) => {
                  set({ justification: e.target.value });
                  setTouchedDrafts((cur) => ({ ...cur, [s.enrollment_id]: { ...t, justification: true } }));
                }}
                placeholder="Fundamentação obrigatória da divergência (mín. 5 car.)..."
              />
            )}
            <Input
              label=""
              disabled={closed}
              maxLength={500}
              value={d.observation}
              error={obsError}
              onChange={(e) => {
                set({ observation: e.target.value });
                setTouchedDrafts((cur) => ({ ...cur, [s.enrollment_id]: { ...t, observation: true } }));
              }}
              placeholder="Observações pedagógicas relevantes..."
            />
          </div>
        );
      },
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(next) => { if (!next) closeModal("council-detail"); }}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-3xl">
        <SheetHeader className="p-0">
          <SheetTitle>{council ? `${council.section.class_level} ${council.section.name} — ${isFinal ? "Conselho final" : "Conselho periódico"}` : "Conselho de turma"}</SheetTitle>
          {council && <SheetDescription>{closed ? "Encerrado" : new Date(council.scheduled_at).getTime() < Date.now() ? "Agendado para uma data já passada: grave os participantes e as decisões e encerre." : "Agendado"}</SheetDescription>}
        </SheetHeader>

        {council && (
          <div className="space-y-6 text-sm">
            <section className="space-y-3">
              <h4 className="font-semibold">Participantes</h4>
              {!closed && (
                <p className="text-xs text-muted-foreground">
                  O primeiro que marcar fica como presidente (pode mudar o papel abaixo). Para encerrar são precisos o presidente e o mínimo de presentes das Políticas. «Gravar participantes» e «Gravar {isFinal ? "decisões" : "observações"}» são botões separados: grave os dois antes de encerrar.
                </p>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {staff.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 rounded-xs border p-2"><Checkbox disabled={closed} checked={attendees.some((a) => a.user_id === m.user.id)} onCheckedChange={() => toggle(m.user.id, m.user.full_name)} />{m.user.full_name}<span className="text-xs text-muted-foreground">({m.role})</span></label>
                ))}
              </div>
              {attendees.map((a) => (
                <div key={a.user_id} className="grid items-center gap-2 sm:grid-cols-[1fr_180px_auto]">
                  <span className="truncate">{a.name}</span>
                  <FormSelect label="" value={a.role} onValueChange={(v) => setLocalAttendees((cur) => cur.map((x) => (x.user_id === a.user_id ? { ...x, role: v as ApiCouncilAttendee["role"] } : x)))} options={ROLES} disabled={closed} />
                  <label className="flex items-center gap-2"><Checkbox disabled={closed} checked={a.present} onCheckedChange={(v) => setLocalAttendees((cur) => cur.map((x) => (x.user_id === a.user_id ? { ...x, present: Boolean(v) } : x)))} />Presente</label>
                </div>
              ))}
              {!closed && <Can permission="council:write"><Button size="sm" variant="outline" disabled={setAttendees.isPending} onClick={() => setAttendees.mutateAsync(attendees).then(() => SucessMessage("Participantes gravados.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados do conselho de turma. Tente novamente.")))}>Gravar participantes</Button></Can>}
            </section>

            <section className="space-y-3">
              <h4 className="font-semibold">{isFinal ? "Decisão de transição por aluno" : "Observações por aluno"}</h4>
              <GenericTable data={studentRows} columns={studentColumns} />
              {!closed && (
                <Can permission="council:write">
                  <Button
                    size="sm"
                    disabled={putDecisions.isPending || draftValidation.hasErrors || draftValidation.payload.length === 0}
                    onClick={saveDecisions}
                  >
                    Gravar {isFinal ? "decisões" : "observações"}
                  </Button>
                </Can>
              )}
            </section>

            <section className="space-y-3 border-t pt-4">
              {closed ? (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">Conselho encerrado em {formatIsoDay(council.closed_at)}.</p>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => void openMinutes()}><Icon name="FileText" className="size-4" />Abrir acta (PDF)</Button>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold">Acta e encerramento</h4>
                  <FormTextarea
                    label="Texto da acta (mín. 30 caracteres) *"
                    value={minutes}
                    onChange={(v) => {
                      setMinutes(v);
                      setMinutesTouched(true);
                    }}
                    rows={4}
                    maxLength={5000}
                    error={minutesError}
                    placeholder="Encerrar exige presidente, quórum e, no conselho final, aplica as decisões."
                  />
                  <Can permission="council:close">
                    <Button
                      size="sm"
                      disabled={!minutesParsed.success || close.isPending}
                      onClick={() => openModal("council-close-confirm")}
                    >
                      Encerrar conselho
                    </Button>
                  </Can>
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
                    onConfirm={() => close.mutateAsync(minutes.trim()).then(() => SucessMessage("Conselho encerrado.")).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados do conselho de turma. Tente novamente.")); throw e; })}
                  />
                </>
              )}
            </section>
          </div>
        )}

        <SheetFooter className="p-0 pt-4">
          <Button type="button" variant="outline" onClick={() => closeModal("council-detail")}>Fechar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
    { key: "status", header: "Estado", render: (_, c) => c.status === "encerrado" ? <Badge variant="outline">Encerrado</Badge> : new Date(c.scheduled_at).getTime() < Date.now() ? <Badge variant="warning">Data passada: por encerrar</Badge> : <Badge variant="outline">Agendado</Badge> },
    { key: "action", header: "Ação", render: (_, c) => <ButtonOnlyAction data={c} actions={[{ label: "Abrir conselho", icon: "Eye", onClick: (x) => { setOpenId(x.id); openModal("council-detail"); } }]} /> },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Conselhos de Turma" suTitle="Sessões do conselho de notas e deliberações.">
        <Can permission="council:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("council-new")}><Icon name="Plus" className="size-4" />Agendar conselho</Button></Can>
      </TitleList>

      <DataList<CouncilRow>
        prefix="councils"
        rows={councils}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar por turma ou agenda"
        searchText={(c) => `${sectionName(c)} ${c.agenda ?? ""}`}
        filters={[
          { key: "type", label: "Tipo", icon: "Tag", options: [{ value: "periodico", label: "Periódico" }, { value: "final", label: "Final" }], match: (c, v) => c.kind === v },
          { key: "status", label: "Estado", icon: "CircleDot", options: [{ value: "agendado", label: "Agendado" }, { value: "encerrado", label: "Encerrado" }], match: (c, v) => (v === "encerrado" ? c.status === "encerrado" : c.status !== "encerrado") },
        ]}
        dateFilters={[{ key: "date", label: "Agendado", getDate: (c) => c.scheduled_at }]}
        sorts={[{ value: "date", label: "Data", compare: (a, b) => a.scheduled_at.localeCompare(b.scheduled_at) }, { value: "section", label: "Turma", compare: (a, b) => sectionName(a).localeCompare(sectionName(b)) }]}
        emptyTitle="Ainda não há conselhos agendados"
        emptyDescription="Quando a direção agendar um conselho de turma, ele aparece aqui."
        emptyIcon="Users"
      />

      <NewCouncilModal />
      <CouncilModal id={openId} />
    </div>
  );
}
