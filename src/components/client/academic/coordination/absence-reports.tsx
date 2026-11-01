"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Icon, Label, SelectField } from "@/components";
import { Badge } from "@/components/ui/badge";
import { useGradeTerms } from "@/hooks/school/use-grades";
import {
  ABSENCE_REPORTS,
  absencesBySubject,
  dayMark,
  recordedDays,
  summarizeStudents,
  weekdaysOfMonth,
  type AbsenceReportKind,
} from "@/lib/absence-reports";
import { coordinationService, type AttendanceReportData } from "@/services/coordination-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { downloadCsv } from "@/utils/export-csv";
import { downloadElementAsPdf } from "@/utils/export-pdf";
import { formatIsoDay } from "@/utils";
import { ErrorMessage } from "@/utils/messages";

type PeriodKind = "mes" | "trimestre" | "ano";

const PERIODS: Array<{ value: PeriodKind; label: string }> = [
  { value: "mes", label: "Mês" },
  { value: "trimestre", label: "Trimestre em curso" },
  { value: "ano", label: "Ano letivo" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const lastDayOfMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return `${month}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`;
};
const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

interface Request {
  kind: AbsenceReportKind;
  from: string;
  to: string;
  month: string;
}

/** Os 4 relatórios de faltas da turma, por mês, trimestre ou ano, com exportação para CSV e PDF. */
export function AbsenceReports({ sectionId, termSequence }: { sectionId: string; termSequence: number }) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const terms = useGradeTerms();
  const [period, setPeriod] = useState<PeriodKind>("mes");
  const [month, setMonth] = useState(thisMonth());
  const [kind, setKind] = useState<AbsenceReportKind>("resumo");
  const [request, setRequest] = useState<Request | null>(null);

  const range = useMemo(() => {
    const all = terms.data ?? [];
    if (period === "mes") return { from: `${month}-01`, to: lastDayOfMonth(month) };
    if (period === "trimestre") {
      const t = all.find((x) => x.sequence === termSequence);
      return t ? { from: t.start_date, to: t.end_date } : null;
    }
    if (all.length === 0) return null;
    return { from: all.map((t) => t.start_date).sort()[0], to: all.map((t) => t.end_date).sort().at(-1)! };
  }, [period, month, terms.data, termSequence]);

  const report = useQuery({
    queryKey: ["attendance-report", schoolId, sectionId, request?.from, request?.to],
    queryFn: () => coordinationService.attendanceReport(sectionId, request!.from, request!.to),
    enabled: Boolean(schoolId && sectionId && request),
  });

  const generate = () => {
    if (!range) return ErrorMessage("Ainda não há períodos do ano letivo para este relatório.");
    setRequest({ kind, month, ...range });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-sm border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <SelectField label="Relatório" options={ABSENCE_REPORTS.map((r) => ({ value: r.kind, label: r.title }))} value={kind} onValueChange={(v) => setKind(v as AbsenceReportKind)} />
        <SelectField label="Período" options={PERIODS} value={period} onValueChange={(v) => setPeriod(v as PeriodKind)} />
        {period === "mes" ? (
          <div className="space-y-1.5">
            <Label htmlFor="report-month">Mês</Label>
            <input id="report-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 w-full rounded-sm border bg-background px-2 text-sm" />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">{range ? `${formatIsoDay(range.from)} a ${formatIsoDay(range.to)}` : "A carregar períodos…"}</div>
        )}
        <Button onClick={generate} className="gap-2">
          <Icon name="FileText" className="size-4" />
          Gerar relatório
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{ABSENCE_REPORTS.find((r) => r.kind === kind)?.description} Só entram os dias já registados; dias futuros nunca contam como falta.</p>

      {report.isLoading && request && <p className="py-6 text-center text-sm text-muted-foreground">A preparar o relatório…</p>}
      {report.isError && <p className="py-6 text-center text-sm text-destructive">Não foi possível gerar o relatório.</p>}
      {report.data && request && <ReportView data={report.data} request={request} />}
    </div>
  );
}

function ReportView({ data, request }: { data: AttendanceReportData; request: Request }) {
  const title = ABSENCE_REPORTS.find((r) => r.kind === request.kind)!.title;
  const periodText = request.kind === "ficha_mensal" ? request.month.split("-").reverse().join("/") : `${formatIsoDay(data.from)} a ${formatIsoDay(data.to)}`;
  const filename = `faltas-${request.kind}-${data.section.name}-${request.kind === "ficha_mensal" ? request.month : data.from}`.replace(/\s+/g, "-");

  const exportCsv = () => downloadCsv(`${filename}.csv`, buildCsv(data, request));
  const exportPdf = () => downloadElementAsPdf("absence-report", { filename, orientation: request.kind === "resumo" ? "portrait" : "landscape" }).catch(() => ErrorMessage("Não foi possível gerar o PDF."));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}><Icon name="Download" className="size-4" />CSV</Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={exportPdf}><Icon name="FileDown" className="size-4" />PDF</Button>
      </div>
      <div id="absence-report" className="space-y-3 rounded-sm border bg-white p-4 text-black">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-xs text-neutral-600">{data.section.class_level} {data.section.name} · {periodText}</p>
        </div>
        {request.kind === "resumo" && <SummaryTable data={data} />}
        {request.kind === "mapa_diario" && <DailyMap data={data} />}
        {request.kind === "por_disciplina" && <BySubject data={data} />}
        {request.kind === "ficha_mensal" && <BlankSheet data={data} month={request.month} />}
      </div>
    </div>
  );
}

const th = "border border-neutral-300 px-2 py-1 text-left text-xs font-semibold bg-neutral-100";
const td = "border border-neutral-300 px-2 py-1 text-xs";

function SummaryTable({ data }: { data: AttendanceReportData }) {
  const rows = summarizeStudents(data);
  return (
    <table className="w-full border-collapse">
      <thead><tr><th className={th}>N.º</th><th className={th}>Aluno</th><th className={th}>Tempos</th><th className={th}>Presenças</th><th className={th}>Atrasos</th><th className={th}>F. just.</th><th className={th}>F. injust.</th><th className={th}>% faltas</th><th className={th}>Situação</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.enrollmentId}>
            <td className={td}>{r.processNumber}</td><td className={td}>{r.name}</td><td className={td}>{r.lessons}</td><td className={td}>{r.present}</td><td className={td}>{r.late}</td><td className={td}>{r.justified}</td><td className={td}>{r.unjustified}</td>
            <td className={td}>{r.absenceRate.toFixed(1).replace(".", ",")}%</td>
            <td className={td}>{r.atRisk ? <Badge variant="destructive">Em risco</Badge> : r.lessons === 0 ? "—" : "Regular"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DailyMap({ data }: { data: AttendanceReportData }) {
  const days = recordedDays(data);
  if (days.length === 0) return <p className="text-sm text-neutral-600">Sem registos de chamada neste período.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead><tr><th className={th}>Aluno</th>{days.map((d) => <th key={d} className={`${th} text-center`}>{d.slice(8)}</th>)}</tr></thead>
        <tbody>
          {data.students.map((s) => (
            <tr key={s.enrollment_id}><td className={`${td} whitespace-nowrap`}>{s.full_name}</td>{days.map((d) => <td key={d} className={`${td} text-center`}>{dayMark(data, s.enrollment_id, d)}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-neutral-600">P presente · F falta injustificada · FJ falta justificada · At atraso (cada dia resume todos os tempos do aluno).</p>
    </div>
  );
}

function BySubject({ data }: { data: AttendanceReportData }) {
  const rows = absencesBySubject(data);
  return (
    <table className="w-full border-collapse">
      <thead><tr><th className={th}>Aluno</th>{data.subjects.map((s) => <th key={s.section_subject_id} className={`${th} text-center`}>{s.name}</th>)}<th className={`${th} text-center`}>Total</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.enrollmentId}><td className={td}>{r.name}</td>{data.subjects.map((s) => <td key={s.section_subject_id} className={`${td} text-center`}>{r.perSubject[s.section_subject_id]}</td>)}<td className={`${td} text-center font-semibold`}>{r.total}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function BlankSheet({ data, month }: { data: AttendanceReportData; month: string }) {
  const days = weekdaysOfMonth(month);
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead><tr><th className={th}>N.º</th><th className={th}>Aluno</th>{days.map((d) => <th key={d} className={`${th} w-6 text-center`}>{d.slice(8)}</th>)}<th className={th}>Faltas</th></tr></thead>
        <tbody>
          {data.students.map((s, i) => (
            <tr key={s.enrollment_id}><td className={td}>{i + 1}</td><td className={`${td} whitespace-nowrap`}>{s.full_name}</td>{days.map((d) => <td key={d} className={`${td} h-6`} />)}<td className={`${td} w-12`} /></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-neutral-600">Preencher com P, F, FJ ou At. Só dias úteis; feriados e interrupções ficam por conta da escola.</p>
    </div>
  );
}

function buildCsv(data: AttendanceReportData, request: Request): Array<Array<string | number>> {
  const head = [[`${data.section.class_level} ${data.section.name}`, request.kind === "ficha_mensal" ? request.month : `${data.from} a ${data.to}`]];
  if (request.kind === "resumo") {
    return [...head, ["N.º", "Aluno", "Tempos", "Presenças", "Atrasos", "Faltas justificadas", "Faltas injustificadas", "% faltas", "Situação"], ...summarizeStudents(data).map((r) => [r.processNumber, r.name, r.lessons, r.present, r.late, r.justified, r.unjustified, r.absenceRate.toFixed(1).replace(".", ","), r.atRisk ? "Em risco" : r.lessons === 0 ? "" : "Regular"])];
  }
  if (request.kind === "mapa_diario") {
    const days = recordedDays(data);
    return [...head, ["Aluno", ...days.map((d) => d.slice(8, 10) + "/" + d.slice(5, 7))], ...data.students.map((s) => [s.full_name, ...days.map((d) => dayMark(data, s.enrollment_id, d))])];
  }
  if (request.kind === "por_disciplina") {
    return [...head, ["Aluno", ...data.subjects.map((s) => s.name), "Total"], ...absencesBySubject(data).map((r) => [r.name, ...data.subjects.map((s) => r.perSubject[s.section_subject_id]), r.total])];
  }
  const days = weekdaysOfMonth(request.month);
  return [...head, ["N.º", "Aluno", ...days.map((d) => d.slice(8)), "Faltas"], ...data.students.map((s, i) => [i + 1, s.full_name, ...days.map(() => ""), ""])];
}
