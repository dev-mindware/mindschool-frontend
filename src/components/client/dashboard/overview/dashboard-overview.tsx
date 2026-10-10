"use client";

import { DashboardSkeleton, DynamicMetricCard, EmptyState } from "@/components";
import { FamilyDashboard } from "@/modules/family/components/family-dashboard";
import { MedAuditorDashboard } from "../med/med-auditor-dashboard";
import { PlatformDashboard } from "../platform/platform-dashboard";
import { TeacherDashboard } from "../teacher/teacher-dashboard";
import { useSchoolOverview } from "@/hooks/dashboard/use-school-overview";
import { formatCurrency } from "@/utils/format-currency";
import { AttendanceBars, CashDonut, DebtorsCard, EventsCard, IndicatorsBars, LessonsCard, LevelDonut, QuickLinks, RequestsCard, RevenueChart, RiskCard } from "./overview-blocks";

const COMPARE: Record<string, string> = { month: "neste mês", quarter: "neste trimestre", year: "neste ano" };

/**
 * Visão geral do dashboard (padrão MindGest): cartões de métricas, gráficos e cartões de secção.
 * Os blocos dependem do papel e dos dados que a API permite ver; nada é simulado.
 */
export function DashboardOverview() {
  const o = useSchoolOverview();
  const { kpis, scope, period } = o;

  // Cada papel tem o seu painel: família, professor, auditor MED e admin de sistema; os restantes usam a visão da escola.
  if (o.role === "GUARDIAN" || o.role === "STUDENT") return <FamilyDashboard />;
  if (o.role === "TEACHER") return <TeacherDashboard />;
  if (o.role === "MED_AUDITOR") return <MedAuditorDashboard />;
  if (o.role === "SYSTEM_ADMIN") return <PlatformDashboard />;

  if (o.isLoading) return <DashboardSkeleton />;

  if (!scope.staff && !scope.teacher) {
    return <EmptyState icon="LayoutDashboard" title="Sem indicadores para o seu perfil" description="Use o menu lateral para aceder às áreas disponíveis." />;
  }

  type Card = Parameters<typeof DynamicMetricCard>[0] & { extra?: { name: string; value: number; money?: boolean } };
  const cards: Card[] = [];
  if (scope.students) cards.push({ title: kpis.studentsActive, subtitle: "Alunos activos", icon: "GraduationCap", description: `${kpis.studentsTotal} alunos registados` });
  if (scope.academic && kpis.enrolled > 0) cards.push({ title: kpis.enrolled, subtitle: "Matrículas activas", icon: "ClipboardCheck", description: kpis.noSectionCount > 0 ? `${kpis.noSectionCount} aluno(s) sem turma` : "Todos os alunos têm turma" , extra: { name: "Matrículas activas", value: kpis.enrolled } });
  if (scope.attendance) cards.push({ title: kpis.attendanceRate !== null ? `${kpis.attendanceRate}%` : "—", subtitle: "Assiduidade", icon: "CalendarCheck", description: kpis.absenceRiskCount > 0 ? `${kpis.absenceRiskCount} aluno(s) com muitas faltas` : `Registos ${COMPARE[period]}` });
  if (scope.receipts) cards.push({ title: formatCurrency(kpis.collectedPeriod), subtitle: "Cobrado", icon: "Coins", description: `Pagamentos ${COMPARE[period]}`, extra: { name: "Cobrado", value: kpis.collectedPeriod, money: true } });
  if (scope.debts) cards.push({ title: formatCurrency(kpis.overdueTotal), subtitle: "Propinas em atraso", icon: "TriangleAlert", colors: kpis.overdueTotal > 0 ? "destructive" : "default", description: `${kpis.debtors} aluno(s) devedor(es)`, extra: { name: "Em atraso", value: kpis.overdueTotal, money: true } });
  if (o.role === "SECRETARY") cards.push({ title: kpis.openRequests, subtitle: "Pedidos por tratar", icon: "Inbox", description: "Abertos ou em análise", extra: { name: "Pedidos por tratar", value: kpis.openRequests } });
  if (scope.teacher) cards.push({ title: o.todaysLessons.length, subtitle: "Aulas hoje", icon: "BookOpen", description: "Segundo o horário publicado", extra: { name: "Aulas hoje", value: o.todaysLessons.length } });
  if (scope.academic) cards.push({ title: kpis.highRisk, subtitle: "Risco de abandono", icon: "ShieldAlert", colors: kpis.highRisk > 0 ? "destructive" : "default", description: "Alertas elevados em aberto", extra: { name: "Risco de abandono", value: kpis.highRisk } });

  const extras = cards.slice(4).map((c) => c.extra).filter((e): e is NonNullable<Card["extra"]> => Boolean(e));
  const money = [...cards.slice(0, 8)].map((c) => c.extra).filter((e): e is NonNullable<Card["extra"]> => Boolean(e?.money));

  const links = scope.teacher
    ? [{ label: "Lançar notas", href: "/grades/entry", permission: "grade:write", icon: "ClipboardCheck" as const }, { label: "Assiduidade", href: "/academic/attendance", permission: "absence:read", icon: "CalendarCheck" as const }, { label: "Aulas e sumários", href: "/academic/lessons", permission: "lesson:read", icon: "BookOpen" as const }, { label: "Horários", href: "/academic/timetables", permission: "timetable:read", icon: "CalendarRange" as const }]
    : [{ label: "Alunos", href: "/students/list", permission: "student:read", icon: "GraduationCap" as const }, { label: "Matrículas", href: "/students/enrollments", permission: "enrollment:read", icon: "ClipboardList" as const }, { label: "Pautas", href: "/grades/pautas", permission: "pauta:read", icon: "FileCheck" as const }, { label: "Propinas", href: "/tuition/invoices", permission: "invoice:read", icon: "Wallet" as const }];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4" data-tour="dashboard-summary">
        {cards.slice(0, 4).map(({ extra: _e, ...c }, i) => <DynamicMetricCard key={i} {...c} />)}
      </div>

      {(scope.receipts || o.byLevel.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2" data-tour="dashboard-revenue">
            {scope.receipts ? <RevenueChart data={o.monthly} /> : <AttendanceBars rows={o.attendanceBySection} rate={kpis.attendanceRate} />}
          </div>
          <div data-tour="dashboard-distribution"><LevelDonut data={o.byLevel} /></div>
        </div>
      )}

      {(extras.length > 0 || money.length === 2) && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          {scope.receipts && scope.attendance ? <div className="lg:col-span-2"><AttendanceBars rows={o.attendanceBySection} rate={kpis.attendanceRate} /></div> : <div className="lg:col-span-2"><IndicatorsBars items={extras.filter((e) => !e.money)} /></div>}
          {money.length === 2 ? <CashDonut collected={money[0].value} overdue={money[1].value} /> : <IndicatorsBars items={extras.filter((e) => !e.money)} />}
        </div>
      )}
      {scope.receipts && scope.attendance && extras.some((e) => !e.money) && <IndicatorsBars items={extras.filter((e) => !e.money)} />}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {scope.teacher && <LessonsCard lessons={o.todaysLessons} />}
        {scope.academic && <RiskCard alerts={o.highRiskAlerts} />}
        {(o.role === "SECRETARY" || scope.academic) && <RequestsCard requests={o.openRequests} />}
        {scope.debts && <DebtorsCard debtors={o.topDebtors} />}
        <EventsCard events={o.upcoming} />
        <QuickLinks items={links} />
      </div>
    </div>
  );
}
