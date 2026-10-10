"use client";

import { useMemo, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, ButtonOnlyAction, DataList, DynamicMetricCard, EmptyState, FormModal, FormTextarea, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { usePortal } from "@/modules/family/hooks/use-portal";
import type { PortalAssessment } from "@/modules/family/services/portal-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { FamilyEvolution } from "./family-evolution";
import type { FamilyContext } from "./family-shell";

const REVIEW_MODAL = "family-review";
const TYPE_LABEL: Record<string, string> = { avaliacao_continua: "Avaliação contínua", avaliacao_sistematica: "Avaliação sistemática", prova_periodica: "Prova periódica" };
const grade = (v: number | null) => (v === null ? "—" : v.toFixed(1));
const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));
const run = (p: Promise<unknown>, ok: string) => p.then(() => { SucessMessage(ok); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); });

type GradeRow = { id: string; term: number; closed: boolean; subject: string; mac: number | null; mas: number | null; mt: number | null };

/** Aproveitamento: notas por trimestre, avaliações com pedido de reapreciação e assiduidade. */
export function FamilyPerformance({ studentId }: FamilyContext) {
  const live = usePortal(studentId, ["grades", "assessments", "attendance"]);
  const { openModal } = useModal();
  const [target, setTarget] = useState<PortalAssessment | null>(null);
  const [reason, setReason] = useState("");

  const rows: GradeRow[] = useMemo(
    () => live.grades.flatMap((t) => t.subjects.map((s) => ({ id: `${t.term.id}:${s.name}`, term: t.term.sequence, closed: t.status === "fechada", subject: s.name, mac: s.mac, mas: s.mas, mt: s.mt }))),
    [live.grades],
  );
  const reviewRows = useMemo(() => live.assessments.map((a) => ({ ...a, id: a.assessment_id })), [live.assessments]);
  const attendanceRows = useMemo(() => (live.attendance?.data ?? []).map((r) => ({ ...r })), [live.attendance]);

  const lastTerm = [...live.grades].sort((a, b) => b.term.sequence - a.term.sequence).find((t) => t.subjects.some((s) => s.mt !== null));
  const mts = (lastTerm?.subjects ?? []).map((s) => s.mt).filter((v): v is number => v !== null);
  const avg = mts.length ? mts.reduce((a, b) => a + b, 0) / mts.length : null;
  const negatives = mts.filter((v) => v < 10).length;
  const rate = live.attendance?.summary.attendance_rate;

  const gradeColumns: Column<GradeRow>[] = [
    { key: "term", header: "Trimestre", render: (_, r) => <span className="text-xs">{r.term}.º{!r.closed && <span className="ml-1 text-muted-foreground">(pauta aberta)</span>}</span> },
    { key: "subject", header: "Disciplina", render: (_, r) => <span className="font-medium">{r.subject}</span> },
    { key: "mac", header: "MAC", render: (_, r) => <span className="font-mono">{grade(r.mac)}</span> },
    { key: "mas", header: "MAS", render: (_, r) => <span className="font-mono">{grade(r.mas)}</span> },
    { key: "mt", header: "MT", render: (_, r) => <span className={`font-mono font-semibold ${r.mt !== null && r.mt < 10 ? "text-destructive" : ""}`}>{grade(r.mt)}</span> },
  ];

  const reviewColumns: Column<PortalAssessment & { id: string }>[] = [
    { key: "subject", header: "Avaliação", render: (_, a) => (<div><p className="font-medium">{a.subject}</p><p className="text-xs text-muted-foreground">{TYPE_LABEL[a.type] ?? a.type} • {a.date}</p></div>) },
    { key: "numeric_value", header: "Nota", render: (_, a) => <span className="font-mono font-semibold">{a.numeric_value ?? a.qualitative_value ?? a.status}</span> },
    { key: "review_deadline", header: "Prazo", render: (_, a) => <span className="text-xs">{a.review_deadline ?? "—"}</span> },
    { key: "review", header: "Reapreciação", render: (_, a) => (a.review ? <Badge variant="outline">{a.review.status}</Badge> : <span className="text-xs text-muted-foreground">—</span>) },
    {
      key: "actions", header: "Acção",
      render: (_, a) => (
        <ButtonOnlyAction data={a} actions={a.review
          ? a.review.status === "pedido" ? [{ label: "Cancelar pedido", icon: "X", variant: "destructive", onClick: (x) => void run(live.cancelReview.mutateAsync(x.review!.id), "Pedido cancelado.") }] : []
          : [{ label: "Pedir reapreciação", icon: "FilePen", onClick: (x) => { setTarget(x); setReason(""); openModal(REVIEW_MODAL); } }]} />
      ),
    },
  ];

  const attendanceColumns: Column<(typeof attendanceRows)[number]>[] = [
    { key: "date", header: "Data", render: (_, r) => <span className="font-mono text-xs">{r.date}</span> },
    { key: "status", header: "Estado", render: (_, r) => <Badge variant={r.status.startsWith("falta") ? "destructive" : "outline"}>{r.status.replace("_", " ")}</Badge> },
    { key: "justification", header: "Justificação", render: (_, r) => <span className="text-xs text-muted-foreground">{r.justification ?? "—"}</span> },
  ];

  if (live.gradesForbidden) return <EmptyState icon="Lock" title="Sem autorização" description="Não tem autorização para consultar as notas deste educando." />;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={avg !== null ? avg.toFixed(1) : "—"} subtitle="Média do trimestre" icon="GraduationCap" description={lastTerm ? `${lastTerm.term.sequence}.º Trimestre` : "Sem notas publicadas"} />
        <DynamicMetricCard title={mts.length - negatives} subtitle="Disciplinas positivas" icon="CircleCheck" description="MT igual ou superior a 10" />
        <DynamicMetricCard title={negatives} subtitle="Disciplinas negativas" icon="TriangleAlert" colors={negatives > 0 ? "destructive" : "default"} description="MT inferior a 10" />
        <DynamicMetricCard title={rate != null ? `${Math.round(rate)}%` : "—"} subtitle="Assiduidade" icon="CalendarCheck" description={live.attendance ? `${live.attendance.summary.unjustified_absences} faltas injustificadas` : "Sem registos"} />
      </div>

      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="grades" className="text-xs">Notas</TabsTrigger>
          <TabsTrigger value="evolution" className="text-xs">Evolução e boletins</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs">Avaliações e reapreciação</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs">Assiduidade</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <DataList<GradeRow>
            prefix="notas" rows={rows} columns={gradeColumns} isLoading={live.gradesLoading} pageSize={12}
            searchPlaceholder="Pesquisar disciplina" searchText={(r) => r.subject}
            filters={[
              { key: "trimestre", label: "Trimestre", icon: "CalendarRange", options: uniq(rows.map((r) => String(r.term))).map((v) => ({ value: v, label: `${v}.º Trimestre` })), match: (r, v) => String(r.term) === v },
              { key: "situacao", label: "Situação", icon: "ListFilter", options: [{ value: "positiva", label: "Positiva (≥ 10)" }, { value: "negativa", label: "Negativa (< 10)" }, { value: "semnota", label: "Sem nota" }], match: (r, v) => (v === "semnota" ? r.mt === null : r.mt !== null && (v === "positiva" ? r.mt >= 10 : r.mt < 10)) },
              { key: "disciplina", label: "Disciplina", icon: "BookOpen", options: uniq(rows.map((r) => r.subject)).map((v) => ({ value: v, label: v })), match: (r, v) => r.subject === v },
            ]}
            sorts={[{ value: "disciplina", label: "Disciplina", compare: (a, b) => a.subject.localeCompare(b.subject, "pt") }, { value: "mt", label: "MT", compare: (a, b) => (a.mt ?? -1) - (b.mt ?? -1) }]}
            emptyTitle="Sem notas" emptyDescription="Ainda não há notas publicadas." emptyIcon="GraduationCap"
          />
        </TabsContent>

        <TabsContent value="evolution"><FamilyEvolution studentId={studentId} /></TabsContent>

        <TabsContent value="reviews">
          <DataList<PortalAssessment & { id: string }>
            prefix="reapreciacao" rows={reviewRows} columns={reviewColumns} pageSize={10}
            searchPlaceholder="Pesquisar disciplina" searchText={(a) => `${a.subject} ${TYPE_LABEL[a.type] ?? a.type}`}
            filters={[
              { key: "tipo", label: "Tipo", icon: "ListFilter", options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })), match: (a, v) => a.type === v },
              { key: "disciplina", label: "Disciplina", icon: "BookOpen", options: uniq(reviewRows.map((a) => a.subject)).map((v) => ({ value: v, label: v })), match: (a, v) => a.subject === v },
              { key: "pedido", label: "Reapreciação", icon: "FilePen", options: [{ value: "com", label: "Com pedido" }, { value: "sem", label: "Sem pedido" }], match: (a, v) => (v === "com" ? Boolean(a.review) : !a.review) },
            ]}
            dateFilters={[{ key: "data", label: "Data", getDate: (a) => a.date }]}
            sorts={[{ value: "data", label: "Data", compare: (a, b) => a.date.localeCompare(b.date) }, { value: "nota", label: "Nota", compare: (a, b) => (a.numeric_value ?? -1) - (b.numeric_value ?? -1) }]}
            emptyTitle="Sem avaliações" emptyDescription="Ainda não há notas de pautas fechadas." emptyIcon="ClipboardList"
          />
        </TabsContent>

        <TabsContent value="attendance">
          {live.attendanceForbidden ? <EmptyState icon="Lock" title="Sem autorização" description="Não tem autorização para consultar a assiduidade deste educando." /> : (
            <DataList<(typeof attendanceRows)[number]>
              prefix="presencas" rows={attendanceRows} columns={attendanceColumns} pageSize={12}
              searchPlaceholder="Pesquisar justificação" searchText={(r) => `${r.status} ${r.justification ?? ""}`}
              filters={[{ key: "estado", label: "Estado", icon: "ListFilter", options: uniq(attendanceRows.map((r) => r.status)).map((v) => ({ value: v, label: v.replace("_", " ") })), match: (r, v) => r.status === v }]}
              dateFilters={[{ key: "dia", label: "Dia", getDate: (r) => r.date }]}
              sorts={[{ value: "data", label: "Data", compare: (a, b) => a.date.localeCompare(b.date) }]}
              emptyTitle="Sem registos" emptyDescription="Ainda não há registos de assiduidade." emptyIcon="CalendarCheck"
            />
          )}
        </TabsContent>
      </Tabs>

      <FormModal id={REVIEW_MODAL} title="Pedir reapreciação" description={target ? `${target.subject} — nota ${target.numeric_value ?? target.qualitative_value ?? target.status}` : undefined} submitLabel="Enviar pedido" isLoading={live.requestReview.isPending} disabled={reason.trim().length < 10}
        onSubmit={() => (target ? live.requestReview.mutateAsync({ assessmentId: target.assessment_id, reason: reason.trim() }).then(() => { SucessMessage("Pedido enviado."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; }) : undefined)}>
        <div className="sm:col-span-2"><FormTextarea label="Motivo (mín. 10 caracteres) *" value={reason} onChange={setReason} rows={3} /></div>
      </FormModal>
    </>
  );
}
