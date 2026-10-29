"use client";

import { useCan } from "@/hooks/auth/use-can";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Cell, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, ChartContainer, ChartTooltip, ChartTooltipContent, Icon, type ChartConfig } from "@/components";
import { EVENT_TYPE_LABEL } from "@/services/calendar-service";
import { REQUEST_STATUS_LABEL, REQUEST_TYPE_LABEL } from "@/services/secretary-requests-service";
import { formatAxisCurrency, formatCurrency } from "@/utils/format-currency";
import { OverviewLegendRow } from "./overview-legend-row";
import { OverviewSectionCard } from "./overview-section-card";
import { BlockEmptyState } from "./block-empty-state";
import type { useSchoolOverview } from "@/hooks/dashboard/use-school-overview";
import { icons } from "lucide-react";

type Overview = ReturnType<typeof useSchoolOverview>;

const PALETTE = [
  "var(--primary)",
  "color-mix(in oklab, var(--primary) 78%, transparent)",
  "color-mix(in oklab, var(--primary) 58%, transparent)",
  "color-mix(in oklab, var(--primary) 42%, transparent)",
  "color-mix(in oklab, var(--primary) 28%, transparent)",
  "color-mix(in oklab, var(--primary) 18%, transparent)",
];

function ChartCard({ title, icon, description, children }: { title: string; icon: keyof typeof icons; description?: string; children: React.ReactNode }) {
  return (
    <Card className="flex h-full flex-col gap-0 py-4">
      <CardHeader className="px-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="flex size-8 items-center justify-center rounded-xs bg-primary/10 text-primary">
            <Icon name={icon} className="size-4" />
          </span>
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-2 sm:px-4">{children}</CardContent>
    </Card>
  );
}

/** Propinas cobradas por mês (ano civil). */
export function RevenueChart({ data }: { data: Overview["monthly"] }) {
  const config = { collected: { label: "Cobrado", color: "var(--primary)" } } satisfies ChartConfig;
  const empty = data.every((d) => d.collected === 0);
  return (
    <ChartCard title="Propinas cobradas" icon="ChartColumn" description="Total recebido por mês no ano civil">
      {empty ? (
        <BlockEmptyState
          icon="Coins"
          title="Sem receitas cobradas no período"
          description="Os pagamentos confirmados de propinas e serviços ao longo do ano civil serão registados aqui."
          actionLabel="Consultar faturação"
          actionHref="/tuition/invoices"
        />
      ) : (
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <BarChart data={data} margin={{ top: 14, right: 12, left: -4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={65} tickMargin={4} tickFormatter={(v: number) => formatAxisCurrency(v)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => <span className="font-medium tabular-nums">{formatCurrency(Number(value))}</span>} />} />
            <Bar dataKey="collected" fill="var(--color-collected)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

/** Alunos matriculados por classe. */
export function LevelDonut({ data }: { data: Overview["byLevel"] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const config = Object.fromEntries(data.map((d, i) => [d.name, { label: d.name, color: PALETTE[i % PALETTE.length] }])) satisfies ChartConfig;
  return (
    <ChartCard title="Alunos por classe" icon="ChartPie" description="Matrículas ativas">
      {total === 0 ? (
        <BlockEmptyState
          icon="GraduationCap"
          title="Sem turmas ou matrículas ativas"
          description="A distribuição de estudantes por classe e curso aparecerá quando houver alunos matriculados."
          actionLabel="Realizar matrículas"
          actionHref="/students/enrollments"
        />
      ) : (
        <>
          <ChartContainer config={config} className="mx-auto h-[190px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                {data.map((d, i) => <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />)}
                <Label content={({ viewBox }) => (viewBox && "cx" in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">{total}</tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">Alunos</tspan>
                  </text>
                ) : null)} />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-3 max-h-28 space-y-2 overflow-y-auto">
            {data.map((d, i) => <OverviewLegendRow key={d.name} dotClassName="" label={d.name} value={d.value} hint={`${Math.round((d.value / total) * 100)}%`} />).map((row, i) => <div key={i} style={{ ["--dot" as string]: PALETTE[i % PALETTE.length] }} className="[&_span.rounded-full]:bg-[var(--dot)]">{row}</div>)}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

/** Taxa de assiduidade por turma no período. */
export function AttendanceBars({ rows, rate }: { rows: Overview["attendanceBySection"]; rate: number | null }) {
  const config = { attendance_rate: { label: "Assiduidade (%)", color: "var(--primary)" } } satisfies ChartConfig;
  return (
    <ChartCard title="Assiduidade por turma" icon="CalendarCheck" description={rate !== null ? `Taxa global no período: ${rate}%` : "Presenças e atrasos sobre o total de registos"}>
      {rows.length === 0 ? (
        <BlockEmptyState
          icon="CalendarCheck"
          title="Sem faltas ou presenças registadas"
          description="Os sumários e chamadas das turmas alimentarão as médias de assiduidade."
          actionLabel="Registar assiduidade"
          actionHref="/academic/attendance"
        />
      ) : (
        <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
          <BarChart data={rows} margin={{ top: 14, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="section" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `${v}%`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => <span className="font-medium tabular-nums">{Number(value)}%</span>} />} />
            <Bar dataKey="attendance_rate" fill="var(--color-attendance_rate)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}

const Row = ({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) => (
  <li className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0"><div className="min-w-0">{children}</div>{right}</li>
);

export function RiskCard({ alerts }: { alerts: Overview["highRiskAlerts"] }) {
  return (
    <OverviewSectionCard title="Alunos em risco elevado" icon="TriangleAlert" href="/dropout-risk">
      {alerts.length === 0 ? (
        <BlockEmptyState
          icon="ShieldCheck"
          tone="success"
          title="Nenhum aluno em risco elevado"
          description="Excelente! Não há alertas de abandono escolar ou faltas excessivas em aberto."
          actionLabel="Ver análise preditiva"
          actionHref="/dropout-risk"
        />
      ) : (
        <ul>{alerts.map((a) => (
          <Row key={a.id} right={<Badge variant="destructive">{a.compositeRiskScore}</Badge>}>
            <p className="truncate font-medium">{a.studentName}</p><p className="truncate text-xs text-muted-foreground">{a.className}</p>
          </Row>
        ))}</ul>
      )}
    </OverviewSectionCard>
  );
}

export function RequestsCard({ requests }: { requests: Overview["openRequests"] }) {
  return (
    <OverviewSectionCard title="Pedidos à secretaria" icon="Inbox" href="/certificates/requests">
      {requests.length === 0 ? (
        <BlockEmptyState
          icon="CircleCheck"
          tone="success"
          title="Sem pedidos pendentes"
          description="Todos os pedidos de certificados e declarações foram tratados."
          actionLabel="Abrir secretaria"
          actionHref="/certificates/requests"
        />
      ) : (
        <ul>{requests.map((r) => (
          <Row key={r.id} right={<Badge variant="outline">{REQUEST_STATUS_LABEL[r.status] ?? r.status}</Badge>}>
            <p className="truncate font-medium">{REQUEST_TYPE_LABEL[r.type] ?? r.subject}</p><p className="truncate text-xs text-muted-foreground"><span className="font-mono">{r.protocol}</span>{r.subject ? ` · ${r.subject}` : ""}</p>
          </Row>
        ))}</ul>
      )}
    </OverviewSectionCard>
  );
}

export function EventsCard({ events }: { events: Overview["upcoming"] }) {
  return (
    <OverviewSectionCard title="Próximos eventos" icon="CalendarDays" href="/academic/calendar">
      {events.length === 0 ? (
        <BlockEmptyState
          icon="Calendar"
          title="Sem eventos agendados"
          description="Não existem provas, reuniões ou feriados agendados para os próximos dias."
          actionLabel="Abrir calendário escolar"
          actionHref="/academic/calendar"
        />
      ) : (
        <ul>{events.map((e) => (
          <Row key={e.id} right={<span className="font-mono text-xs text-muted-foreground">{e.start_date.slice(5)}</span>}>
            <p className="truncate font-medium">{e.title}</p><p className="truncate text-xs text-muted-foreground">{EVENT_TYPE_LABEL[e.type] ?? e.type}</p>
          </Row>
        ))}</ul>
      )}
    </OverviewSectionCard>
  );
}

/** `collections`: o plano inclui a cobrança por e-mail; sem ela, as ligações vão para as faturas. */
export function DebtorsCard({ debtors, collections }: { debtors: Overview["topDebtors"]; collections: boolean }) {
  const href = collections ? "/tuition/collections" : "/tuition/invoices";
  return (
    <OverviewSectionCard title="Maiores dívidas em atraso" icon="Wallet" href={href}>
      {debtors.length === 0 ? (
        <BlockEmptyState
          icon="BadgePercent"
          tone="success"
          title="Cobranças em dia"
          description="Não foram detectadas propinas em atraso ou alunos inadimplentes."
          actionLabel={collections ? "Consultar cobranças" : "Consultar faturas"}
          actionHref={href}
        />
      ) : (
        <ul>{debtors.map((d) => (
          <Row key={d.student} right={<span className="font-medium tabular-nums">{formatCurrency(Number(d.balance))}</span>}>
            <p className="truncate font-medium">{d.student}</p><p className="text-xs text-muted-foreground">{d.invoices} fatura(s) · {d.days_overdue} dias</p>
          </Row>
        ))}</ul>
      )}
    </OverviewSectionCard>
  );
}

export function LessonsCard({ lessons }: { lessons: Overview["todaysLessons"] }) {
  return (
    <OverviewSectionCard title="As minhas aulas de hoje" icon="BookOpen" href="/academic/lessons">
      {lessons.length === 0 ? (
        <BlockEmptyState
          icon="BookCheck"
          title="Sem aulas para hoje"
          description="Não constam aulas atribuídas no horário publicado para o dia de hoje."
          actionLabel="Consultar horário semanal"
          actionHref="/academic/lessons"
        />
      ) : (
        <ul>{[...lessons].sort((a, b) => a.start.localeCompare(b.start)).map((l, i) => (
          <Row key={l.id ?? i} right={<span className="font-mono text-xs text-muted-foreground">{l.start}–{l.end}</span>}>
            <p className="truncate font-medium">{l.subject.name}</p><p className="truncate text-xs text-muted-foreground">{l.section?.name ?? ""}{l.room ? ` · sala ${l.room.code}` : ""}</p>
          </Row>
        ))}</ul>
      )}
    </OverviewSectionCard>
  );
}

export function QuickLinks({ items }: { items: Array<{ label: string; href: string; icon: keyof typeof icons; permission?: string }> }) {
  const { can } = useCan();
  const visible = items.filter((i) => !i.permission || can(i.permission));
  if (visible.length === 0) return null;
  return (
    <OverviewSectionCard title="Acesso rápido" icon="Zap">
      <div className="grid grid-cols-2 gap-2">
        {visible.map((i) => (
          <Link key={i.href} href={i.href} className="flex items-center gap-2 rounded-xs border p-3 text-sm font-medium transition-colors hover:bg-muted/50">
            <Icon name={i.icon} className="size-4 text-primary" />{i.label}
          </Link>
        ))}
      </div>
    </OverviewSectionCard>
  );
}

/** Cobrado vs em atraso no período (indicadores monetários que não cabem nos 4 cartões). */
export function CashDonut({ collected, overdue }: { collected: number; overdue: number }) {
  const data = [{ name: "Cobrado", value: collected, fill: "var(--primary)" }, { name: "Em atraso", value: overdue, fill: "var(--destructive)" }];
  const total = collected + overdue;
  const config = { Cobrado: { label: "Cobrado", color: "var(--primary)" }, "Em atraso": { label: "Em atraso", color: "var(--destructive)" } } satisfies ChartConfig;
  return (
    <ChartCard title="Cobrado vs em atraso" icon="ChartPie" description="Peso das propinas em atraso">
      {total === 0 ? (
        <BlockEmptyState
          icon="Coins"
          title="Sem movimentos financeiros"
          description="O rácio entre cobranças e valores em dívida será apresentado aqui."
        />
      ) : (
        <>
          <ChartContainer config={config} className="mx-auto h-[190px] w-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(v) => formatCurrency(Number(v))} />} />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
                {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-3 space-y-2">
            {data.map((d) => <li key={d.name} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: d.fill }} />{d.name}</span><span className="font-medium">{formatCurrency(d.value)}</span></li>)}
          </ul>
        </>
      )}
    </ChartCard>
  );
}

/** Indicadores de contagem adicionais em barras horizontais. */
export function IndicatorsBars({ items }: { items: Array<{ name: string; value: number }> }) {
  const config = { value: { label: "Total", color: "var(--primary)" } } satisfies ChartConfig;
  return (
    <ChartCard title="Outros indicadores" icon="ChartBar" description="Pendências e carga atual">
      {items.length === 0 ? (
        <BlockEmptyState
          icon="ChartBar"
          title="Sem pendências adicionais"
          description="Não existem tarefas ou alertas pendentes a requerer intervenção."
        />
      ) : (
        <ChartContainer config={config} className="aspect-auto h-[220px] w-full">
          <BarChart data={items} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" fill="var(--primary)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}
