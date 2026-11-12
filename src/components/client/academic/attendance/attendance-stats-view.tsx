"use client";

import { Badge, DataList, type Column } from "@/components";
import { useClassAbsences } from "@/hooks/school/use-absences";

interface AttendanceStatsViewProps {
  classId: string;
  className: string;
}

/** Mapa de assiduidade da turma: aulas registadas, presenças, atrasos, faltas e taxas por aluno. */
export function AttendanceStatsView({ classId, className }: AttendanceStatsViewProps) {
  const { data: rows = [], isLoading, isError, error } = useClassAbsences(classId || undefined);
  const isForbidden = (error as any)?.response?.status === 403;

  if (isForbidden) {
    return (
      <div className="rounded-xs border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <p className="text-sm font-semibold text-foreground">Sem permissão para consultar o mapa geral de assiduidade</p>
        <p className="mt-1 text-xs text-muted-foreground">
          O resumo de faltas acumuladas desta turma está reservado ao director de turma e à direcção pedagógica.
        </p>
      </div>
    );
  }

  type Row = (typeof rows)[number] & { id: string };
  const data: Row[] = rows.map((r) => ({ ...r, id: r.enrollment_id }));

  const columns: Column<Row>[] = [
    { key: "student.full_name", header: "Aluno", render: (_, r) => <span className="font-medium">{r.student.full_name}</span> },
    { key: "lessons", header: "Aulas", render: (_, r) => <span className="font-mono">{r.lessons}</span> },
    { key: "present", header: "Presenças", render: (_, r) => <span className="font-mono">{r.present}</span> },
    { key: "late", header: "Atrasos", render: (_, r) => <span className="font-mono">{r.late}</span> },
    { key: "justified_absences", header: "Faltas just.", render: (_, r) => <span className="font-mono">{r.justified_absences}</span> },
    { key: "unjustified_absences", header: "Faltas injust.", render: (_, r) => <span className={`font-mono ${r.unjustified_absences > 0 ? "font-semibold text-rose-600" : ""}`}>{r.unjustified_absences}</span> },
    { key: "attendance_rate", header: "Assiduidade", render: (_, r) => (r.attendance_rate === null ? "—" : <Badge variant={r.attendance_rate < 75 ? "destructive" : "outline"} className="font-mono">{r.attendance_rate}%</Badge>) },
  ];

  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{className || "Turma"}</p>
      <DataList<Row>
        prefix="attendance-stats"
        rows={data}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Pesquisar aluno"
        searchText={(r) => r.student.full_name}
        filters={[
          { key: "risk", label: "Assiduidade", icon: "Gauge", options: [{ value: "below", label: "Abaixo de 75%" }, { value: "ok", label: "75% ou mais" }], match: (r, v) => (v === "below" ? (r.attendance_rate ?? 100) < 75 : (r.attendance_rate ?? 100) >= 75) },
          { key: "absences", label: "Faltas", icon: "UserX", options: [{ value: "unjustified", label: "Com faltas injustificadas" }, { value: "none", label: "Sem faltas" }], match: (r, v) => (v === "none" ? r.unjustified_absences + r.justified_absences === 0 : r.unjustified_absences > 0) },
        ]}
        sorts={[
          { value: "rate", label: "Assiduidade", compare: (a, b) => (a.attendance_rate ?? 100) - (b.attendance_rate ?? 100) },
          { value: "unjustified", label: "Faltas injustificadas", compare: (a, b) => a.unjustified_absences - b.unjustified_absences },
          { value: "name", label: "Nome", compare: (a, b) => a.student.full_name.localeCompare(b.student.full_name) },
        ]}
        emptyTitle="Sem alunos matriculados nesta turma"
        emptyIcon="Users"
      />
    </div>
  );
}
