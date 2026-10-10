"use client";

import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Button, ChartContainer, ChartTooltip, ChartTooltipContent, DashboardSkeleton, DynamicMetricCard, EmptyState, Icon, type ChartConfig } from "@/components";
import { ChartCard, ChartEmpty, LegendRow, RateBar } from "@/components/shared/chart-card";
import { useFinanceOverview } from "@/modules/finance/hooks/use-tuition-payments";
import type { FinanceOverview } from "@/modules/finance/services/tuition-payments-service";
import { formatAxisCurrency, formatCurrency } from "@/utils/format-currency";

const PALETTE = ["var(--primary)", "color-mix(in oklab, var(--primary) 70%, transparent)", "color-mix(in oklab, var(--primary) 48%, transparent)", "color-mix(in oklab, var(--primary) 30%, transparent)"];
const AGING_COLORS = ["var(--primary)", "#f59e0b", "#f97316", "#ef4444", "#b91c1c"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`;
const n = (v: string | number | null | undefined) => Number(v ?? 0);

interface FinanceDashboardProps {
  /** `operations` = painel do módulo de propinas (atalhos); `report` = relatório financeiro (detalhe e indicadores). */
  variant?: "operations" | "report";
}

/** Painel financeiro (padrão MindGest): métricas, gráficos e cartões de secção, alimentado por `/finance/overview`. */
export function FinanceDashboard({ variant = "operations" }: FinanceDashboardProps) {
  const { data, isLoading, isError } = useFinanceOverview();

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <EmptyState icon="Lock" title="Sem acesso aos indicadores" description="O seu perfil não pode consultar os indicadores financeiros." />;
  if (!data?.kpis) return <EmptyState icon="Wallet" title="Ainda sem dados financeiros" description="Quando houver facturas no ano lectivo activo, os indicadores aparecem aqui." />;

  const k = data.kpis;
  const sub = data.submissions;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {variant === "operations" && <QuickActions open={sub?.open ?? 0} />}

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4" data-tour="finance-summary">
        <DynamicMetricCard title={formatCurrency(Number(k.billed))} subtitle="Facturado no ano" icon="Receipt" description={`${k.invoices_total} facturas · ${k.students_billed} alunos`} />
        <DynamicMetricCard title={formatCurrency(Number(k.collected))} subtitle="Cobrado" icon="Coins" description={k.collection_rate !== null ? `Taxa de cobrança ${k.collection_rate}%` : "Sem facturação"} />
        <DynamicMetricCard title={formatCurrency(Number(k.overdue_amount))} subtitle="Em atraso" icon="TriangleAlert" colors={n(k.overdue_amount) > 0 ? "destructive" : "default"} description={`${k.overdue_count} facturas · ${k.students_with_debt} alunos devedores`} />
        <DynamicMetricCard title={sub?.open ?? 0} subtitle="Comprovativos por validar" icon="FileCheck" description={sub?.avg_review_hours != null ? `Validação média em ${sub.avg_review_hours} h` : "Pagamentos enviados pelas famílias"} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><MonthlyChart data={data.monthly} /></div>
        <MethodDonut data={data.by_method} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <AgingChart data={data.aging} overdue={k.overdue_amount} />
        <div className="lg:col-span-2"><ClassCollection data={data.by_class} /></div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <TopDebtors rows={data.top_debtors} />
        <WorstSections rows={data.worst_sections} />
        <Forecast rows={data.forecast} outstanding={k.outstanding} />
      </div>

      <Indicators data={data} />

      {variant === "report" && <ByType data={data.by_type} />}
    </div>
  );
}

function QuickActions({ open }: { open: number }) {
  const items = [
    { href: "/tuition/submissions", icon: "FileCheck" as const, label: open > 0 ? `Validar comprovativos (${open})` : "Comprovativos", primary: open > 0 },
    { href: "/tuition/payments", icon: "Wallet" as const, label: "Registar pagamento", primary: false },
    { href: "/tuition/collections", icon: "Send" as const, label: "Cobranças e lembretes", primary: false },
    { href: "/settings?tab=bank-accounts", icon: "Landmark" as const, label: "Dados bancários", primary: false },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <Button key={i.href} asChild size="sm" variant={i.primary ? "default" : "outline"} className="gap-2">
          <Link href={i.href}><Icon name={i.icon} className="size-4" />{i.label}</Link>
        </Button>
      ))}
    </div>
  );
}

function MonthlyChart({ data }: { data: FinanceOverview["monthly"] }) {
  const config = { billed: { label: "Facturado", color: "color-mix(in oklab, var(--primary) 35%, transparent)" }, cash: { label: "Cobrado (caixa)", color: "var(--primary)" } } satisfies ChartConfig;
  const rows = data.map((m) => ({ month: monthLabel(m.month), billed: n(m.billed), cash: n(m.cash_in) }));
  return (
    <ChartCard title="Facturado vs cobrado" icon="ChartColumn" description="Facturação por mês de vencimento e dinheiro recebido no mês">
      {rows.length === 0 ? <ChartEmpty text="Sem movimentos." /> : (
        <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
          <BarChart data={rows} margin={{ top: 14, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={68} tickFormatter={(v: number) => formatAxisCurrency(v)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(v, name) => <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">{name === "billed" ? "Facturado" : "Cobrado"}</span><span className="font-medium tabular-nums">{formatCurrency(Number(v))}</span></span>} />} />
            <Bar dataKey="billed" fill="var(--color-billed)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="cash" fill="var(--color-cash)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

function MethodDonut({ data }: { data: FinanceOverview["by_method"] }) {
  const total = data.reduce((a, d) => a + n(d.amount), 0);
  const config = Object.fromEntries(data.map((d, i) => [d.label, { label: d.label, color: PALETTE[i % PALETTE.length] }])) satisfies ChartConfig;
  const rows = data.map((d) => ({ name: d.label, value: n(d.amount) }));
  return (
    <ChartCard title="Métodos de pagamento" icon="ChartPie" description="Como as famílias pagam">
      {total === 0 ? <ChartEmpty text="Ainda não há pagamentos." /> : (
        <>
          <ChartContainer config={config} className="mx-auto h-[190px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(Number(v))} />} />
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                {rows.map((r, i) => <Cell key={r.name} fill={PALETTE[i % PALETTE.length]} />)}
                <Label content={({ viewBox }) => (viewBox && "cx" in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-lg font-bold">{formatAxisCurrency(total)}</tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">Recebido</tspan>
                  </text>
                ) : null)} />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-3 space-y-2">{data.map((d, i) => <LegendRow key={d.method} color={PALETTE[i % PALETTE.length]} label={d.label} value={formatCurrency(Number(d.amount))} hint={d.share !== null ? `${d.share}%` : undefined} />)}</ul>
        </>
      )}
    </ChartCard>
  );
}

function AgingChart({ data, overdue }: { data: FinanceOverview["aging"]; overdue: string }) {
  const config = { amount: { label: "Valor", color: "var(--primary)" } } satisfies ChartConfig;
  const rows = data.map((a) => ({ label: a.label, amount: n(a.amount), invoices: a.invoices }));
  const empty = rows.every((r) => r.amount === 0);
  return (
    <ChartCard title="Dívida por antiguidade" icon="Hourglass" description={`${formatCurrency(Number(overdue))} em atraso`}>
      {empty ? <ChartEmpty text="Sem dívida em aberto." /> : (
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v: number) => formatAxisCurrency(v)} />
            <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={78} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(v, _n, item) => <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">{(item?.payload as { invoices?: number })?.invoices ?? 0} facturas</span><span className="font-medium tabular-nums">{formatCurrency(Number(v))}</span></span>} />} />
            <Bar dataKey="amount" radius={4}>{rows.map((r, i) => <Cell key={r.label} fill={AGING_COLORS[i]} />)}</Bar>
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

function ClassCollection({ data }: { data: FinanceOverview["by_class"] }) {
  return (
    <ChartCard title="Cobrança por classe" icon="GraduationCap" description="Taxa de cobrança e valor em aberto de cada classe">
      {data.length === 0 ? <ChartEmpty text="Sem classes com facturação." /> : (
        <ul className="space-y-3 pb-2">
          {data.map((c) => (
            <li key={c.class_level} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate font-medium">{c.class_level}<span className="block text-xs font-normal text-muted-foreground">{c.students} alunos</span></span>
              <RateBar value={c.rate} tone={(c.rate ?? 0) >= 90 ? "success" : (c.rate ?? 0) >= 70 ? "warning" : "danger"} />
              <span className="w-28 text-right text-xs tabular-nums text-muted-foreground">{formatCurrency(Number(c.outstanding))}</span>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}

function TopDebtors({ rows }: { rows: FinanceOverview["top_debtors"] }) {
  return (
    <ChartCard title="Maiores devedores" icon="UserX" description="Alunos com mais valor em atraso">
      {rows.length === 0 ? <ChartEmpty text="Sem devedores." /> : (
        <ul className="space-y-2.5 pb-2">{rows.map((r) => <LegendRow key={r.student_id} label={r.full_name} value={formatCurrency(Number(r.outstanding))} hint={`${r.days_oldest} d`} />)}</ul>
      )}
    </ChartCard>
  );
}

function WorstSections({ rows }: { rows: FinanceOverview["worst_sections"] }) {
  return (
    <ChartCard title="Turmas com mais dívida" icon="Users" description="Onde concentrar a cobrança">
      {rows.length === 0 ? <ChartEmpty text="Nenhuma turma com atraso." /> : (
        <ul className="space-y-3 pb-2">{rows.map((r) => (
          <li key={r.section} className="space-y-1">
            <div className="flex justify-between text-sm"><span className="font-medium">{r.section}</span><span className="tabular-nums text-destructive">{formatCurrency(Number(r.overdue))}</span></div>
            <RateBar value={r.rate} tone={(r.rate ?? 0) >= 90 ? "success" : (r.rate ?? 0) >= 70 ? "warning" : "danger"} />
          </li>
        ))}</ul>
      )}
    </ChartCard>
  );
}

function Forecast({ rows, outstanding }: { rows: FinanceOverview["forecast"]; outstanding: string }) {
  return (
    <ChartCard title="Previsão de entradas" icon="TrendingUp" description={`${formatCurrency(Number(outstanding))} em aberto no total`}>
      {rows.length === 0 ? <ChartEmpty text="Sem facturas a vencer." /> : (
        <ul className="space-y-2.5 pb-2">{rows.map((r) => <LegendRow key={r.month} label={monthLabel(r.month)} value={formatCurrency(Number(r.expected))} hint="a vencer" />)}</ul>
      )}
    </ChartCard>
  );
}

function Indicators({ data }: { data: FinanceOverview }) {
  const k = data.kpis!;
  const sub = data.submissions;
  const mails = data.reminders_30d;
  const tiles: Array<{ icon: Parameters<typeof Icon>[0]["name"]; label: string; value: string; hint?: string }> = [
    { icon: "Percent", label: "Descontos concedidos", value: formatCurrency(Number(k.discounts_granted)), hint: "bolsas e isenções" },
    { icon: "Gavel", label: "Multas de mora", value: formatCurrency(Number(k.late_fees)), hint: "geradas por atraso" },
    { icon: "Timer", label: "Prazo médio de pagamento", value: k.avg_days_to_pay === null ? "—" : `${k.avg_days_to_pay} dias`, hint: "face ao vencimento" },
    { icon: "UserX", label: "Alunos com dívida", value: k.debtors_rate === null ? "—" : `${k.debtors_rate}%`, hint: `${k.students_with_debt} de ${k.students_billed}` },
    { icon: "RotateCcw", label: "Recuperado em 30 dias", value: formatCurrency(Number(k.recovered_30d)), hint: "dívida cobrada com atraso" },
    { icon: "Smartphone", label: "Pagamentos online (90 dias)", value: sub ? formatCurrency(Number(sub.online_amount_90d)) : "—", hint: sub ? `${sub.approved} aprovados · ${sub.rejected} rejeitados` : undefined },
    { icon: "Mail", label: "Lembretes por email (30 dias)", value: mails ? String(mails.sent) : "—", hint: mails ? `${mails.failed} falhas` : undefined },
    { icon: "CircleCheck", label: "Facturas liquidadas", value: `${k.invoices_paid}/${k.invoices_total}`, hint: "no ano lectivo" },
  ];
  return (
    <ChartCard title="Indicadores de cobrança" icon="Gauge" description={`Ano lectivo ${data.academic_year?.name ?? ""} · actualizado a ${data.as_of}`}>
      <div className="grid grid-cols-2 gap-3 pb-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon name={t.icon} className="size-3.5" />{t.label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{t.value}</div>
            {t.hint && <div className="text-xs text-muted-foreground">{t.hint}</div>}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function ByType({ data }: { data: FinanceOverview["by_type"] }) {
  return (
    <ChartCard title="Receita por tipo de cobrança" icon="Layers" description="Propinas, matrículas, serviços e multas">
      <ul className="space-y-3 pb-2">
        {data.map((t) => (
          <li key={t.type} className="grid grid-cols-[150px_1fr_auto] items-center gap-3 text-sm">
            <span className="font-medium">{t.label}</span>
            <RateBar value={t.rate} tone={(t.rate ?? 0) >= 90 ? "success" : (t.rate ?? 0) >= 70 ? "warning" : "danger"} />
            <span className="w-44 text-right text-xs tabular-nums text-muted-foreground">{formatCurrency(Number(t.collected))} de {formatCurrency(Number(t.billed))}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
