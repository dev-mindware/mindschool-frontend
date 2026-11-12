"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, DataList, DynamicMetricCard, EmptyState, Icon, SelectField, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { Badge } from "@/components/ui/badge";
import { useCurrentTerm, useGradeTerms } from "@/hooks/school/use-grades";
import { useTeachingScope } from "@/hooks/school/use-teaching-scope";
import { coordinationService, type Outcome, type SectionPanel } from "@/services/coordination-service";
import { SEQUENCE_OF_TERM } from "@/services/grades-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { AssessmentTerm } from "@/types/grade";
import { downloadCsv } from "@/utils/export-csv";
import { ReportExportMenu, type ReportExportItem } from "@/components/shared/report-export-menu";
import { AbsenceReports } from "./absence-reports";

const TERMS: { value: AssessmentTerm; label: string }[] = [
  { value: "TRIMESTER_1", label: "1.º Trimestre" },
  { value: "TRIMESTER_2", label: "2.º Trimestre" },
  { value: "TRIMESTER_3", label: "3.º Trimestre" },
];

const OUTCOME: Record<Outcome, { label: string; variant: "success" | "destructive" | "secondary" }> = {
  aprovado: { label: "Aprovado", variant: "success" },
  nao_aprovado: { label: "Não aprovado", variant: "destructive" },
  indefinido: { label: "Indefinido", variant: "secondary" },
};

/** Relatórios da turma (PDF/Word/Excel) para o director de turma. */
const exportItems = (sectionId: string, termId: string): ReportExportItem[] => [
  { model: "class-roster", label: "Lista nominal de alunos", params: () => ({ section_id: sectionId }) },
  { model: "attendance-summary", label: "Mapa de assiduidade", params: () => ({ section_id: sectionId, term_id: termId }) },
  { model: "term-grade-sheet", label: "Pauta trimestral", params: () => ({ section_id: sectionId, term_id: termId }) },
  { model: "performance-summary", label: "Mapa de aproveitamento", params: () => ({ section_id: sectionId, term_id: termId }) },
  { model: "class-timetable", label: "Horário da turma", params: () => ({ section_id: sectionId }) },
];

const WEEKDAY =["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

/** Painel do director de turma (separador da página Turmas): o essencial da turma num só ecrã, por trimestre. */
export function CoordinationPanel() {
  const { isTeacher, myTeacher, allSections, mySectionIds, isLoading: scopeLoading } = useTeachingScope();
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const terms = useGradeTerms();
  const currentTerm = useCurrentTerm();
  const [pickedSection, setPickedSection] = useState("");
  const [pickedTerm, setPickedTerm] = useState<AssessmentTerm | null>(null);
  const selectedTerm = pickedTerm ?? currentTerm;

  // O professor vê as turmas que dirige e as que lecciona (as que dirige primeiro).
  const sections = useMemo(() => {
    const mine = isTeacher ? allSections.filter((s) => mySectionIds.has(s.id) || (myTeacher && s.mainTeacherId === myTeacher.id)) : allSections;
    const directs = (id?: string) => Boolean(myTeacher && id === myTeacher.id);
    return [...mine].sort((a, b) => Number(directs(b.mainTeacherId)) - Number(directs(a.mainTeacherId)));
  }, [isTeacher, allSections, mySectionIds, myTeacher]);

  const sectionId = sections.some((s) => s.id === pickedSection) ? pickedSection : (sections[0]?.id ?? "");
  const term = terms.data?.find((t) => t.sequence === SEQUENCE_OF_TERM[selectedTerm]);

  const panel = useQuery({
    queryKey: ["section-panel", schoolId, sectionId, term?.id],
    queryFn: () => coordinationService.panel(sectionId, term!.id),
    enabled: Boolean(schoolId && sectionId && term),
    staleTime: 30 * 1000,
  });
  const timetable = useQuery({
    queryKey: ["section-timetable", schoolId, sectionId],
    queryFn: () => coordinationService.timetable(sectionId),
    enabled: Boolean(schoolId && sectionId),
    staleTime: 5 * 60 * 1000,
  });

  if (!scopeLoading && sections.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState icon="Users" title="Sem turmas" description="Não tem turmas atribuídas neste ano letivo. A Direção Pedagógica indica o diretor de turma em Académico › Turmas." />
      </div>
    );
  }

  const p = panel.data;

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-end gap-3" data-tour="coordination-filters">
        <div className="w-full sm:w-72">
          <SelectField
            label="Turma"
            options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name} (${s.shift === "MORNING" ? "Manhã" : s.shift === "AFTERNOON" ? "Tarde" : "Outro"})`, description: `${s.currentEnrollmentCount} alunos` }))}
            value={sectionId}
            onValueChange={setPickedSection}
            placeholder="Escolha a turma…"
          />
        </div>
        <div className="w-full sm:w-56">
          <SelectField label="Trimestre" options={TERMS} value={selectedTerm} onValueChange={(v) => setPickedTerm(v as AssessmentTerm)} />
        </div>
        {p && (
          <p className="pb-2 text-xs text-muted-foreground">
            Diretor de turma: <strong>{p.section.homeroom_teacher?.full_name ?? "não definido"}</strong>
          </p>
        )}
        {sectionId && term && (
          <div className="sm:ml-auto">
            <ReportExportMenu label="Exportar relatórios" items={exportItems(sectionId, term.id)} />
          </div>
        )}
      </div>

      {panel.isError && <p className="rounded-sm border p-6 text-center text-sm text-destructive">Não foi possível carregar a turma. Confirme que é diretor de turma ou que lecciona nela.</p>}
      {panel.isLoading && <p className="p-8 text-center text-sm text-muted-foreground">A carregar o painel da turma…</p>}

      {p && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <DynamicMetricCard title={p.students.total} subtitle="Alunos" description={`${p.students.male} rapazes · ${p.students.female} raparigas${p.students.unspecified ? ` · ${p.students.unspecified} sem sexo indicado` : ""}`} icon="Users" />
            <DynamicMetricCard title={`${p.grades.percent.toFixed(1)}%`} subtitle="Notas lançadas" description={`${p.grades.done} de ${p.grades.expected} (aluno × disciplina)`} icon="ClipboardCheck" />
            <DynamicMetricCard title={p.subjects.length} subtitle="Disciplinas" description={`${p.subjects.filter((s) => s.missing > 0).length} com notas por lançar`} icon="BookOpen" colors={p.subjects.some((s) => s.missing > 0) ? "destructive" : "default"} />
            <DynamicMetricCard title={p.pauta_status === "fechada" ? "Fechada" : "Aberta"} subtitle="Pauta do trimestre" description={p.pauta_status === "fechada" ? "As notas já não se alteram" : "A Direção fecha a pauta quando estiver completa"} icon={p.pauta_status === "fechada" ? "ShieldCheck" : "FileSpreadsheet"} />
          </div>

          <Tabs defaultValue="overview" className="space-y-2">
            <TabsList>
              <TabsTrigger value="overview" className="gap-1.5"><Icon name="LayoutGrid" className="size-4" />Notas por disciplina</TabsTrigger>
              <TabsTrigger value="students" className="gap-1.5"><Icon name="Users" className="size-4" />Alunos</TabsTrigger>
              <TabsTrigger value="timetable" className="gap-1.5"><Icon name="CalendarRange" className="size-4" />Horário</TabsTrigger>
              <TabsTrigger value="absences" className="gap-1.5"><Icon name="UserCheck" className="size-4" />Faltas e relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><SubjectsTable panel={p} /></TabsContent>
            <TabsContent value="students"><StudentsTable panel={p} /></TabsContent>
            <TabsContent value="timetable"><TimetableGrid days={timetable.data?.days ?? []} loading={timetable.isLoading} /></TabsContent>
            <TabsContent value="absences"><AbsenceReports sectionId={sectionId} termSequence={SEQUENCE_OF_TERM[selectedTerm]} /></TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

type SubjectRow = SectionPanel["subjects"][number] & { id: string };
type StudentRow = SectionPanel["list"][number] & { id: string };

function SubjectsTable({ panel }: { panel: SectionPanel }) {
  const rows: SubjectRow[] = panel.subjects.map((s) => ({ ...s, id: s.section_subject_id }));
  const columns: Column<SubjectRow>[] = [
    { key: "name", header: "Disciplina", className: "min-w-[160px]", render: (_, s) => <span className="text-sm font-medium">{s.name}</span> },
    { key: "teacher_name", header: "Professor", render: (_, s) => <span className="text-sm text-muted-foreground">{s.teacher_name}</span> },
    {
      key: "done",
      header: "Notas lançadas",
      render: (_, s) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${s.expected === 0 ? 0 : (s.done / s.expected) * 100}%` }} /></div>
          <span className="font-mono text-xs">{s.done}/{s.expected}</span>
        </div>
      ),
    },
    { key: "missing", header: "Em falta", render: (_, s) => (s.missing === 0 ? <Badge variant="success">Completo</Badge> : <Badge variant="warning">{s.missing} por lançar</Badge>) },
  ];
  return (
    <DataList<SubjectRow>
      prefix="section-subjects" rows={rows} columns={columns}
      searchPlaceholder="Pesquisar disciplina ou professor" searchText={(s) => `${s.name} ${s.teacher_name}`}
      filters={[{ key: "grades", label: "Notas", icon: "ClipboardCheck", options: [{ value: "missing", label: "Com notas por lançar" }, { value: "complete", label: "Completas" }], match: (s, v) => (v === "missing" ? s.missing > 0 : s.missing === 0) }]}
      emptyTitle="A turma ainda não tem disciplinas atribuídas" emptyDescription="Atribua as disciplinas em Académico › Professores." emptyIcon="BookOpen"
    />
  );
}

function StudentsTable({ panel }: { panel: SectionPanel }) {
  const rows: StudentRow[] = panel.list.map((r) => ({ ...r, id: r.enrollment_id }));
  const columns: Column<StudentRow>[] = [
    { key: "process_number", header: "N.º", className: "w-20", render: (_, r) => <span className="font-mono text-xs text-muted-foreground">{r.process_number ?? "—"}</span> },
    { key: "full_name", header: "Aluno", className: "min-w-[200px]", render: (_, r) => <span className="text-sm font-medium">{r.full_name}</span> },
    { key: "outcome", header: "Resultado", render: (_, r) => <Badge variant={OUTCOME[r.outcome].variant}>{OUTCOME[r.outcome].label}</Badge> },
    { key: "failing_subjects", header: "Negativas", render: (_, r) => <span className="text-sm" title={r.failing_subject_names.join(", ")}>{r.failing_subjects}</span> },
    { key: "missing_subjects", header: "Notas em falta", render: (_, r) => <span className="text-sm">{r.missing_subjects}</span> },
    { key: "absences", header: "Faltas", render: (_, r) => <span className="text-sm">{r.absences}</span> },
    { key: "attendance_rate", header: "Assiduidade", render: (_, r) => <span className="text-sm">{r.attendance_rate === null ? "—" : `${r.attendance_rate.toFixed(1).replace(".", ",")}%`}</span> },
  ];
  const exportList = () =>
    downloadCsv(`turma-${panel.section.name}-trimestre-${panel.term.sequence}.csv`.replace(/\s+/g, "-"), [
      [`${panel.section.class_level} ${panel.section.name}`, `${panel.term.sequence}.º trimestre`],
      ["N.º", "Aluno", "Resultado provisório", "Disciplinas negativas", "Notas em falta", "Tempos", "Faltas", "Assiduidade (%)"],
      ...panel.list.map((r) => [r.process_number ?? "", r.full_name, OUTCOME[r.outcome].label, r.failing_subjects, r.missing_subjects, r.lessons, r.absences, r.attendance_rate === null ? "" : String(r.attendance_rate).replace(".", ",")]),
    ]);
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Resultado provisório do trimestre: «Indefinido» enquanto houver notas por lançar; nota mínima {panel.pass_mark}.</p>
      <DataList<StudentRow>
        prefix="section-students" rows={rows} columns={columns}
        searchPlaceholder="Pesquisar aluno ou n.º de processo" searchText={(r) => `${r.full_name} ${r.process_number ?? ""}`}
        filters={[{ key: "outcome", label: "Resultado", icon: "GraduationCap", options: (Object.keys(OUTCOME) as Outcome[]).map((v) => ({ value: v, label: OUTCOME[v].label })), match: (r, v) => r.outcome === v }]}
        sorts={[{ value: "name", label: "Nome", compare: (a, b) => a.full_name.localeCompare(b.full_name, "pt") }, { value: "attendance", label: "Assiduidade", compare: (a, b) => (a.attendance_rate ?? 101) - (b.attendance_rate ?? 101) }]}
        toolbar={<Button variant="outline" size="sm" className="gap-2" onClick={exportList} disabled={rows.length === 0}><Icon name="Download" className="size-4" />Exportar (Excel/CSV)</Button>}
        emptyTitle="A turma ainda não tem alunos matriculados" emptyDescription="Matricule os alunos em Secretaria › Matrículas." emptyIcon="Users"
      />
    </div>
  );
}

function TimetableGrid({ days, loading }: { days: Array<{ weekday: number; entries: Array<{ id: string; subject: { name: string }; teacher: { full_name: string }; start: string; end: string }> }>; loading: boolean }) {
  if (loading) return <p className="p-6 text-center text-sm text-muted-foreground">A carregar o horário…</p>;
  const filled = days.filter((d) => d.entries.length > 0);
  if (filled.length === 0) return <p className="rounded-sm border p-6 text-center text-sm text-muted-foreground">Esta turma ainda não tem horário publicado.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {filled.map((d) => (
        <div key={d.weekday} className="rounded-sm border bg-card">
          <div className="border-b bg-muted/50 px-3 py-2 text-xs font-semibold">{WEEKDAY[d.weekday]}</div>
          <ul className="divide-y">
            {[...d.entries].sort((a, b) => a.start.localeCompare(b.start)).map((e) => (
              <li key={e.id} className="px-3 py-2 text-xs">
                <p className="font-mono text-muted-foreground">{e.start}–{e.end}</p>
                <p className="font-medium">{e.subject.name}</p>
                <p className="text-muted-foreground">{e.teacher.full_name}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
