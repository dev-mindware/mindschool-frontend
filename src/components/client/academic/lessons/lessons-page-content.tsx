"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  isoDateSchema,
  optionalSafeTextSchema,
  safeTextSchema,
  timeHHMMSchema,
} from "@/schemas/helps";
import {
  Badge,
  Button,
  ButtonOnlyAction,
  DataList,
  EmptyState,
  FormCombobox,
  FormModal,
  FormTextarea,
  Icon,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TitleList,
  WeekTimetable,
  type Column,
  type TimetableBlock,
  Can,
} from "@/components";
import { useAuth } from "@/hooks/auth/use-auth";
import { useCan } from "@/hooks/auth/use-can";
import { PlanningPanel } from "../planning";
import { useLessonSummary, useLessons } from "@/hooks/school/use-lessons";
import { academicService } from "@/services/academic-service";
import { LESSON_STATUS_LABEL, type ApiLesson } from "@/services/lessons-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { LessonKeepEditor } from "./lesson-keep-editor";
import { TodayAgendaBanner } from "./today-agenda-banner";
import { getLessonKeepNote } from "./use-lesson-keep";

const SUM_STATUS = {
  rascunho: "Rascunho",
  submetido: "Submetido",
  validado: "Validado",
  devolvido: "Devolvido",
} as const;
const err = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados da aula ou do sumário. Tente novamente."));
const TONE: Record<string, TimetableBlock["tone"]> = {
  prevista: "primary",
  realizada: "success",
  substituida: "warning",
  reposta: "success",
  cancelada: "danger",
  nao_realizada: "danger",
};

const isoOf = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const mondayOf = (d: Date) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
};

const notGivenReasonSchema = safeTextSchema(5, 500, "O motivo");
const mgmtReasonSchema = safeTextSchema(5, 500, "O motivo");
const substituteSchema = z.object({
  subTeacher: z.string().trim().min(1, "Seleccione o professor substituto."),
  mgmtReason: mgmtReasonSchema,
});
const rescheduleSchema = z
  .object({
    newDate: isoDateSchema("A nova data"),
    newStart: timeHHMMSchema("A hora de início"),
    newEnd: timeHHMMSchema("A hora de fim"),
  })
  .refine((d) => d.newEnd > d.newStart, {
    message: "A hora de fim deve ser posterior à hora de início.",
    path: ["newEnd"],
  });
const lessonSummarySchema = z.object({
  content: safeTextSchema(10, 5000, "O conteúdo leccionado"),
  objectives: optionalSafeTextSchema(500, 2, "Os objectivos pedagógicos"),
  homework: optionalSafeTextSchema(500, 2, "O trabalho de casa (TPC)"),
});
const returnSummaryNoteSchema = safeTextSchema(5, 500, "A observação");

function LessonModal({ lesson }: { lesson: ApiLesson | null }) {
  const { record, cancel, substitute, reschedule } = useLessons();
  const { can } = useCan();
  // A lista de professores serve para escolher o substituto (gestão); o professor não a lê.
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers", "lesson-modal"],
    queryFn: academicService.teachers,
    enabled: can("teacher:read"),
    staleTime: 60 * 1000,
  });
  const { closeModal } = useModal();
  const { summary, save, review } = useLessonSummary(lesson?.id);
  const [subTeacher, setSubTeacher] = useState("");
  const [mgmtReason, setMgmtReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [content, setContent] = useState("");
  const [objectives, setObjectives] = useState("");
  const [homework, setHomework] = useState("");
  const [reason, setReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (k: string) => setTouched((p) => (p[k] ? p : { ...p, [k]: true }));

  useEffect(() => {
    setContent(summary?.content ?? "");
    setObjectives(summary?.objectives ?? "");
    setHomework(summary?.homework ?? "");
  }, [summary, lesson?.id]);

  useEffect(() => {
    setTouched({});
    setReason("");
    setMgmtReason("");
    setSubTeacher("");
    setNewDate("");
    setNewStart("");
    setNewEnd("");
    setReturnNote("");
  }, [lesson?.id]);

  const reasonParsed = useMemo(() => notGivenReasonSchema.safeParse(reason), [reason]);
  const mgmtReasonParsed = useMemo(() => mgmtReasonSchema.safeParse(mgmtReason), [mgmtReason]);
  const subParsed = useMemo(() => substituteSchema.safeParse({ subTeacher, mgmtReason }), [subTeacher, mgmtReason]);
  const rescheduleParsed = useMemo(
    () => rescheduleSchema.safeParse({ newDate, newStart, newEnd }),
    [newDate, newStart, newEnd],
  );
  const summaryParsed = useMemo(
    () => lessonSummarySchema.safeParse({ content, objectives, homework }),
    [content, objectives, homework],
  );
  const returnNoteParsed = useMemo(() => returnSummaryNoteSchema.safeParse(returnNote), [returnNote]);

  const given = lesson ? ["realizada", "substituida", "reposta"].includes(lesson.status) : false;
  const done = (ok: string) => () => {
    SucessMessage(ok);
    closeModal("lesson-detail");
  };
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

  return (
    <FormModal
      id="lesson-detail"
      title={lesson ? `${lesson.subject.name} — ${lesson.section.name}` : "Aula"}
      description={
        lesson
          ? `${lesson.date} ${lesson.start}–${lesson.end} • ${lesson.teacher.full_name}${
              lesson.substitute_teacher
                ? ` (substituto: ${lesson.substitute_teacher.full_name})`
                : ""
            } • ${LESSON_STATUS_LABEL[lesson.status]}`
          : undefined
      }
      size="xl"
      readOnly
      onSubmit={() => undefined}
    >
      {lesson && (
        <div className="space-y-4 text-sm">
          <Tabs defaultValue="keep" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
              <TabsTrigger value="keep" className="gap-1.5 text-xs">
                <Icon name="NotebookPen" className="w-3.5 h-3.5 text-primary" />
                Mini Keep (Plano de Aula)
              </TabsTrigger>
              <TabsTrigger value="official" className="gap-1.5 text-xs">
                <Icon name="FileCheck" className="w-3.5 h-3.5 text-muted-foreground" />
                Registo & Sumário Oficial
              </TabsTrigger>
            </TabsList>

            {/* Tab: Mini Google Keep */}
            <TabsContent value="keep" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Espaço pessoal do professor para organizar o roteiro didáctico, checklist de aula, notas rápidas e tarefas de casa estilo Google Keep.
              </p>
              <LessonKeepEditor
                lesson={lesson}
                onSyncRemote={(data) => {
                  if (given) {
                    save.mutate({
                      content: data.content,
                      objectives: data.objectives,
                      homework: data.homework,
                      submit: false,
                    });
                  }
                }}
              />
            </TabsContent>

            {/* Tab: Registo & Sumário Oficial da Escola */}
            <TabsContent value="official" className="space-y-4">
              {lesson.status === "prevista" && (
                <section className="space-y-3 rounded-xs border p-3.5 bg-card">
                  <h4 className="font-semibold text-xs flex items-center gap-1.5">
                    <Icon name="CheckCircle2" className="w-4 h-4 text-primary" />
                    Registar a Realização da Aula
                  </h4>
                  <Textarea
                    label="Motivo (obrigatório se não realizada)"
                    placeholder="Indique a fundamentação caso a aula não tenha sido realizada..."
                    rows={2}
                    value={reason}
                    onChange={(e) => { markTouched("reason"); setReason(e.target.value); }}
                    error={touched.reason && !reasonParsed.success ? reasonParsed.error.issues[0]?.message : undefined}
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={record.isPending}
                      onClick={() =>
                        record
                          .mutateAsync({ id: lesson.id, status: "realizada" })
                          .then(done("Aula registada como realizada."))
                          .catch(err)
                      }
                      className="gap-1.5"
                    >
                      <Icon name="Check" className="w-3.5 h-3.5" />
                      Marcar Realizada
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={record.isPending || !reasonParsed.success}
                      onClick={() =>
                        reasonParsed.success &&
                        record
                          .mutateAsync({
                            id: lesson.id,
                            status: "nao_realizada",
                            reason: reasonParsed.data,
                          })
                          .then(done("Aula registada como não realizada."))
                          .catch(err)
                      }
                    >
                      Não realizada
                    </Button>
                  </div>
                </section>
              )}

              {lesson.status === "prevista" && (
                <section className="space-y-3 rounded-xs border p-3.5 bg-card">
                  <h4 className="font-semibold text-xs flex items-center gap-1.5">
                    <Icon name="CalendarSync" className="w-4 h-4 text-primary" />
                    Gestão da Aula (Coordenação)
                  </h4>
                  <Textarea
                    label="Motivo da substituição (mín. 5 caracteres)"
                    placeholder="Fundamente a necessidade de substituição ou alteração de aula..."
                    rows={2}
                    value={mgmtReason}
                    onChange={(e) => { markTouched("mgmtReason"); setMgmtReason(e.target.value); }}
                    error={touched.mgmtReason && !mgmtReasonParsed.success ? mgmtReasonParsed.error.issues[0]?.message : undefined}
                  />
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-start">
                    <FormCombobox
                      label="Professor substituto"
                      value={subTeacher}
                      onValueChange={(v) => { markTouched("subTeacher"); setSubTeacher(v); }}
                      options={teachers.map((t) => ({ value: t.id, label: t.full_name }))}
                      error={touched.subTeacher && !subParsed.success ? subParsed.error.issues.find((i) => i.path[0] === "subTeacher")?.message : undefined}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-6 h-10"
                      disabled={!subParsed.success || substitute.isPending}
                      onClick={() =>
                        subParsed.success &&
                        substitute
                          .mutateAsync({
                            id: lesson.id,
                            teacherId: subParsed.data.subTeacher,
                            reason: subParsed.data.mgmtReason,
                          })
                          .then(done("Substituição registada."))
                          .catch(err)
                      }
                    >
                      Substituir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-6 h-10 text-destructive"
                      disabled={!mgmtReasonParsed.success || cancel.isPending}
                      onClick={() =>
                        mgmtReasonParsed.success &&
                        cancel
                          .mutateAsync({ id: lesson.id, reason: mgmtReasonParsed.data })
                          .then(done("Aula cancelada."))
                          .catch(err)
                      }
                    >
                      Cancelar aula
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-start">
                    <Input
                      label="Nova data"
                      type="date"
                      value={newDate}
                      onChange={(e) => { markTouched("newDate"); setNewDate(e.target.value); }}
                      error={touched.newDate && !rescheduleParsed.success ? rescheduleParsed.error.issues.find((i) => i.path[0] === "newDate")?.message : undefined}
                    />
                    <Input
                      label="Início"
                      type="time"
                      value={newStart}
                      onChange={(e) => { markTouched("newStart"); setNewStart(e.target.value); }}
                      error={touched.newStart && !rescheduleParsed.success ? rescheduleParsed.error.issues.find((i) => i.path[0] === "newStart")?.message : undefined}
                    />
                    <Input
                      label="Fim"
                      type="time"
                      value={newEnd}
                      onChange={(e) => { markTouched("newEnd"); setNewEnd(e.target.value); }}
                      error={(touched.newEnd || (touched.newStart && Boolean(newEnd))) && !rescheduleParsed.success ? rescheduleParsed.error.issues.find((i) => i.path[0] === "newEnd")?.message : undefined}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-6 h-10"
                      disabled={!rescheduleParsed.success || reschedule.isPending}
                      onClick={() =>
                        rescheduleParsed.success &&
                        reschedule
                          .mutateAsync({
                            id: lesson.id,
                            date: rescheduleParsed.data.newDate,
                            startMinute: m(rescheduleParsed.data.newStart),
                            endMinute: m(rescheduleParsed.data.newEnd),
                          })
                          .then(done("Aula reagendada."))
                          .catch(err)
                      }
                    >
                      Reagendar
                    </Button>
                  </div>
                </section>
              )}

              {given && (
                <section className="space-y-3 rounded-xs border p-3.5 bg-card">
                  <h4 className="font-semibold text-xs flex items-center justify-between">
                    <span>
                      Sumário Escolar{" "}
                      {summary
                        ? `(v${summary.version_number}, ${SUM_STATUS[summary.status]}${
                            summary.late ? ", tardio" : ""
                          })`
                        : ""}
                    </span>
                  </h4>
                  {summary?.review_note && (
                    <p className="rounded bg-amber-50 p-2 text-xs text-amber-800">
                      Observação da coordenação: {summary.review_note}
                    </p>
                  )}
                  <FormTextarea
                    label="Conteúdo leccionado (mín. 10 caracteres)"
                    placeholder="Descreva os tópicos abordados, exercícios resolvidos e matéria leccionada..."
                    value={content}
                    onChange={(v) => { markTouched("content"); setContent(v); }}
                    error={touched.content && !summaryParsed.success ? summaryParsed.error.issues.find((i) => i.path[0] === "content")?.message : undefined}
                    rows={4}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Objectivos pedagógicos"
                      placeholder="Ex.: Compreender os conceitos de geometria plana..."
                      value={objectives}
                      onChange={(e) => { markTouched("objectives"); setObjectives(e.target.value); }}
                      error={touched.objectives && !summaryParsed.success ? summaryParsed.error.issues.find((i) => i.path[0] === "objectives")?.message : undefined}
                    />
                    <Input
                      label="Trabalho de casa (TPC)"
                      placeholder="Ex.: Exercícios 1 a 6 da página 54..."
                      value={homework}
                      onChange={(e) => { markTouched("homework"); setHomework(e.target.value); }}
                      error={touched.homework && !summaryParsed.success ? summaryParsed.error.issues.find((i) => i.path[0] === "homework")?.message : undefined}
                    />
                  </div>
                  <div className="flex flex-wrap items-start gap-2 pt-1">
                    <Button
                      size="sm"
                      disabled={save.isPending || !summaryParsed.success}
                      onClick={() =>
                        summaryParsed.success &&
                        save
                          .mutateAsync({
                            content: summaryParsed.data.content,
                            objectives: summaryParsed.data.objectives || undefined,
                            homework: summaryParsed.data.homework || undefined,
                            submit: true,
                          })
                          .then(() => SucessMessage("Sumário submetido."))
                          .catch(err)
                      }
                    >
                      Submeter sumário à coordenação
                    </Button>
                    {summary && summary.status === "submetido" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={review.isPending}
                          onClick={() =>
                            review
                              .mutateAsync({ summaryId: summary.id, decision: "validado" })
                              .then(() => SucessMessage("Sumário validado."))
                              .catch(err)
                          }
                        >
                          Validar
                        </Button>
                        <div className="max-w-60">
                          <Input
                            label=""
                            placeholder="Observação ao devolver (mín. 5)"
                            value={returnNote}
                            onChange={(e) => { markTouched("returnNote"); setReturnNote(e.target.value); }}
                            error={touched.returnNote && !returnNoteParsed.success ? returnNoteParsed.error.issues[0]?.message : undefined}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          disabled={review.isPending || !returnNoteParsed.success}
                          onClick={() =>
                            returnNoteParsed.success &&
                            review
                              .mutateAsync({
                                summaryId: summary.id,
                                decision: "devolvido",
                                note: returnNoteParsed.data,
                              })
                              .then(() => SucessMessage("Sumário devolvido."))
                              .catch(err)
                          }
                        >
                          Devolver
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    O sumário formal é submetido para validação da coordenação pedagógica.
                  </p>
                </section>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </FormModal>
  );
}

/** Aulas e sumários: vista semanal em calendário com mini Google Keep e gestão pedagógica. */
export function LessonsPageContent() {
  const { user } = useAuth();
  const { can } = useCan();
  const [scope, setScope] = useState<"mine" | "all">(
    user?.role === "TEACHER" ? "mine" : "all"
  );
  const l = useLessons(scope);
  const { openModal } = useModal();
  const [open, setOpen] = useState<ApiLesson | null>(null);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));

  const openLesson = (x: ApiLesson) => {
    setOpen(x);
    openModal("lesson-detail");
  };

  const todayStr = useMemo(() => isoOf(new Date()), []);
  const todayLessons = useMemo(
    () => l.lessons.filter((x) => x.date === todayStr),
    [l.lessons, todayStr]
  );

  const weekBlocks = useMemo<TimetableBlock<ApiLesson>[]>(() => {
    const from = isoOf(weekStart);
    const to = isoOf(new Date(weekStart.getTime() + 6 * 86_400_000));
    return l.lessons
      .filter((x) => x.date >= from && x.date <= to)
      .map((x) => {
        const keep = getLessonKeepNote(x.id);
        const hasKeep = Boolean(keep);
        return {
          id: x.id,
          weekday: (((new Date(`${x.date}T00:00:00`).getDay() + 6) % 7) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          start: x.start,
          end: x.end,
          title: x.subject.name,
          subtitle: `${x.section.name} · ${x.teacher.full_name}`,
          meta: hasKeep ? `📝 Keep · ${LESSON_STATUS_LABEL[x.status]}` : LESSON_STATUS_LABEL[x.status],
          tone: TONE[x.status] ?? "primary",
          data: x,
        };
      });
  }, [l.lessons, weekStart]);

  const columns: Column<ApiLesson>[] = [
    {
      key: "date",
      header: "Data",
      render: (_, x) => (
        <span className="font-mono text-xs whitespace-nowrap">
          {x.date} {x.start}–{x.end}
        </span>
      ),
    },
    { key: "section.name", header: "Turma", render: (_, x) => x.section.name },
    { key: "subject.name", header: "Disciplina", render: (_, x) => x.subject.name },
    { key: "teacher.full_name", header: "Professor", render: (_, x) => x.teacher.full_name },
    {
      key: "status",
      header: "Estado",
      render: (_, x) => {
        const keep = getLessonKeepNote(x.id);
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">{LESSON_STATUS_LABEL[x.status]}</Badge>
            {keep && (
              <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0 h-4">
                <Icon name="NotebookPen" className="w-2.5 h-2.5 text-primary" />
                Keep
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "action",
      header: "Ação",
      render: (_, x) => (
        <ButtonOnlyAction
          data={x}
          actions={[{ label: "Abrir aula e plano Keep", icon: "Eye", onClick: openLesson }]}
        />
      ),
    },
  ];

  const lessonFilters = (rows: ApiLesson[]) => ({
    filters: [
      {
        key: "status",
        label: "Estado",
        icon: "CircleDot" as const,
        options: Object.entries(LESSON_STATUS_LABEL).map(([value, label]) => ({
          value,
          label,
        })),
        match: (x: ApiLesson, v: string) => x.status === v,
      },
      {
        key: "section",
        label: "Turma",
        icon: "Users" as const,
        options: [...new Set(rows.map((x) => x.section.name))].sort().map((s) => ({
          value: s,
          label: s,
        })),
        match: (x: ApiLesson, v: string) => x.section.name === v,
      },
      {
        key: "subject",
        label: "Disciplina",
        icon: "BookOpen" as const,
        options: [...new Set(rows.map((x) => x.subject.name))].sort().map((s) => ({
          value: s,
          label: s,
        })),
        match: (x: ApiLesson, v: string) => x.subject.name === v,
      },
      {
        key: "teacher",
        label: "Professor",
        icon: "GraduationCap" as const,
        options: [...new Set(rows.map((x) => x.teacher.full_name))].sort().map((s) => ({
          value: s,
          label: s,
        })),
        match: (x: ApiLesson, v: string) => x.teacher.full_name === v,
      },
    ],
    dateFilters: [{ key: "date", label: "Aula", getDate: (x: ApiLesson) => x.date }],
    sorts: [
      {
        value: "date",
        label: "Data",
        compare: (a: ApiLesson, b: ApiLesson) =>
          `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`),
      },
      {
        value: "section",
        label: "Turma",
        compare: (a: ApiLesson, b: ApiLesson) => a.section.name.localeCompare(b.section.name),
      },
    ],
  });

  const statColumns: Column<(typeof l.stats)[number] & { id: string }>[] = [
    { key: "section", header: "Turma" },
    { key: "subject", header: "Disciplina" },
    { key: "teacher", header: "Professor" },
    { key: "given", header: "Dadas", render: (_, s) => <span className="font-mono">{s.given}</span> },
    {
      key: "planned",
      header: "Previstas",
      render: (_, s) => <span className="font-mono">{s.planned}</span>,
    },
    {
      key: "compliance_rate",
      header: "Cumprimento",
      render: (_, s) => (
        <span className="font-mono font-semibold">
          {s.compliance_rate === null ? "—" : `${s.compliance_rate}%`}
        </span>
      ),
    },
  ];

  if (l.forbidden)
    return (
      <EmptyState
        icon="Lock"
        title="Sem acesso"
        description="O seu perfil não tem acesso às aulas (plano Profissional ou superior)."
      />
    );

  return (
    <div className="space-y-6">
      <TitleList
        title="Aulas e Sumários"
        suTitle="Registo de lições, sumários e conteúdos programáticos."
      >
        <div className="flex items-center gap-2">
          <Tabs value={scope} onValueChange={(v) => setScope(v as "mine" | "all")}>
            <TabsList>
              <TabsTrigger value="mine">As minhas aulas</TabsTrigger>
              <TabsTrigger value="all">Todas</TabsTrigger>
            </TabsList>
          </Tabs>
          <Can permission="lesson:manage">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={l.generate.isPending}
              onClick={() =>
                l.generate
                  .mutateAsync()
                  .then(() => SucessMessage("Aulas geradas."))
                  .catch(err)
              }
            >
              <Icon name="RefreshCcw" className="size-4" />
              Gerar aulas
            </Button>
          </Can>
        </div>
      </TitleList>

      {/* Widget/Banner estilo Google Keep: A Sua Agenda de Hoje */}
      <TodayAgendaBanner todayLessons={todayLessons} onOpenLesson={openLesson} />

      <Tabs defaultValue="week" className="space-y-2">
        <TabsList>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="missing">Sumários em falta ({l.missing.length})</TabsTrigger>
          <TabsTrigger value="stats">Cumprimento</TabsTrigger>
          {can("teaching_plan:read") && <TabsTrigger value="planning">Planeamento</TabsTrigger>}
        </TabsList>

        <TabsContent value="week" className="space-y-4">
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">
              {weekStart.toLocaleDateString("pt-AO", { day: "2-digit", month: "long" })} —{" "}
              {new Date(weekStart.getTime() + 6 * 86_400_000).toLocaleDateString("pt-AO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="outline"
                className="size-9"
                onClick={() =>
                  setWeekStart(new Date(weekStart.getTime() - 7 * 86_400_000))
                }
                aria-label="Semana anterior"
              >
                <Icon name="ChevronLeft" className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={() => setWeekStart(mondayOf(new Date()))}
              >
                Hoje
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-9"
                onClick={() =>
                  setWeekStart(new Date(weekStart.getTime() + 7 * 86_400_000))
                }
                aria-label="Semana seguinte"
              >
                <Icon name="ChevronRight" className="size-4" />
              </Button>
            </div>
          </div>
          <WeekTimetable<ApiLesson>
            blocks={weekBlocks}
            onBlockClick={(b) => b.data && openLesson(b.data)}
          />
          <p className="text-xs text-muted-foreground">
            Clique numa aula para abrir o mini Google Keep, registar a realização ou redigir o sumário pedagógico.
          </p>
        </TabsContent>

        <TabsContent value="list">
          <DataList<ApiLesson>
            prefix="lessons"
            rows={l.lessons}
            columns={columns}
            isLoading={l.isLoading}
            searchPlaceholder="Pesquisar aulas"
            searchText={(x) => `${x.subject.name} ${x.section.name} ${x.teacher.full_name}`}
            {...lessonFilters(l.lessons)}
            emptyTitle="Sem aulas neste período"
            emptyIcon="BookOpen"
          />
        </TabsContent>
        <TabsContent value="missing">
          <DataList<ApiLesson>
            prefix="missing-summaries"
            rows={l.missing}
            columns={columns}
            searchPlaceholder="Pesquisar"
            searchText={(x) => `${x.subject.name} ${x.section.name} ${x.teacher.full_name}`}
            {...lessonFilters(l.missing)}
            emptyTitle="Sem sumários em falta"
            emptyDescription="Todas as aulas realizadas têm sumário."
            emptyIcon="CircleCheck"
          />
        </TabsContent>
        <TabsContent value="stats">
          <DataList<(typeof l.stats)[number] & { id: string }>
            prefix="lesson-compliance"
            rows={l.stats.map((s) => ({ ...s, id: s.section_subject_id }))}
            columns={statColumns}
            searchPlaceholder="Pesquisar por turma, disciplina ou professor"
            searchText={(s) => `${s.section} ${s.subject} ${s.teacher}`}
            filters={[
              {
                key: "level",
                label: "Cumprimento",
                icon: "Gauge",
                options: [
                  { value: "low", label: "Abaixo de 70%" },
                  { value: "medium", label: "70% a 90%" },
                  { value: "high", label: "Acima de 90%" },
                ],
                match: (s, v) => {
                  const r = s.compliance_rate ?? 0;
                  return v === "low" ? r < 70 : v === "medium" ? r >= 70 && r <= 90 : r > 90;
                },
              },
            ]}
            sorts={[
              {
                value: "rate",
                label: "Cumprimento",
                compare: (a, b) =>
                  (a.compliance_rate ?? 0) - (b.compliance_rate ?? 0),
              },
              {
                value: "section",
                label: "Turma",
                compare: (a, b) => a.section.localeCompare(b.section),
              },
            ]}
            emptyTitle="Sem dados de cumprimento"
            emptyIcon="Gauge"
          />
        </TabsContent>
        {can("teaching_plan:read") && (
          <TabsContent value="planning">
            <PlanningPanel />
          </TabsContent>
        )}
      </Tabs>

      <LessonModal lesson={open} />
    </div>
  );
}
