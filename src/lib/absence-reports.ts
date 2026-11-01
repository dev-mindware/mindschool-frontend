import type { AttendanceReportData, AttendanceStatus } from "@/services/coordination-service";

export type AbsenceReportKind = "resumo" | "mapa_diario" | "por_disciplina" | "ficha_mensal";

export const ABSENCE_REPORTS: Array<{ kind: AbsenceReportKind; title: string; description: string }> = [
  { kind: "resumo", title: "Resumo por aluno", description: "Faltas, atrasos e taxa de assiduidade de cada aluno, com os que estão em risco." },
  { kind: "mapa_diario", title: "Mapa diário", description: "Uma grelha aluno × dia com a situação de cada dia lectivo." },
  { kind: "por_disciplina", title: "Faltas por disciplina", description: "Em que disciplinas se concentram as faltas de cada aluno." },
  { kind: "ficha_mensal", title: "Ficha mensal em branco", description: "Folha de controlo para preencher à mão, com os alunos da turma e os dias do mês." },
];

/** Um aluno fica em risco quando a taxa de faltas atinge este valor (percentagem de tempos lectivos). */
export const RISK_ABSENCE_RATE = 20;

const isAbsence = (s: AttendanceStatus) => s === "falta_justificada" || s === "falta_injustificada";

export interface StudentSummary {
  enrollmentId: string;
  name: string;
  processNumber: string;
  lessons: number;
  present: number;
  late: number;
  justified: number;
  unjustified: number;
  absenceRate: number;
  atRisk: boolean;
}

/** Resumo por aluno: só conta o que foi registado (dias futuros nunca entram). */
export function summarizeStudents(data: AttendanceReportData): StudentSummary[] {
  return data.students.map((s) => {
    const mine = data.records.filter((r) => r.enrollment_id === s.enrollment_id);
    const justified = mine.filter((r) => r.status === "falta_justificada").length;
    const unjustified = mine.filter((r) => r.status === "falta_injustificada").length;
    const absenceRate = mine.length === 0 ? 0 : Math.round(((justified + unjustified) / mine.length) * 1000) / 10;
    return {
      enrollmentId: s.enrollment_id,
      name: s.full_name,
      processNumber: s.process_number ?? "",
      lessons: mine.length,
      present: mine.filter((r) => r.status === "presente").length,
      late: mine.filter((r) => r.status === "atraso").length,
      justified,
      unjustified,
      absenceRate,
      atRisk: mine.length > 0 && absenceRate >= RISK_ABSENCE_RATE,
    };
  });
}

/** Dias (AAAA-MM-DD) com pelo menos um registo, por ordem. */
export function recordedDays(data: AttendanceReportData): string[] {
  return [...new Set(data.records.map((r) => r.date))].sort();
}

export type DayMark = "P" | "F" | "FJ" | "At" | "";

/** Marca do dia: F se houve alguma falta injustificada, FJ se só justificadas, At se só atrasos, P se tudo presente. */
export function dayMark(data: AttendanceReportData, enrollmentId: string, day: string): DayMark {
  const day_records = data.records.filter((r) => r.enrollment_id === enrollmentId && r.date === day);
  if (day_records.length === 0) return "";
  if (day_records.some((r) => r.status === "falta_injustificada")) return "F";
  if (day_records.some((r) => r.status === "falta_justificada")) return "FJ";
  if (day_records.some((r) => r.status === "atraso")) return "At";
  return "P";
}

/** Faltas de cada aluno em cada disciplina (justificadas + injustificadas). */
export function absencesBySubject(data: AttendanceReportData): Array<{ enrollmentId: string; name: string; perSubject: Record<string, number>; total: number }> {
  return data.students.map((s) => {
    const perSubject: Record<string, number> = {};
    for (const sub of data.subjects) {
      perSubject[sub.section_subject_id] = data.records.filter((r) => r.enrollment_id === s.enrollment_id && r.section_subject_id === sub.section_subject_id && isAbsence(r.status)).length;
    }
    return { enrollmentId: s.enrollment_id, name: s.full_name, perSubject, total: Object.values(perSubject).reduce((a, b) => a + b, 0) };
  });
}

/** Todos os dias de um mês (AAAA-MM) que não são fim de semana, para a ficha em branco. */
export function weekdaysOfMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const days: string[] = [];
  for (let d = 1; d <= new Date(Date.UTC(y, m, 0)).getUTCDate(); d++) {
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (wd !== 0 && wd !== 6) days.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return days;
}
