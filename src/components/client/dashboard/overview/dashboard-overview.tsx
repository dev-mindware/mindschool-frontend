"use client";

import { DashboardSkeleton, DynamicMetricCard, EmptyState } from "@/components";
import { FamilyDashboard } from "@/modules/family/components/family-dashboard";
import { MedAuditorDashboard } from "../med/med-auditor-dashboard";
import { PlatformDashboard } from "../platform/platform-dashboard";
import { TeacherDashboard } from "../teacher/teacher-dashboard";
import { useSchoolOverview } from "@/hooks/dashboard/use-school-overview";
import { formatCurrency } from "@/utils/format-currency";
import { AttendanceBars, CashDonut, DebtorsCard, EventsCard, IndicatorsBars, LessonsCard, LevelDonut, QuickLinks, RequestsCard, RevenueChart, RiskCard } from "./overview-blocks";
import { SchoolOnboardingBanner } from "./school-onboarding-banner";

const COMPARE: Record<string, string> = { month: "neste mês", quarter: "neste trimestre", year: "neste ano" };

type Card = Parameters<typeof DynamicMetricCard>[0] & { extra?: { name: string; value: number; money?: boolean } };

/**
 * Monta os 4 cartões principais de KPI com base no papel do utilizador,
 * garantindo sempre uma grelha balanceada e informativa, mesmo com valores a zero.
 */
function buildRoleCards(o: ReturnType<typeof useSchoolOverview>): Card[] {
  const { kpis, scope, role, period } = o;
  const cards: Card[] = [];

  if (role === "SECRETARY") {
    cards.push({
      title: kpis.studentsActive,
      subtitle: "Alunos activos",
      icon: "GraduationCap",
      description: kpis.studentsTotal > 0 ? `${kpis.studentsTotal} alunos registados` : "Nenhum aluno registado",
    });
    cards.push({
      title: kpis.enrolled,
      subtitle: "Matrículas activas",
      icon: "ClipboardCheck",
      description: kpis.noSectionCount > 0 ? `${kpis.noSectionCount} sem turma atribuída` : "Situação de enturmação regular",
    });
    cards.push({
      title: kpis.openRequests,
      subtitle: "Pedidos por tratar",
      icon: "Inbox",
      colors: kpis.openRequests > 0 ? "destructive" : "default",
      description: kpis.openRequests > 0 ? "Requerem análise da secretaria" : "Todos os pedidos tratados",
      extra: { name: "Pedidos por tratar", value: kpis.openRequests },
    });
    cards.push({
      title: kpis.noSectionCount,
      subtitle: "Alunos sem turma",
      icon: "Users",
      colors: kpis.noSectionCount > 0 ? "destructive" : "default",
      description: kpis.noSectionCount > 0 ? "Pendentes de enturmação" : "Todas as matrículas enturmadas",
    });
    return cards;
  }

  if (role === "FINANCIAL") {
    cards.push({
      title: formatCurrency(kpis.collectedPeriod),
      subtitle: "Cobrado",
      icon: "Coins",
      description: kpis.collectedPeriod > 0 ? `Pagamentos ${COMPARE[period]}` : `Sem receitas ${COMPARE[period]}`,
      extra: { name: "Cobrado", value: kpis.collectedPeriod, money: true },
    });
    cards.push({
      title: formatCurrency(kpis.overdueTotal),
      subtitle: "Propinas em atraso",
      icon: "TriangleAlert",
      colors: kpis.overdueTotal > 0 ? "destructive" : "default",
      description: `${kpis.debtors} aluno(s) devedor(es)`,
      extra: { name: "Em atraso", value: kpis.overdueTotal, money: true },
    });
    cards.push({
      title: kpis.debtors,
      subtitle: "Alunos devedores",
      icon: "Wallet",
      colors: kpis.debtors > 0 ? "destructive" : "default",
      description: kpis.debtors > 0 ? "Com mensalidades pendentes" : "Nenhum aluno em mora",
    });
    cards.push({
      title: kpis.studentsActive,
      subtitle: "Alunos activos",
      icon: "GraduationCap",
      description: `${kpis.studentsTotal} alunos registados`,
    });
    return cards;
  }

  if (role === "PEDAGOGIC_DIRECTOR") {
    cards.push({
      title: kpis.studentsActive,
      subtitle: "Alunos activos",
      icon: "GraduationCap",
      description: kpis.studentsTotal > 0 ? `${kpis.studentsTotal} alunos registados` : "Nenhum aluno registado",
    });
    cards.push({
      title: kpis.enrolled,
      subtitle: "Matrículas activas",
      icon: "ClipboardCheck",
      description: kpis.enrolled > 0 ? "Matrículas confirmadas" : "Sem matrículas activas",
      extra: { name: "Matrículas activas", value: kpis.enrolled },
    });
    cards.push({
      title: kpis.attendanceRate !== null ? `${kpis.attendanceRate}%` : "—",
      subtitle: "Assiduidade global",
      icon: "CalendarCheck",
      description: kpis.absenceRiskCount > 0 ? `${kpis.absenceRiskCount} com risco de faltas` : `Registos ${COMPARE[period]}`,
    });
    cards.push({
      title: kpis.highRisk,
      subtitle: "Risco de abandono",
      icon: "ShieldAlert",
      colors: kpis.highRisk > 0 ? "destructive" : "default",
      description: kpis.highRisk > 0 ? `${kpis.highRisk} alerta(s) elevados` : "Sem alertas críticos",
      extra: { name: "Risco de abandono", value: kpis.highRisk },
    });
    return cards;
  }

  // Visão executiva padrão (OWNER, DIRECTOR_GENERAL, ADMIN, MANAGER)
  cards.push({
    title: kpis.studentsActive,
    subtitle: "Alunos activos",
    icon: "GraduationCap",
    description: kpis.studentsTotal > 0 ? `${kpis.studentsTotal} alunos registados` : "Nenhum aluno registado ainda",
  });
  cards.push({
    title: kpis.enrolled,
    subtitle: "Matrículas activas",
    icon: "ClipboardCheck",
    description: kpis.enrolled > 0 ? (kpis.noSectionCount > 0 ? `${kpis.noSectionCount} sem turma` : "Todas com turma atribuída") : "Aguardando confirmações",
    extra: { name: "Matrículas activas", value: kpis.enrolled },
  });
  cards.push({
    title: formatCurrency(kpis.collectedPeriod),
    subtitle: "Cobrado",
    icon: "Coins",
    description: kpis.collectedPeriod > 0 ? `Receitas ${COMPARE[period]}` : `Sem receitas ${COMPARE[period]}`,
    extra: { name: "Cobrado", value: kpis.collectedPeriod, money: true },
  });
  cards.push({
    title: kpis.highRisk,
    subtitle: "Risco de abandono",
    icon: "ShieldAlert",
    colors: kpis.highRisk > 0 ? "destructive" : "default",
    description: kpis.highRisk > 0 ? `${kpis.highRisk} alerta(s) a exigir atenção` : "Sem alertas críticos em aberto",
    extra: { name: "Risco de abandono", value: kpis.highRisk },
  });

  return cards;
}

/**
 * Visão geral do dashboard (padrão MindGest): cartões de métricas, gráficos e cartões de secção.
 * Apresenta empty states elegantes e contextuais para todas as funções sem sensação de ecrã vazio ou bug.
 */
export function DashboardOverview() {
  const o = useSchoolOverview();
  const { kpis, scope } = o;

  // Cada papel tem o seu painel dedicado: família, professor, auditor MED e admin de sistema
  if (o.role === "GUARDIAN" || o.role === "STUDENT") return <FamilyDashboard />;
  if (o.role === "TEACHER") return <TeacherDashboard />;
  if (o.role === "MED_AUDITOR") return <MedAuditorDashboard />;
  if (o.role === "SYSTEM_ADMIN") return <PlatformDashboard />;

  if (o.isLoading) return <DashboardSkeleton />;

  if (!scope.staff && !scope.teacher) {
    return (
      <EmptyState
        icon="LayoutDashboard"
        title="Sem indicadores para o seu perfil"
        description="Use o menu lateral para aceder às áreas e funcionalidades disponíveis para o seu utilizador."
      />
    );
  }

  const cards = buildRoleCards(o);
  const isSchoolEmpty = kpis.studentsTotal === 0 && kpis.enrolled === 0 && kpis.collectedPeriod === 0;

  const extras = cards.slice(4).map((c) => c.extra).filter((e): e is NonNullable<Card["extra"]> => Boolean(e));
  const money = [...cards.slice(0, 8)].map((c) => c.extra).filter((e): e is NonNullable<Card["extra"]> => Boolean(e?.money));

  const links = scope.teacher
    ? [
        { label: "Lançar notas", href: "/grades/entry", permission: "grade:write", icon: "ClipboardCheck" as const },
        { label: "Assiduidade", href: "/academic/attendance", permission: "absence:read", icon: "CalendarCheck" as const },
        { label: "Aulas e sumários", href: "/academic/lessons", permission: "lesson:read", icon: "BookOpen" as const },
        { label: "Horários", href: "/academic/timetables", permission: "timetable:read", icon: "CalendarRange" as const },
      ]
    : [
        { label: "Alunos", href: "/students/list", permission: "student:read", icon: "GraduationCap" as const },
        { label: "Matrículas", href: "/students/enrollments", permission: "enrollment:read", icon: "ClipboardList" as const },
        { label: "Pautas", href: "/grades/pautas", permission: "pauta:read", icon: "FileCheck" as const },
        { label: "Propinas", href: "/tuition/invoices", permission: "invoice:read", icon: "Wallet" as const },
      ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 4 KPIs Sempre Garantidos e Balanceados */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4" data-tour="dashboard-summary">
        {cards.slice(0, 4).map(({ extra: _e, ...c }, i) => (
          <DynamicMetricCard key={i} {...c} />
        ))}
      </div>

      {/* Guia de início rápido se a escola for nova e sem movimentação */}
      {isSchoolEmpty && (
        <div data-tour="dashboard-onboarding">
          <SchoolOnboardingBanner />
        </div>
      )}

      {/* Gráficos de Receita e Distribuição */}
      {(!isSchoolEmpty || scope.receipts || o.byLevel.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2" data-tour="dashboard-revenue">
            {scope.receipts ? (
              <RevenueChart data={o.monthly} />
            ) : (
              <AttendanceBars rows={o.attendanceBySection} rate={kpis.attendanceRate} />
            )}
          </div>
          <div data-tour="dashboard-distribution">
            <LevelDonut data={o.byLevel} />
          </div>
        </div>
      )}

      {/* Indicadores Adicionais se existirem */}
      {(extras.length > 0 || money.length === 2) && (
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          {scope.receipts && scope.attendance ? (
            <div className="lg:col-span-2">
              <AttendanceBars rows={o.attendanceBySection} rate={kpis.attendanceRate} />
            </div>
          ) : (
            <div className="lg:col-span-2">
              <IndicatorsBars items={extras.filter((e) => !e.money)} />
            </div>
          )}
          {money.length === 2 ? (
            <CashDonut collected={money[0].value} overdue={money[1].value} />
          ) : (
            <IndicatorsBars items={extras.filter((e) => !e.money)} />
          )}
        </div>
      )}

      {/* Secções de Acompanhamento com Empty States Positivos e Humanizados */}
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
