"use client";
import { familyKeys } from "@/modules/family/query-keys";

import { useQuery } from "@tanstack/react-query";
import { ErrorMessage } from "@/utils/messages";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { Badge, Button, ChartContainer, ChartTooltip, ChartTooltipContent, EmptyState, GenericTable, Icon, type ChartConfig } from "@/components";
import { ChartCard, ChartEmpty } from "@/components/shared/chart-card";
import { portalService, type PortalPerformanceTerm } from "@/modules/family/services/portal-service";
import { getApiErrorMessage } from "@/utils/api-error";

const QUARTILE: Record<number, { label: string; variant: "success" | "info" | "warning" | "destructive" }> = {
  1: { label: "25% melhores", variant: "success" }, 2: { label: "Acima da mediana", variant: "info" }, 3: { label: "Abaixo da mediana", variant: "warning" }, 4: { label: "25% com mais dificuldade", variant: "destructive" },
};
const config = { aluno: { label: "Aluno", color: "var(--primary)" }, turma: { label: "Média da turma", color: "#94a3b8" } } satisfies ChartConfig;
const f1 = (v: number | null) => (v === null ? "—" : v.toFixed(1));

/** Evolução por trimestre: média do aluno vs. turma (anónima), linha do mínimo, posição por quartil e boletim informativo. */
export function FamilyEvolution({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useQuery({ queryKey: familyKeys.performance(studentId), queryFn: () => portalService.performance(studentId), enabled: Boolean(studentId), retry: false, staleTime: 60 * 1000 });

  if (isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  if (isError || !data) return <EmptyState icon="Lock" title="Sem acesso" description="Não é possível mostrar o aproveitamento deste educando." />;
  if (data.terms.length === 0) return <EmptyState icon="TrendingUp" title="Sem trimestres fechados" description="A evolução aparece quando a escola fechar a pauta do primeiro trimestre." />;

  const points = data.terms.map((t) => ({ name: `${t.term.sequence}.º trim.`, aluno: t.student_avg, turma: t.class_avg }));
  const openReport = (t: PortalPerformanceTerm) =>
    void portalService.reportCardPdf(studentId, t.term.sequence).then((b) => window.open(URL.createObjectURL(b), "_blank")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível abrir o boletim.")));

  return (
    <div className="space-y-6">
      <ChartCard title="Média por trimestre" icon="TrendingUp" description={`Linha tracejada: nota mínima (${data.pass_mark}). A média da turma não identifica nenhum aluno.`}>
        {points.every((p) => p.aluno === null) ? <ChartEmpty text="Sem médias calculadas." /> : (
          <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
            <LineChart data={points} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis domain={[0, 20]} tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine y={data.pass_mark} stroke="#ef4444" strokeDasharray="5 4" />
              <Line type="monotone" dataKey="turma" stroke="var(--color-turma)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line type="monotone" dataKey="aluno" stroke="var(--color-aluno)" strokeWidth={3} dot={{ r: 4 }} connectNulls />
            </LineChart>
          </ChartContainer>
        )}
      </ChartCard>

      {[...data.terms].reverse().map((t) => (
        <section key={t.term.id} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{t.term.sequence}.º Trimestre</h3>
              <Badge variant="outline" className="font-normal">Média {f1(t.student_avg)} (turma {f1(t.class_avg)})</Badge>
              {t.quartile && <Badge variant={QUARTILE[t.quartile]!.variant} className="font-normal">{QUARTILE[t.quartile]!.label}</Badge>}
              {t.negatives > 0 && <Badge variant="destructive" className="font-normal">{t.negatives} {t.negatives === 1 ? "negativa" : "negativas"}</Badge>}
            </div>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => openReport(t)}><Icon name="FileDown" className="size-4" />Boletim informativo</Button>
          </div>
          <GenericTable
            data={t.subjects.map((s) => ({ ...s, id: s.subject }))}
            columns={[
              { key: "subject", header: "Disciplina", className: "font-medium", render: (_, s) => s.subject },
              { key: "mt", header: "MT", className: "text-right font-mono font-semibold", render: (_, s) => <span className={s.passed === false ? "text-destructive" : ""}>{f1(s.mt)}</span> },
              { key: "class_avg", header: "Média da turma", className: "text-right font-mono text-muted-foreground", render: (_, s) => f1(s.class_avg) },
              { key: "range", header: "Mín. – Máx.", className: "text-right font-mono text-xs text-muted-foreground", render: (_, s) => (s.class_min === null ? "—" : `${f1(s.class_min)} – ${f1(s.class_max)}`) },
              { key: "quartile", header: "Posição", render: (_, s) => (s.quartile ? <Badge variant={QUARTILE[s.quartile]!.variant} className="font-normal">{QUARTILE[s.quartile]!.label}</Badge> : <span className="text-xs text-muted-foreground">—</span>) },
            ]}
          />
        </section>
      ))}
    </div>
  );
}
