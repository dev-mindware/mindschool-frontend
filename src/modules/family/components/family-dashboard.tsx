"use client";

import Link from "next/link";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Badge, Button, ChartContainer, ChartTooltip, ChartTooltipContent, DashboardSkeleton, DynamicMetricCard, EmptyState, FormSelect, Icon, type ChartConfig } from "@/components";
import { ChartCard, ChartEmpty, LegendRow } from "@/components/shared/chart-card";
import { usePortal } from "@/modules/family/hooks/use-portal";
import { usePortalPayments } from "@/modules/finance/hooks/use-tuition-payments";
import { SubmissionBadge } from "@/modules/finance/components/submissions/submission-status";
import { formatCurrency } from "@/utils/format-currency";

const ATT_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

/** Painel do encarregado / aluno: situação financeira em destaque (com acesso direto ao pagamento), notas, assiduidade e novidades. */
export function FamilyDashboard() {
  const portal = usePortal();
  const [picked, setPicked] = useState("");
  const wards = portal.wards;
  const active = picked || wards[0]?.student.id || "";
  const ward = wards.find((w) => w.student.id === active);
  const live = usePortal(active || undefined);
  const pay = usePortalPayments(active || undefined);

  if (portal.wardsLoading) return <DashboardSkeleton />;
  if (wards.length === 0) return <EmptyState icon="Users" title="Sem educandos associados" description="Peça à secretaria da escola para associar a sua conta ao(s) educando(s)." />;

  const payables = pay.payables;
  const debt = payables.reduce((a, p) => a + Number(p.balance), 0);
  const overdue = payables.filter((p) => p.is_overdue).reduce((a, p) => a + Number(p.balance), 0);
  const inReview = payables.reduce((a, p) => a + Number(p.reserved), 0);
  const next = payables.filter((p) => !p.is_overdue).sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  const canFinance = !pay.forbidden;

  const lastTerm = [...live.grades].filter((t) => t.subjects.some((s) => s.mt !== null)).sort((a, b) => b.term.sequence - a.term.sequence)[0];
  const gradeRows = (lastTerm?.subjects ?? []).filter((s) => s.mt !== null).map((s) => ({ name: s.name.length > 12 ? `${s.name.slice(0, 11)}…` : s.name, mt: Number(s.mt) }));
  const gradeConfig = { mt: { label: "MT", color: "var(--primary)" } } satisfies ChartConfig;
  const att = live.attendance?.summary;
  const attRows = att ? [{ name: "Presenças", value: att.present }, { name: "Atrasos", value: att.late }, { name: "Faltas justificadas", value: att.justified_absences }, { name: "Faltas injustificadas", value: att.unjustified_absences }] : [];
  const attTotal = attRows.reduce((a, r) => a + r.value, 0);
  const attConfig = Object.fromEntries(attRows.map((r, i) => [r.name, { label: r.name, color: ATT_COLORS[i] }])) satisfies ChartConfig;
  const open = pay.submissions.filter((s) => ["submetido", "em_analise", "substituicao_pedida"].includes(s.status));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{ward?.student.full_name}</h2>
          <p className="text-xs text-muted-foreground">{ward?.current_enrollment ? `${ward.current_enrollment.class_level} ${ward.current_enrollment.section} · ${ward.current_enrollment.shift}` : "Sem matrícula ativa"}</p>
        </div>
        {wards.length > 1 && <div className="w-60"><FormSelect label="Educando" value={active} onValueChange={setPicked} options={wards.map((w) => ({ value: w.student.id, label: w.student.full_name }))} /></div>}
      </div>

      {canFinance && (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4" data-tour="family-finance">
            <DynamicMetricCard title={formatCurrency(debt)} subtitle="Em dívida" icon="Wallet" colors={debt > 0 ? "destructive" : "default"} description={debt > 0 ? `${payables.length} factura(s) por pagar` : "Está tudo em dia"} />
            <DynamicMetricCard title={formatCurrency(overdue)} subtitle="Vencido" icon="TriangleAlert" colors={overdue > 0 ? "destructive" : "default"} description={overdue > 0 ? "Pague para evitar multa de mora" : "Nada em atraso"} />
            <DynamicMetricCard title={formatCurrency(inReview)} subtitle="Em análise" icon="Hourglass" description={open.length ? `${open.length} comprovativo(s) a validar` : "Sem comprovativos pendentes"} />
            <DynamicMetricCard title={next ? next.due_date : "—"} subtitle="Próximo vencimento" icon="CalendarClock" description={next ? `${next.description} · ${formatCurrency(next.balance)}` : "Sem faturas a vencer"} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title="Propinas e taxas por pagar" icon="Receipt" description="Pague por transferência e submeta o comprovativo; a escola valida e confirma por email."
                action={<Button asChild size="sm" className="gap-2"><Link href="/familia/financeiro"><Icon name="Landmark" className="size-4" />Pagar agora</Link></Button>}>
                {payables.length === 0 ? <ChartEmpty text="Não há faturas por pagar. Obrigado!" /> : (
                  <ul className="space-y-3 pb-2">
                    {payables.slice(0, 6).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0"><span className="font-medium capitalize">{p.description}</span><span className="block text-xs text-muted-foreground">vence {p.due_date}</span></span>
                        <span className="flex shrink-0 items-center gap-2">
                          {p.is_overdue && <Badge variant="destructive" className="font-normal">Vencida</Badge>}
                          {Number(p.reserved) > 0 && <Badge variant="info" className="font-normal">Em análise</Badge>}
                          <span className="font-semibold tabular-nums">{formatCurrency(p.balance)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </ChartCard>
            </div>
            <ChartCard title="Comprovativos recentes" icon="FileCheck" description="Estado dos pagamentos enviados">
              {pay.submissions.length === 0 ? <ChartEmpty text="Ainda não enviou comprovativos." /> : (
                <ul className="space-y-3 pb-2">{pay.submissions.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                    <span><span className="font-mono text-xs text-primary">{s.protocol}</span><span className="block text-xs text-muted-foreground">{formatCurrency(s.confirmed_amount ?? s.total_amount)}</span></span>
                    <SubmissionBadge status={s.status} />
                  </li>
                ))}</ul>
              )}
            </ChartCard>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Notas por disciplina" icon="GraduationCap" description={lastTerm ? `Média trimestral — ${lastTerm.term.sequence}.º Trimestre` : "Média trimestral"} action={<Button asChild size="sm" variant="ghost"><Link href="/familia/aproveitamento">Ver notas</Link></Button>}>
            {gradeRows.length === 0 ? <ChartEmpty text="Ainda não há notas publicadas." /> : (
              <ChartContainer config={gradeConfig} className="aspect-auto h-[240px] w-full">
                <BarChart data={gradeRows} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis domain={[0, 20]} tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="mt" radius={[6, 6, 0, 0]}>{gradeRows.map((r) => <Cell key={r.name} fill={r.mt < 10 ? "#ef4444" : "var(--primary)"} />)}</Bar>
                </BarChart>
              </ChartContainer>
            )}
          </ChartCard>
        </div>
        <ChartCard title="Assiduidade" icon="CalendarCheck" description={att?.attendance_rate != null ? `Taxa de assiduidade ${att.attendance_rate}%` : "Presenças e faltas"}>
          {attTotal === 0 ? <ChartEmpty text="Sem registos de assiduidade." /> : (
            <>
              <ChartContainer config={attConfig} className="mx-auto h-[170px] w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={attRows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={76} paddingAngle={3} strokeWidth={0}>
                    {attRows.map((r, i) => <Cell key={r.name} fill={ATT_COLORS[i]} />)}
                    <Label content={({ viewBox }) => (viewBox && "cx" in viewBox ? (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">{attTotal}</tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground text-xs">Aulas</tspan>
                      </text>
                    ) : null)} />
                  </Pie>
                </PieChart>
              </ChartContainer>
              <ul className="mt-2 space-y-1.5">{attRows.map((r, i) => <LegendRow key={r.name} color={ATT_COLORS[i]} label={r.name} value={r.value} />)}</ul>
            </>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <ChartCard title="Comunicados da escola" icon="Megaphone" action={<Button asChild size="sm" variant="ghost"><Link href="/familia/comunicados">Ver todos</Link></Button>}>
          {portal.announcements.length === 0 ? <ChartEmpty text="Sem comunicados." /> : (
            <ul className="space-y-3 pb-2">{portal.announcements.slice(0, 4).map((a) => (
              <li key={a.id} className="text-sm"><span className="font-medium">{a.title}</span><span className="block text-xs text-muted-foreground">{a.published_at?.slice(0, 10)}</span></li>
            ))}</ul>
          )}
        </ChartCard>
        <ChartCard title="Próximos eventos" icon="CalendarDays" action={<Button asChild size="sm" variant="ghost"><Link href="/familia/calendario">Calendário</Link></Button>}>
          {portal.calendar.length === 0 ? <ChartEmpty text="Sem eventos publicados." /> : (
            <ul className="space-y-3 pb-2">{portal.calendar.filter((e) => e.end_date >= new Date().toISOString().slice(0, 10)).slice(0, 4).map((e) => (
              <li key={e.id} className="text-sm"><span className="font-medium">{e.title}</span><span className="block text-xs text-muted-foreground">{e.start_date}{e.end_date !== e.start_date ? ` → ${e.end_date}` : ""}{e.location ? ` · ${e.location}` : ""}</span></li>
            ))}</ul>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
