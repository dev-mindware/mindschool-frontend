"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSections } from "@/hooks/school/use-sections";
import { useTeacherAssignments } from "@/hooks/school/use-academic";
import { useRollCall } from "@/hooks/school/use-roll-call";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { timetablesService } from "@/services/timetables-service";
import { RollCallSheet } from "./roll-call-sheet";
import { AttendanceStatsView } from "./attendance-stats-view";
import { JustificationsList } from "./justifications-list";
import {
  Badge,
  Button,
  EmptyState,
  FormSelect,
  Icon,
  Input,
  Label,
  StatusLegend,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
} from "@/components";
import { AttendanceExportModal } from "./attendance-export-modal";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { cn } from "@/lib/utils";

const WEEKDAY_NAMES: Record<number, string> = {
  1: "Segunda-Feira",
  2: "Terça-Feira",
  3: "Quarta-Feira",
  4: "Quinta-Feira",
  5: "Sexta-Feira",
  6: "Sábado",
  7: "Domingo",
};

export function StudentAttendanceContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { data: sections = [] } = useSections();
  const { assignments } = useTeacherAssignments();

  const [pickedClassId, setSelectedClassId] = useState("");
  const [pickedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedEntryId, setSelectedEntryId] = useState<string>("");
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const selectedClassId = pickedClassId || sections[0]?.id || "";
  const selectedClass = sections.find((c) => c.id === selectedClassId);
  const className = selectedClass ? `${selectedClass.classLevel} ${selectedClass.name}` : "";
  const classSubjects = useMemo(() => assignments.filter((a) => a.sectionId === selectedClassId), [assignments, selectedClassId]);

  const { data: timetables = [] } = useQuery({
    queryKey: ["timetables", schoolId],
    queryFn: timetablesService.list,
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });

  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.status === "publicado") ?? timetables[0] ?? null;
  }, [timetables]);

  const { data: timetableEntries = [] } = useQuery({
    queryKey: ["timetable-entries", schoolId, activeTimetable?.id],
    queryFn: () => timetablesService.entries(activeTimetable!.id),
    enabled: Boolean(schoolId && activeTimetable?.id),
    staleTime: 15 * 1000,
  });

  const weekday = useMemo(() => {
    if (!selectedDate) return 1;
    const [y, m, d] = selectedDate.split("-").map(Number);
    const jsDay = new Date(y, m - 1, d).getDay();
    return jsDay === 0 ? 7 : jsDay;
  }, [selectedDate]);

  const selectedWeekdayName = WEEKDAY_NAMES[weekday] || "Dia";

  const classTimetableEntries = useMemo(() => {
    if (!selectedClassId || !timetableEntries.length) return [];
    return timetableEntries.filter((e) => e.section.id === selectedClassId);
  }, [timetableEntries, selectedClassId]);

  const dayTimetableLessons = useMemo(() => {
    return classTimetableEntries
      .filter((e) => e.weekday === weekday)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [classTimetableEntries, weekday]);

  const hasTimetableLessonsToday = dayTimetableLessons.length > 0;

  const activeTimetableLesson = useMemo(() => {
    if (selectedEntryId) {
      const found = dayTimetableLessons.find((e) => e.id === selectedEntryId);
      if (found) return found;
    }
    return dayTimetableLessons[0] || null;
  }, [dayTimetableLessons, selectedEntryId]);

  const effectiveSubjectId = useMemo(() => {
    if (!isManualMode && activeTimetableLesson) {
      return activeTimetableLesson.section_subject_id;
    }
    return pickedSubjectId || classSubjects[0]?.id || "";
  }, [isManualMode, activeTimetableLesson, pickedSubjectId, classSubjects]);

  const effectiveSubject = useMemo(() => {
    return classSubjects.find((s) => s.id === effectiveSubjectId);
  }, [classSubjects, effectiveSubjectId]);

  const effectiveSubjectName = useMemo(() => {
    if (!isManualMode && activeTimetableLesson) {
      return activeTimetableLesson.subject.name;
    }
    return effectiveSubject?.subjectName || "Disciplina";
  }, [isManualMode, activeTimetableLesson, effectiveSubject]);

  const { students: rollCall } = useRollCall(selectedClassId, effectiveSubjectId || undefined, selectedDate);
  const marked = rollCall.filter((r) => r.status);
  const classRate = marked.length ? Math.round((marked.filter((r) => r.status === "PRESENT" || r.status === "LATE").length / marked.length) * 100) : 0;
  const justified = rollCall.filter((r) => r.status === "ABSENT_JUSTIFIED").length;
  const present = rollCall.filter((r) => r.status === "PRESENT").length;
  const unjustified = rollCall.filter((r) => r.status === "ABSENT_UNJUSTIFIED").length;

  return (
    <div className="space-y-6">
      <TitleList title="Assiduidade & Disciplina" suTitle="Registo diário de presenças, faltas e justificações por turma.">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExportOpen(true)}
          className="gap-2"
        >
          <Icon name="Download" className="size-4" />
          <span>Baixar Folha (PDF)</span>
        </Button>
      </TitleList>

      <StatusLegend
        title="Legenda da chamada e regras"
        items={[
          { label: "P", description: "Presente." },
          { label: "A", description: "Atraso: conta como presença com atraso (pesa pouco no risco de faltas)." },
          { label: "FI", description: "Falta injustificada. É a única que se pode justificar depois, com comprovativo (separador de justificações)." },
          { label: "FJ", description: "Falta justificada (atestado ou comprovação oficial)." },
          { label: "Regras", description: "Não se registam presenças em datas futuras. Em dias não letivos o sistema avisa (ou recusa, se a escola tiver ativado o bloqueio nas Políticas)." },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={`${classRate}%`} subtitle="Assiduidade no tempo" description="Presentes e atrasos nesta aula" icon="CalendarCheck" />
        <DynamicMetricCard title={unjustified} subtitle="Faltas injustificadas" description="Alerta de controlo disciplinar" icon="UserX" colors={unjustified > 10 ? "destructive" : "default"} />
        <DynamicMetricCard title={present} subtitle="Presentes" description={`de ${rollCall.length} aluno(s) nesta turma`} icon="UserCheck" />
        <DynamicMetricCard title={justified} subtitle="Faltas justificadas" description="Atestados e comprovações oficiais" icon="FileCheck" />
      </div>

      {/* Barra de Filtros Contextuais */}
      <div className="flex flex-wrap items-end gap-3" data-tour="attendance-context">
        <div className="min-w-60 flex-1">
          <FormSelect
            label="Turma"
            value={selectedClassId}
            onValueChange={(v) => {
              setSelectedClassId(v);
              setSelectedEntryId("");
              setSelectedSubjectId("");
              setIsManualMode(false);
            }}
            options={sections.map((c) => ({
              value: c.id,
              label: `${c.classLevel} ${c.name} (${c.shift === "MORNING" ? "Manhã" : c.shift === "AFTERNOON" ? "Tarde" : "Diurno"})`,
            }))}
          />
        </div>

        <div className="min-w-52 flex-1 space-y-1.5">
          <Input
            label="Data da aula"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedEntryId("");
              setIsManualMode(false);
            }}
          />
          <div className="flex items-center gap-1.5 px-0.5 text-xs text-muted-foreground">
            <Icon name="CalendarDays" className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">{selectedWeekdayName}</span>
            <span>•</span>
            <span>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {/* Disciplina Manual (visível em modo manual ou se a turma não tiver tempos no horário) */}
        {isManualMode || (!hasTimetableLessonsToday && classTimetableEntries.length === 0) ? (
          <div className="min-w-60 flex-1 space-y-1.5">
            <FormSelect
              label="Disciplina (Manual)"
              value={effectiveSubjectId}
              onValueChange={setSelectedSubjectId}
              options={classSubjects.map((s) => ({ value: s.id, label: s.subjectName }))}
            />
            {hasTimetableLessonsToday && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setIsManualMode(false)}
                className="h-auto gap-1 p-0 text-xs font-medium text-primary"
              >
                <Icon name="ArrowLeft" className="size-3" />
                Voltar ao horário estabelecido da turma
              </Button>
            )}
          </div>
        ) : (
          <div className="flex min-w-52 flex-1 flex-col justify-center pb-1">
            <Label className="text-xs text-muted-foreground">Regime de Chamada</Label>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="default" className="px-2.5 py-1 text-xs">
                <Icon name="CalendarClock" className="mr-1.5 size-3.5" />
                Horário da Turma
              </Badge>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setIsManualMode(true)}
                className="ml-auto h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                title="Registar aula de substituição ou extraordinária"
              >
                Aula avulsa
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Tempos do Horário Estabelecido da Turma */}
      {!isManualMode && (
        <div className="space-y-3 rounded-xs border bg-card p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
            <div className="flex items-center gap-2">
              <Icon name="Clock" className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">
                Tempos Letivos no Horário Estabelecido ({selectedWeekdayName})
              </h3>
              <Badge variant="secondary" className="text-xs">
                {dayTimetableLessons.length} {dayTimetableLessons.length === 1 ? "aula prevista" : "aulas previstas"}
              </Badge>
            </div>
            {hasTimetableLessonsToday && (
              <span className="text-xs text-muted-foreground">
                Seleccione o tempo para efetuar a chamada correspondente
              </span>
            )}
          </div>

          {hasTimetableLessonsToday ? (
            <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {dayTimetableLessons.map((lesson, idx) => {
                const isSelected = activeTimetableLesson?.id === lesson.id;
                return (
                  <Button
                    key={lesson.id}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedEntryId(lesson.id);
                      setIsManualMode(false);
                    }}
                    className={cn(
                      "relative flex h-auto flex-col items-start justify-start rounded-xs p-3 text-left text-xs font-normal transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/40"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <div className="mb-1 flex w-full items-center justify-between">
                      <Badge variant={isSelected ? "default" : "secondary"} className="font-mono text-[11px]">
                        {lesson.first_slot ? `${lesson.first_slot}º Tempo` : `${idx + 1}º Tempo`}
                      </Badge>
                      <span className="font-mono text-[11px] font-medium text-foreground">
                        {lesson.start} – {lesson.end}
                      </span>
                    </div>
                    <span className="mt-1 w-full truncate text-sm font-bold text-foreground">
                      {lesson.subject.name}
                    </span>
                    <div className="mt-2 flex w-full items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{lesson.teacher.full_name}</span>
                      {lesson.room && (
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                          {lesson.room.name || lesson.room.code}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xs border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="CalendarX2" className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {sections.length === 0 ? "Ainda não há turmas" : `Sem tempos letivos no horário da turma para ${selectedWeekdayName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sections.length === 0 ? "Crie uma turma em Académico › Turmas para poder registar presenças." : <>A turma <strong className="text-foreground">{className}</strong> não tem aulas agendadas no horário semanal para {selectedWeekdayName}.</>}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsManualMode(true)}
                    >
                      <Icon name="PlusCircle" className="mr-1.5 size-3.5" />
                      Registar chamada extraordinária / avulsa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Principal (Abas) */}
      <Tabs defaultValue="roll" className="space-y-2">
        <TabsList>
          <TabsTrigger value="roll" className="gap-1.5">
            <Icon name="SquareCheck" className="size-4" />
            Folha de chamada
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <Icon name="Scale" className="size-4" />
            Estatísticas &amp; limite MED
          </TabsTrigger>
          <TabsTrigger value="justify" className="gap-1.5">
            <Icon name="FileText" className="size-4" />
            Justificar faltas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roll" className="pt-4">
          {effectiveSubjectId ? (
            <RollCallSheet
              key={`${selectedClassId}-${effectiveSubjectId}-${selectedDate}-${activeTimetableLesson?.id || "manual"}`}
              classId={selectedClassId}
              sectionSubjectId={effectiveSubjectId}
              className={className}
              subjectName={effectiveSubjectName}
              date={selectedDate}
              timeSlotLabel={
                !isManualMode && activeTimetableLesson
                  ? `${activeTimetableLesson.start}–${activeTimetableLesson.end}`
                  : undefined
              }
            />
          ) : (
            <EmptyState
              icon="BookOpen"
              title="Sem disciplina seleccionada"
              description="Seleccione um tempo letivo no horário da turma ou uma disciplina atribuída."
            />
          )}
        </TabsContent>

        <TabsContent value="stats" className="pt-4">
          <AttendanceStatsView classId={selectedClassId} className={className} />
        </TabsContent>

        <TabsContent value="justify" className="pt-4">
          <JustificationsList classId={selectedClassId} />
        </TabsContent>
      </Tabs>

      <AttendanceExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        className={className || "Turma"}
        subjectName={effectiveSubjectName}
        teacherName={activeTimetableLesson?.teacher?.full_name || effectiveSubject?.teacherName}
        dateStr={selectedDate}
        lessonStart={activeTimetableLesson?.start}
        lessonEnd={activeTimetableLesson?.end}
        roomCode={activeTimetableLesson?.room?.code || activeTimetableLesson?.location_label || selectedClass?.roomNumber || undefined}
        students={rollCall.map((r) => ({
          studentId: r.id,
          name: r.name,
          studentNumber: r.number || "",
          status: r.status,
          note: r.notes,
        }))}
        stats={{
          total: rollCall.length,
          present,
          justified,
          unjustified,
          classRate,
        }}
      />
    </div>
  );
}
