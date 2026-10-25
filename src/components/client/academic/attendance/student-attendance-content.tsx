"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSections } from "@/hooks/school/use-sections";
import { useTeacherAssignments } from "@/hooks/school/use-academic";
import { useRollCall } from "@/hooks/school/use-roll-call";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { timetablesService, type ApiEntry } from "@/services/timetables-service";
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

  // Estados de seleção
  const [pickedClassId, setSelectedClassId] = useState("");
  const [pickedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedEntryId, setSelectedEntryId] = useState<string>("");
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Turma seleccionada
  const selectedClassId = pickedClassId || sections[0]?.id || "";
  const selectedClass = sections.find((c) => c.id === selectedClassId);
  const className = selectedClass ? `${selectedClass.classLevel} ${selectedClass.name}` : "";
  const classSubjects = useMemo(() => assignments.filter((a) => a.sectionId === selectedClassId), [assignments, selectedClassId]);

  // Carregar o horário semanal estabelecido da escola
  const { data: timetables = [] } = useQuery({
    queryKey: ["timetables", schoolId],
    queryFn: timetablesService.list,
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });

  const activeTimetable = useMemo(() => {
    return timetables.find((t) => t.status === "publicado") ?? timetables[0] ?? null;
  }, [timetables]);

  // Entradas do horário ativo
  const { data: timetableEntries = [], isLoading: isEntriesLoading } = useQuery({
    queryKey: ["timetable-entries", schoolId, activeTimetable?.id],
    queryFn: () => timetablesService.entries(activeTimetable!.id),
    enabled: Boolean(schoolId && activeTimetable?.id),
    staleTime: 15 * 1000,
  });

  // Dia da semana correspondente à data seleccionada (1 = Segunda ... 7 = Domingo)
  const weekday = useMemo(() => {
    if (!selectedDate) return 1;
    const [y, m, d] = selectedDate.split("-").map(Number);
    const jsDay = new Date(y, m - 1, d).getDay();
    return jsDay === 0 ? 7 : jsDay;
  }, [selectedDate]);

  const selectedWeekdayName = WEEKDAY_NAMES[weekday] || "Dia";

  // Tempos letivos do horário estabelecido para esta turma no dia da semana seleccionado
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

  // Tempo do horário atualmente ativo/seleccionado
  const activeTimetableLesson = useMemo(() => {
    if (selectedEntryId) {
      const found = dayTimetableLessons.find((e) => e.id === selectedEntryId);
      if (found) return found;
    }
    return dayTimetableLessons[0] || null;
  }, [dayTimetableLessons, selectedEntryId]);

  // Disciplina e dados efectivos da aula para a chamada
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

  // Dados da chamada para métricas
  const { students: rollCall } = useRollCall(selectedClassId, effectiveSubjectId || undefined, selectedDate);
  const marked = rollCall.filter((r) => r.status);
  const classRate = marked.length ? Math.round((marked.filter((r) => r.status === "PRESENT" || r.status === "LATE").length / marked.length) * 100) : 0;
  const justified = rollCall.filter((r) => r.status === "ABSENT_JUSTIFIED").length;
  const present = rollCall.filter((r) => r.status === "PRESENT").length;
  const unjustified = rollCall.filter((r) => r.status === "ABSENT_UNJUSTIFIED").length;

  return (
    <div className="space-y-6">
      <TitleList title="Assiduidade & Disciplina" suTitle="Registo de presenças, faltas justificadas e ocorrências disciplinares por tempo letivo.">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsExportOpen(true)}
          className="gap-2"
        >
          <Icon name="Download" className="h-4 w-4" />
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
      <div className="grid gap-4 sm:grid-cols-3" data-tour="attendance-context">
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

        <div className="space-y-1.5">
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-0.5">
            <Icon name="CalendarDays" className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">{selectedWeekdayName}</span>
            <span>•</span>
            <span>{new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>

        {/* Disciplina Manual (visível em modo manual ou se a turma não tiver tempos no horário) */}
        {isManualMode || (!hasTimetableLessonsToday && classTimetableEntries.length === 0) ? (
          <div className="space-y-1.5">
            <FormSelect
              label="Disciplina (Manual)"
              value={effectiveSubjectId}
              onValueChange={setSelectedSubjectId}
              options={classSubjects.map((s) => ({ value: s.id, label: s.subjectName }))}
            />
            {hasTimetableLessonsToday && (
              <button
                type="button"
                onClick={() => setIsManualMode(false)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <Icon name="ArrowLeft" className="size-3" />
                Voltar ao horário estabelecido da turma
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground">Regime de Chamada</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs py-1 px-2.5">
                <Icon name="CalendarClock" className="size-3.5 mr-1.5" />
                Horário da Turma
              </Badge>
              <button
                type="button"
                onClick={() => setIsManualMode(true)}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline ml-auto"
                title="Registar aula de substituição ou extraordinária"
              >
                Aula avulsa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Tempos do Horário Estabelecido da Turma */}
      {!isManualMode && (
        <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
            <div className="flex items-center gap-2">
              <Icon name="Clock" className="size-4 text-primary" />
              <h3 className="font-semibold text-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
              {dayTimetableLessons.map((lesson, idx) => {
                const isSelected = activeTimetableLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedEntryId(lesson.id);
                      setIsManualMode(false);
                    }}
                    className={cn(
                      "flex flex-col text-left p-3 rounded-lg border transition-all text-xs relative",
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/40 shadow-sm"
                        : "border-border bg-background hover:bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={cn(
                        "font-mono px-1.5 py-0.5 rounded text-[11px] font-semibold",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      )}>
                        {lesson.first_slot ? `${lesson.first_slot}º Tempo` : `${idx + 1}º Tempo`}
                      </span>
                      <span className="font-mono text-[11px] font-medium text-foreground">
                        {lesson.start} – {lesson.end}
                      </span>
                    </div>
                    <span className="font-bold text-foreground text-sm truncate mt-1">
                      {lesson.subject.name}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{lesson.teacher.full_name}</span>
                      {lesson.room && (
                        <span className="shrink-0 bg-muted px-1.5 py-0.2 rounded font-mono text-[10px]">
                          {lesson.room.name || lesson.room.code}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="CalendarX2" className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-foreground">
                    {sections.length === 0 ? "Ainda não há turmas" : `Sem tempos letivos no horário da turma para ${selectedWeekdayName}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sections.length === 0 ? "Crie uma turma em Académico › Turmas para poder registar presenças." : <>A turma <strong className="text-foreground">{className}</strong> não tem aulas agendadas no horário semanal para {selectedWeekdayName}.</>}
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs bg-background/80 hover:bg-accent border-border text-foreground hover:text-foreground shadow-xs"
                      onClick={() => setIsManualMode(true)}
                    >
                      <Icon name="PlusCircle" className="size-3.5 mr-1.5" />
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
        teacherName={activeTimetableLesson?.teacher?.full_name}
        dateStr={selectedDate}
        lessonStart={activeTimetableLesson?.start}
        lessonEnd={activeTimetableLesson?.end}
        roomCode={activeTimetableLesson?.room?.code || activeTimetableLesson?.location_label || undefined}
        students={rollCall.map((r, i) => ({
          studentId: r.id,
          name: r.name,
          studentNumber: r.number || `P-${1000 + i + 1}`,
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

