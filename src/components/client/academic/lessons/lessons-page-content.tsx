"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Badge, Button, ButtonOnlyAction, DataList, EmptyState, FormCombobox, FormModal, FormTextarea, Icon, Input, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, WeekTimetable,
  type Column, type TimetableBlock,
  Can,
} from "@/components";
import { useAuth } from "@/hooks/auth/use-auth";
import { useLessonSummary, useLessons } from "@/hooks/school/use-lessons";
import { academicService } from "@/services/academic-service";
import { LESSON_STATUS_LABEL, type ApiLesson } from "@/services/lessons-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const SUM_STATUS = { rascunho: "Rascunho", submetido: "Submetido", validado: "Validado", devolvido: "Devolvido" } as const;
const err = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));
const TONE: Record<string, TimetableBlock["tone"]> = { prevista: "primary", realizada: "success", substituida: "warning", reposta: "success", cancelada: "danger", nao_realizada: "danger" };

const isoOf = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const mondayOf = (d: Date) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); x.setHours(0, 0, 0, 0); return x; };

function LessonModal({ lesson }: { lesson: ApiLesson | null }) {
  const { record, cancel, substitute, reschedule } = useLessons();
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers", "lesson-modal"], queryFn: academicService.teachers, staleTime: 60 * 1000 });
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

  useEffect(() => { setContent(summary?.content ?? ""); setObjectives(summary?.objectives ?? ""); setHomework(summary?.homework ?? ""); }, [summary, lesson?.id]);

  const given = lesson ? ["realizada", "substituida", "reposta"].includes(lesson.status) : false;
  const done = (ok: string) => () => { SucessMessage(ok); closeModal("lesson-detail"); };
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

  return (
    <FormModal id="lesson-detail" title={lesson ? `${lesson.subject.name} — ${lesson.section.name}` : "Aula"} description={lesson ? `${lesson.date} ${lesson.start}–${lesson.end} • ${lesson.teacher.full_name}${lesson.substitute_teacher ? ` (substituto: ${lesson.substitute_teacher.full_name})` : ""} • ${LESSON_STATUS_LABEL[lesson.status]}` : undefined} size="lg" readOnly onSubmit={() => undefined}>
      {lesson && (
        <div className="sm:col-span-2 space-y-4 text-sm">
          {lesson.status === "prevista" && (
            <section className="space-y-3 rounded-lg border p-3">
              <h4 className="font-semibold">Registar a aula</h4>
              <Input label="Motivo (obrigatório se não realizada)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="flex gap-2">
                <Button size="sm" disabled={record.isPending} onClick={() => record.mutateAsync({ id: lesson.id, status: "realizada" }).then(done("Aula registada como realizada.")).catch(err)}>Realizada</Button>
                <Button size="sm" variant="outline" disabled={record.isPending || reason.trim().length < 5} onClick={() => record.mutateAsync({ id: lesson.id, status: "nao_realizada", reason: reason.trim() }).then(done("Aula registada como não realizada.")).catch(err)}>Não realizada</Button>
              </div>
            </section>
          )}

          {lesson.status === "prevista" && (
            <section className="space-y-3 rounded-lg border p-3">
              <h4 className="font-semibold">Gestão da aula (coordenação)</h4>
              <Input label="Motivo (mín. 5 caracteres)" value={mgmtReason} onChange={(e) => setMgmtReason(e.target.value)} />
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
                <FormCombobox label="Professor substituto" value={subTeacher} onValueChange={setSubTeacher} options={teachers.map((t) => ({ value: t.id, label: t.full_name }))} />
                <Button size="sm" variant="outline" className="h-10" disabled={!subTeacher || mgmtReason.trim().length < 5 || substitute.isPending} onClick={() => substitute.mutateAsync({ id: lesson.id, teacherId: subTeacher, reason: mgmtReason.trim() }).then(done("Substituição registada.")).catch(err)}>Substituir</Button>
                <Button size="sm" variant="ghost" className="h-10 text-destructive" disabled={mgmtReason.trim().length < 5 || cancel.isPending} onClick={() => cancel.mutateAsync({ id: lesson.id, reason: mgmtReason.trim() }).then(done("Aula cancelada.")).catch(err)}>Cancelar aula</Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
                <Input label="Nova data" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                <Input label="Início" type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                <Input label="Fim" type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                <Button size="sm" variant="outline" className="h-10" disabled={!newDate || !newStart || !newEnd || reschedule.isPending} onClick={() => reschedule.mutateAsync({ id: lesson.id, date: newDate, startMinute: m(newStart), endMinute: m(newEnd) }).then(done("Aula reagendada.")).catch(err)}>Reagendar</Button>
              </div>
            </section>
          )}

          {given && (
            <section className="space-y-3 rounded-lg border p-3">
              <h4 className="font-semibold">Sumário {summary ? `(v${summary.version_number}, ${SUM_STATUS[summary.status]}${summary.late ? ", tardio" : ""})` : ""}</h4>
              {summary?.review_note && <p className="rounded bg-amber-50 p-2 text-amber-800">Observação da coordenação: {summary.review_note}</p>}
              <FormTextarea label="Conteúdo leccionado (mín. 10 caracteres)" value={content} onChange={setContent} rows={4} />
              <div className="grid gap-3 sm:grid-cols-2"><Input label="Objectivos" value={objectives} onChange={(e) => setObjectives(e.target.value)} /><Input label="Trabalho de casa" value={homework} onChange={(e) => setHomework(e.target.value)} /></div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={save.isPending || content.trim().length < 10} onClick={() => save.mutateAsync({ content: content.trim(), objectives: objectives.trim() || undefined, homework: homework.trim() || undefined, submit: true }).then(() => SucessMessage("Sumário submetido.")).catch(err)}>Submeter sumário</Button>
                {summary && summary.status === "submetido" && (
                  <>
                    <Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutateAsync({ summaryId: summary.id, decision: "validado" }).then(() => SucessMessage("Sumário validado.")).catch(err)}>Validar</Button>
                    <Input label="" placeholder="Observação ao devolver (mín. 5)" value={returnNote} onChange={(e) => setReturnNote(e.target.value)} className="max-w-60" />
                    <Button size="sm" variant="ghost" className="text-destructive" disabled={review.isPending || returnNote.trim().length < 5} onClick={() => review.mutateAsync({ summaryId: summary.id, decision: "devolvido", note: returnNote.trim() }).then(() => SucessMessage("Sumário devolvido.")).catch(err)}>Devolver</Button>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Só o professor da aula (ou o substituto) escreve; a coordenação valida ou devolve.</p>
            </section>
          )}
        </div>
      )}
    </FormModal>
  );
}

/** Aulas e sumários: vista semanal em calendário, lista, pendências e cumprimento por disciplina. */
export function LessonsPageContent() {
  const { user } = useAuth();
  // «As minhas aulas» só existe para professores (a API responde 404 a quem não tem registo de professor).
  const [scope, setScope] = useState<"mine" | "all">(user?.role === "TEACHER" ? "mine" : "all");
  const l = useLessons(scope);
  const { openModal } = useModal();
  const [open, setOpen] = useState<ApiLesson | null>(null);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));

  const openLesson = (x: ApiLesson) => { setOpen(x); openModal("lesson-detail"); };
  const weekBlocks = useMemo<TimetableBlock<ApiLesson>[]>(() => {
    const from = isoOf(weekStart);
    const to = isoOf(new Date(weekStart.getTime() + 6 * 86_400_000));
    return l.lessons.filter((x) => x.date >= from && x.date <= to).map((x) => ({ id: x.id, weekday: ((new Date(`${x.date}T00:00:00`).getDay() + 6) % 7) + 1, start: x.start, end: x.end, title: x.subject.name, subtitle: `${x.section.name} · ${x.teacher.full_name}`, meta: LESSON_STATUS_LABEL[x.status], tone: TONE[x.status] ?? "primary", data: x }));
  }, [l.lessons, weekStart]);

  const columns: Column<ApiLesson>[] = [
    { key: "date", header: "Data", render: (_, x) => <span className="font-mono text-xs whitespace-nowrap">{x.date} {x.start}–{x.end}</span> },
    { key: "section.name", header: "Turma", render: (_, x) => x.section.name },
    { key: "subject.name", header: "Disciplina", render: (_, x) => x.subject.name },
    { key: "teacher.full_name", header: "Professor", render: (_, x) => x.teacher.full_name },
    { key: "status", header: "Estado", render: (_, x) => <Badge variant="outline">{LESSON_STATUS_LABEL[x.status]}</Badge> },
    { key: "action", header: "Acção", render: (_, x) => <ButtonOnlyAction data={x} actions={[{ label: "Abrir aula", icon: "Eye", onClick: openLesson }]} /> },
  ];
  const lessonFilters = (rows: ApiLesson[]) => ({
    filters: [
      { key: "estado", label: "Estado", icon: "CircleDot" as const, options: Object.entries(LESSON_STATUS_LABEL).map(([value, label]) => ({ value, label })), match: (x: ApiLesson, v: string) => x.status === v },
      { key: "turma", label: "Turma", icon: "Users" as const, options: [...new Set(rows.map((x) => x.section.name))].sort().map((s) => ({ value: s, label: s })), match: (x: ApiLesson, v: string) => x.section.name === v },
      { key: "disciplina", label: "Disciplina", icon: "BookOpen" as const, options: [...new Set(rows.map((x) => x.subject.name))].sort().map((s) => ({ value: s, label: s })), match: (x: ApiLesson, v: string) => x.subject.name === v },
      { key: "professor", label: "Professor", icon: "GraduationCap" as const, options: [...new Set(rows.map((x) => x.teacher.full_name))].sort().map((s) => ({ value: s, label: s })), match: (x: ApiLesson, v: string) => x.teacher.full_name === v },
    ],
    dateFilters: [{ key: "data", label: "Aula", getDate: (x: ApiLesson) => x.date }],
    sorts: [{ value: "data", label: "Data", compare: (a: ApiLesson, b: ApiLesson) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`) }, { value: "turma", label: "Turma", compare: (a: ApiLesson, b: ApiLesson) => a.section.name.localeCompare(b.section.name) }],
  });
  const statColumns: Column<(typeof l.stats)[number] & { id: string }>[] = [
    { key: "section", header: "Turma" }, { key: "subject", header: "Disciplina" }, { key: "teacher", header: "Professor" },
    { key: "given", header: "Dadas", render: (_, s) => <span className="font-mono">{s.given}</span> },
    { key: "planned", header: "Previstas", render: (_, s) => <span className="font-mono">{s.planned}</span> },
    { key: "compliance_rate", header: "Cumprimento", render: (_, s) => <span className="font-mono font-semibold">{s.compliance_rate === null ? "—" : `${s.compliance_rate}%`}</span> },
  ];

  if (l.forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não tem acesso às aulas (plano Profissional ou superior)." />;

  return (
    <div className="space-y-6">
      <TitleList title="Aulas e Sumários" suTitle="Geradas a partir do horário publicado e dos dias lectivos; o sumário só existe para aulas realizadas.">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border bg-sidebar p-1">
            <Button size="sm" variant={scope === "mine" ? "default" : "ghost"} className="h-8" onClick={() => setScope("mine")}>As minhas aulas</Button>
            <Button size="sm" variant={scope === "all" ? "default" : "ghost"} className="h-8" onClick={() => setScope("all")}>Todas</Button>
          </div>
          <Can permission="lesson:manage"><Button size="sm" variant="outline" className="gap-1.5" disabled={l.generate.isPending} onClick={() => l.generate.mutateAsync().then(() => SucessMessage("Aulas geradas.")).catch(err)}><Icon name="RefreshCcw" className="size-4" />Gerar aulas</Button></Can>
        </div>
      </TitleList>

      <Tabs defaultValue="week" className="space-y-2">
        <TabsList>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="missing">Sumários em falta ({l.missing.length})</TabsTrigger>
          <TabsTrigger value="stats">Cumprimento</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4">
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">{weekStart.toLocaleDateString("pt-AO", { day: "2-digit", month: "long" })} — {new Date(weekStart.getTime() + 6 * 86_400_000).toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}</h3>
            <div className="flex items-center gap-1.5">
              <Button size="icon" variant="outline" className="size-9" onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86_400_000))} aria-label="Semana anterior"><Icon name="ChevronLeft" className="size-4" /></Button>
              <Button size="sm" variant="outline" className="h-9" onClick={() => setWeekStart(mondayOf(new Date()))}>Hoje</Button>
              <Button size="icon" variant="outline" className="size-9" onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86_400_000))} aria-label="Semana seguinte"><Icon name="ChevronRight" className="size-4" /></Button>
            </div>
          </div>
          <WeekTimetable<ApiLesson> blocks={weekBlocks} onBlockClick={(b) => b.data && openLesson(b.data)} />
          <p className="text-xs text-muted-foreground">Clique numa aula para a registar, gerir ou escrever o sumário. Mostram-se as aulas geradas (±2 semanas); use «Gerar aulas» para criar mais.</p>
        </TabsContent>

        <TabsContent value="list"><DataList<ApiLesson> prefix="aulas" rows={l.lessons} columns={columns} isLoading={l.isLoading} searchPlaceholder="Pesquisar aulas" searchText={(x) => `${x.subject.name} ${x.section.name} ${x.teacher.full_name}`} {...lessonFilters(l.lessons)} emptyTitle="Sem aulas neste período" emptyIcon="BookOpen" /></TabsContent>
        <TabsContent value="missing"><DataList<ApiLesson> prefix="sumarios-falta" rows={l.missing} columns={columns} searchPlaceholder="Pesquisar" searchText={(x) => `${x.subject.name} ${x.section.name} ${x.teacher.full_name}`} {...lessonFilters(l.missing)} emptyTitle="Sem sumários em falta" emptyDescription="Todas as aulas realizadas têm sumário." emptyIcon="CircleCheck" /></TabsContent>
        <TabsContent value="stats">
          <DataList<(typeof l.stats)[number] & { id: string }>
            prefix="cumprimento"
            rows={l.stats.map((s) => ({ ...s, id: s.section_subject_id }))}
            columns={statColumns}
            searchPlaceholder="Pesquisar por turma, disciplina ou professor"
            searchText={(s) => `${s.section} ${s.subject} ${s.teacher}`}
            filters={[{ key: "nivel", label: "Cumprimento", icon: "Gauge", options: [{ value: "baixo", label: "Abaixo de 70%" }, { value: "medio", label: "70% a 90%" }, { value: "alto", label: "Acima de 90%" }], match: (s, v) => { const r = s.compliance_rate ?? 0; return v === "baixo" ? r < 70 : v === "medio" ? r >= 70 && r <= 90 : r > 90; } }]}
            sorts={[{ value: "taxa", label: "Cumprimento", compare: (a, b) => (a.compliance_rate ?? 0) - (b.compliance_rate ?? 0) }, { value: "turma", label: "Turma", compare: (a, b) => a.section.localeCompare(b.section) }]}
            emptyTitle="Sem dados de cumprimento"
            emptyIcon="Gauge"
          />
        </TabsContent>
      </Tabs>

      <LessonModal lesson={open} />
    </div>
  );
}
