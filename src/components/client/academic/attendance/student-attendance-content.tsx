"use client";

import { useMemo, useState } from "react";
import { useSections } from "@/hooks/school/use-sections";
import { useTeacherAssignments } from "@/hooks/school/use-academic";
import { useRollCall } from "@/hooks/school/use-roll-call";
import { RollCallSheet } from "./roll-call-sheet";
import { AttendanceStatsView } from "./attendance-stats-view";
import { JustificationsList } from "./justifications-list";
import { Button, EmptyState, FormSelect, Icon, Input, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function StudentAttendanceContent() {
  const { data: sections = [] } = useSections();
  const { assignments } = useTeacherAssignments();

  const [pickedClassId, setSelectedClassId] = useState("");
  const [pickedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const selectedClassId = pickedClassId || sections[0]?.id || "";
  const selectedClass = sections.find((c) => c.id === selectedClassId);
  const classSubjects = useMemo(() => assignments.filter((a) => a.sectionId === selectedClassId), [assignments, selectedClassId]);
  const selectedSubject = classSubjects.find((a) => a.id === pickedSubjectId) ?? classSubjects[0];

  const { students: rollCall } = useRollCall(selectedClassId, selectedSubject?.id, selectedDate);
  const marked = rollCall.filter((r) => r.status);
  const classRate = marked.length ? Math.round((marked.filter((r) => r.status === "PRESENT" || r.status === "LATE").length / marked.length) * 100) : 0;
  const justified = rollCall.filter((r) => r.status === "ABSENT_JUSTIFIED").length;
  const present = rollCall.filter((r) => r.status === "PRESENT").length;
  const unjustified = rollCall.filter((r) => r.status === "ABSENT_UNJUSTIFIED").length;
  const className = selectedClass ? `${selectedClass.classLevel} ${selectedClass.name}` : "";

  return (
    <div className="space-y-6">
      <TitleList title="Assiduidade & Disciplina" suTitle="Registo de presenças, faltas justificadas e ocorrências disciplinares.">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}><Icon name="Printer" className="size-4" />Imprimir folha</Button>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={`${classRate}%`} subtitle="Assiduidade na chamada" description="Presentes e atrasos na chamada seleccionada" icon="CalendarCheck" />
        <DynamicMetricCard title={unjustified} subtitle="Faltas injustificadas (hoje)" description="Alerta automático para encarregados" icon="UserX" colors={unjustified > 10 ? "destructive" : "default"} />
        <DynamicMetricCard title={present} subtitle="Presentes" description={`de ${rollCall.length} aluno(s) na turma`} icon="UserCheck" />
        <DynamicMetricCard title={justified} subtitle="Faltas justificadas" description="Com justificação registada na chamada" icon="FileCheck" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3" data-tour="attendance-context">
        <FormSelect label="Turma" value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); }} options={sections.map((c) => ({ value: c.id, label: `${c.classLevel} ${c.name} (${c.shift === "MORNING" ? "Manhã" : "Tarde"})` }))} />
        <FormSelect label="Disciplina" value={selectedSubject?.id ?? ""} onValueChange={setSelectedSubjectId} options={classSubjects.map((s) => ({ value: s.id, label: s.subjectName }))} />
        <Input label="Data da aula" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <Tabs defaultValue="roll" className="space-y-2">
        <TabsList>
          <TabsTrigger value="roll" className="gap-1.5"><Icon name="SquareCheck" className="size-4" />Folha de chamada</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5"><Icon name="Scale" className="size-4" />Estatísticas & limite MED</TabsTrigger>
          <TabsTrigger value="justify" className="gap-1.5"><Icon name="FileText" className="size-4" />Justificar faltas</TabsTrigger>
        </TabsList>

        <TabsContent value="roll" className="pt-4">
          {selectedSubject ? (
            <RollCallSheet classId={selectedClassId} sectionSubjectId={selectedSubject.id} className={className} subjectName={selectedSubject.subjectName} date={selectedDate} />
          ) : (
            <EmptyState icon="BookOpen" title="Sem disciplinas atribuídas" description="Esta turma ainda não tem disciplinas atribuídas (Académico → Atribuições)." />
          )}
        </TabsContent>
        <TabsContent value="stats" className="pt-4"><AttendanceStatsView classId={selectedClassId} className={className} /></TabsContent>
        <TabsContent value="justify" className="pt-4"><JustificationsList classId={selectedClassId} /></TabsContent>
      </Tabs>
    </div>
  );
}
