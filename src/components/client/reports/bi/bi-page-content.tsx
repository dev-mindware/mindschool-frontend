"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Badge, ChartContainer, ChartTooltip, ChartTooltipContent, DashboardSkeleton, EmptyState, Icon, TitleList, type ChartConfig } from "@/components";
import { ChartCard, ChartEmpty } from "@/components/shared/chart-card";
import { useAnalytics } from "@/hooks/school/use-analytics";
import type { ApiInsight, ApiTrends } from "@/services/analytics-service";
import { formatAxisCurrency, formatCurrency } from "@/utils/format-currency";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`;
const num = (v: string | number | null | undefined) => Number(v ?? 0);
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${v}%`);

const RATE_CONFIG = {
  approval: { label: "Aprovação", color: "var(--primary)" },
  attendance: { label: "Assiduidade", color: "#10b981" },
  dropout: { label: "Abandono", color: "#ef4444" },
} satisfies ChartConfig;
const MONEY_CONFIG = {
  billed: { label: "Facturado", color: "color-mix(in oklab, var(--primary) 35%, transparent)" },
  collected: { label: "Cobrado", color: "var(--primary)" },
} satisfies ChartConfig;
const COUNT_CONFIG = { enrolled: { label: "Matrículas", color: "var(--primary)" } } satisfies ChartConfig;
const MONTHLY_CONFIG = { rate: { label: "Assiduidade", color: "#10b981" } } satisfies ChartConfig;

/** Valor do indicador no texto: matrículas são um número, o resto são percentagens. */
const fmt = (key: string, v: number) => (key === "enrolled" ? String(v) : `${v}%`);

function InsightCard({ i }: { i: ApiInsight }) {
  const tone = i.favourable === null ? "text-muted-foreground" : i.favourable ? "text-emerald-600" : "text-destructive";
  const arrow = i.trend === "up" ? "TrendingUp" : i.trend === "down" ? "TrendingDown" : "Minus";
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs text-muted-foreground">{i.label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{fmt(i.key, i.current)}</p>
      <p className={`mt-1 flex items-center gap-1 text-xs ${tone}`}>
        <Icon name={arrow} className="size-3.5" />
        {i.delta > 0 ? "+" : ""}{i.delta}{i.key === "enrolled" ? "" : " p.p."} face a {i.previous_year}
      </p>
    </div>
  );
}

function RatesChart({ t }: { t: ApiTrends }) {
  const rows = t.years.map((y) => ({ year: y.academic_year.name, approval: y.approval_rate, attendance: y.attendance_rate, dropout: y.dropout_rate }));
  const has = rows.some((r) => r.approval !== null || r.attendance !== null || r.dropout !== null);
  return (
    <ChartCard title="Aprovação, assiduidade e abandono" icon="ChartLine" description="Percentagens por ano lectivo">
      {!has ? <ChartEmpty text="Ainda sem dados suficientes." /> : (
        <ChartContainer config={RATE_CONFIG} className="aspect-auto h-[280px] w-full">
          <LineChart data={rows} margin={{ top: 14, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={40} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" formatter={(v, name) => <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">{RATE_CONFIG[name as keyof typeof RATE_CONFIG]?.label ?? name}</span><span className="font-medium tabular-nums">{pct(Number(v))}</span></span>} />} />
            <Line dataKey="approval" stroke="var(--color-approval)" strokeWidth={2} dot connectNulls />
            <Line dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={2} dot connectNulls />
            <Line dataKey="dropout" stroke="var(--color-dropout)" strokeWidth={2} dot connectNulls />
          </LineChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

function EnrolledChart({ t }: { t: ApiTrends }) {
  const rows = t.years.map((y) => ({ year: y.academic_year.name, enrolled: y.enrolled }));
  const has = rows.some((r) => r.enrolled > 0);
  return (
    <ChartCard title="Matrículas por ano lectivo" icon="Users" description="Matrículas confirmadas e concluídas">
      {!has ? <ChartEmpty text="Sem matrículas registadas." /> : (
        <ChartContainer config={COUNT_CONFIG} className="aspect-auto h-[280px] w-full">
          <BarChart data={rows} margin={{ top: 14, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="enrolled" fill="var(--color-enrolled)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

function MoneyChart({ t }: { t: ApiTrends }) {
  const rows = t.years.map((y) => ({ year: y.academic_year.name, billed: num(y.invoiced), collected: num(y.collected) }));
  const has = rows.some((r) => r.billed > 0 || r.collected > 0);
  return (
    <ChartCard title="Facturado vs cobrado" icon="Wallet" description="Por ano lectivo">
      {!has ? <ChartEmpty text="Sem facturação registada." /> : (
        <ChartContainer config={MONEY_CONFIG} className="aspect-auto h-[280px] w-full">
          <BarChart data={rows} margin={{ top: 14, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={68} tickFormatter={(v: number) => formatAxisCurrency(v)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(v, name) => <span className="flex w-full justify-between gap-3"><span className="text-muted-foreground">{name === "billed" ? "Facturado" : "Cobrado"}</span><span className="font-medium tabular-nums">{formatCurrency(Number(v))}</span></span>} />} />
            <Bar dataKey="billed" fill="var(--color-billed)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="collected" fill="var(--color-collected)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

function MonthlyAttendance({ t }: { t: ApiTrends }) {
  const rows = t.attendance_monthly.map((m) => ({ month: monthLabel(m.month), rate: m.rate }));
  return (
    <ChartCard title="Assiduidade por mês" icon="CalendarCheck" description="Ano lectivo mais recente (presenças e atrasos sobre o total de registos)">
      {rows.length === 0 ? <ChartEmpty text="Sem registos de assiduidade." /> : (
        <ChartContainer config={MONTHLY_CONFIG} className="aspect-auto h-[280px] w-full">
          <BarChart data={rows} margin={{ top: 14, right: 12, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={40} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(v) => <span className="font-medium tabular-nums">{pct(Number(v))}</span>} />} />
            <Bar dataKey="rate" fill="var(--color-rate)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

/** BI & Analytics (Enterprise): tendências da escola por ano lectivo, só com indicadores agregados. */
export function BiPageContent() {
  const { trends, isLoading, error } = useAnalytics();

  if (isLoading) return <DashboardSkeleton />;
  if (error || !trends) {
    return <EmptyState icon="ChartLine" title="BI & Analytics indisponível" description="Não foi possível carregar os indicadores. O BI faz parte do plano Enterprise e exige permissão de relatórios." />;
  }
  const provisional = trends.years.filter((y) => y.provisional).map((y) => y.academic_year.name);

  return (
    <div className="space-y-6">
      <TitleList title="BI & Analytics" suTitle="Tendências por ano lectivo e por mês, só com indicadores agregados (sem dados nominais)." />

      {provisional.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="warning" className="text-[10px]">Provisório</Badge>
          Anos com pautas por fechar: {provisional.join(", ")}.
        </p>
      )}

      {trends.insights.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-3">
          {trends.insights.map((i) => <InsightCard key={i.key} i={i} />)}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Precisa de pelo menos dois anos lectivos com dados para comparar.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <RatesChart t={trends} />
        <EnrolledChart t={trends} />
        {trends.finance && <MoneyChart t={trends} />}
        <MonthlyAttendance t={trends} />
      </div>

      <p className="text-xs text-muted-foreground">{trends.note}</p>
    </div>
  );
}
