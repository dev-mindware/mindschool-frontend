"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/use-auth";
import { useEntitled } from "@/hooks/common/use-entitled";
import { useDashboardPeriod } from "@/hooks/reports/use-dashboard-overview";
import { useDropoutRisk } from "@/hooks/school/use-dropout-risk";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { academicService } from "@/services/academic-service";
import { calendarService } from "@/services/calendar-service";
import {
  dashboardService, type AttendanceSummaryRow, type DebtRow, type EnrollmentSituationRow, type ReceiptRow, type StudentsByStatusRow,
} from "@/services/dashboard-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { DashboardPeriodType, Role } from "@/types";

const MANAGEMENT: Role[] = ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "MANAGER", "SYSTEM_ADMIN", "PEDAGOGIC_DIRECTOR"];
const FINANCE: Role[] = [...MANAGEMENT.filter((r) => r !== "PEDAGOGIC_DIRECTOR"), "FINANCIAL"];

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Intervalo do período escolhido (mês / trimestre / ano civil) em datas AAAA-MM-DD. */
export function periodRange(period: DashboardPeriodType, now = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const from = period === "month" ? new Date(y, m, 1) : period === "quarter" ? new Date(y, Math.floor(m / 3) * 3, 1) : new Date(y, 0, 1);
  return { from: iso(new Date(from.getTime() - from.getTimezoneOffset() * 60_000)), to: iso(new Date(now.getTime() - now.getTimezoneOffset() * 60_000)) };
}

/** Uma consulta de relatório que nunca falha o dashboard: 403/erro => `null` (o bloco desaparece). */
function useReport<T>(key: string, code: string, filters: Record<string, unknown>, enabled: boolean) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["dash", key, schoolId, filters],
    queryFn: () => dashboardService.report<T>(code, filters).catch(() => null),
    enabled: enabled && Boolean(schoolId),
    staleTime: 60 * 1000,
    retry: false,
  });
}

const num = (v: string | number) => Number(v) || 0;

/**
 * Dados reais do dashboard (API): relatórios do catálogo, calendário, pedidos, risco de abandono e horário do professor.
 * Cada bloco só existe se o papel tiver acesso (a API recusa com 403 e o bloco fica `null`).
 */
export function useSchoolOverview() {
  const { user } = useAuth();
  const role = (user?.role ?? "DIRECTOR_GENERAL") as Role;
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { period, setPeriod } = useDashboardPeriod();
  const range = useMemo(() => periodRange(period), [period]);
  const yearStart = useMemo(() => periodRange("year").from, []);

  const academic = MANAGEMENT.includes(role) || role === "SECRETARY" || role === "MED_AUDITOR";
  const finance = FINANCE.includes(role);
  const staff = academic || finance;
  const teacher = role === "TEACHER";
  const onlyOnce = staff || teacher;

  const students = useReport<StudentsByStatusRow>("students", "academico.alunos.por_estado", {}, academic || finance);
  const enrollments = useReport<EnrollmentSituationRow>("enroll", "academico.matriculas.situacao", {}, academic);
  const attendance = useReport<AttendanceSummaryRow>("attendance", "assiduidade.alunos.resumo", { from: range.from, to: range.to }, MANAGEMENT.includes(role) || role === "SECRETARY");
  const absenceRisk = useReport<{ student: string }>("absence-risk", "assiduidade.alunos.risco_faltas", { from: range.from, to: range.to }, MANAGEMENT.includes(role));
  const noSection = useReport<{ student: string }>("no-section", "secretaria.alunos.sem_turma", {}, role === "SECRETARY" || MANAGEMENT.includes(role));
  const receipts = useReport<ReceiptRow>("receipts", "financeiro.recebimentos.periodo", { from: yearStart, to: range.to }, finance);
  const debts = useReport<DebtRow>("debts", "financeiro.dividas.aluno", { only_overdue: true }, finance);

  // O que o plano não inclui nem se pede à API (daria 402) nem se mostra.
  const hasRisk = useEntitled({ feature: "risk_alerts", minPlan: "profissional" });
  const hasCalendar = useEntitled({ feature: "calendar_general", minPlan: "profissional" });
  const hasCollections = useEntitled({ feature: "email_collections", minPlan: "enterprise" });

  // Só os papéis com visão da escola carregam alertas e pedidos (família e outros recebem 403).
  const risk = useDropoutRisk((staff || teacher) && hasRisk);
  const requests = useSecretaryRequests(false, staff || teacher);
  const year = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: Boolean(schoolId) && onlyOnce, staleTime: 5 * 60 * 1000 });
  const events = useQuery({ queryKey: ["dash-events", schoolId, year.data?.id], queryFn: () => calendarService.events(year.data!.id).catch(() => []), enabled: Boolean(year.data?.id) && hasCalendar, staleTime: 60 * 1000, retry: false });
  const myTimetable = useQuery({ queryKey: ["dash-my-timetable", schoolId], queryFn: () => dashboardService.myTimetable().catch(() => []), enabled: Boolean(schoolId) && teacher, staleTime: 60 * 1000, retry: false });

  const studentsTotal = (students.data ?? []).reduce((a, r) => a + r.total, 0);
  const studentsActive = (students.data ?? []).find((r) => r.status === "activo")?.total ?? 0;
  const enrolled = (enrollments.data ?? []).filter((r) => ["matriculado", "activo"].includes(r.status)).reduce((a, r) => a + r.total, 0);

  const att = attendance.data ?? [];
  const attTotals = att.reduce((a, r) => ({ ok: a.ok + r.present + r.late, all: a.all + r.present + r.late + r.justified + r.unjustified }), { ok: 0, all: 0 });
  const attendanceRate = attTotals.all > 0 ? Math.round((attTotals.ok / attTotals.all) * 1000) / 10 : null;

  const monthly = useMemo(() => {
    const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const acc = new Map<number, number>();
    for (const r of receipts.data ?? []) acc.set(Number(r.date.slice(5, 7)) - 1, (acc.get(Number(r.date.slice(5, 7)) - 1) ?? 0) + num(r.total));
    const last = new Date().getMonth();
    return Array.from({ length: last + 1 }, (_, i) => ({ month: names[i]!, collected: acc.get(i) ?? 0 }));
  }, [receipts.data]);
  const collectedPeriod = (receipts.data ?? []).filter((r) => r.date >= range.from && r.date <= range.to).reduce((a, r) => a + num(r.total), 0);
  const overdueTotal = (debts.data ?? []).reduce((a, r) => a + num(r.balance), 0);

  const byLevel = useMemo(() => {
    const acc = new Map<string, number>();
    for (const r of (enrollments.data ?? []).filter((x) => ["matriculado", "activo"].includes(x.status))) acc.set(r.class_level, (acc.get(r.class_level) ?? 0) + r.total);
    return [...acc.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name, "pt", { numeric: true }));
  }, [enrollments.data]);

  const today = new Date();
  const todayIso = iso(new Date(today.getTime() - today.getTimezoneOffset() * 60_000));
  const upcoming = (events.data ?? []).filter((e) => e.status !== "cancelado" && e.end_date >= todayIso).sort((a, b) => a.start_date.localeCompare(b.start_date)).slice(0, 6);
  const weekday = ((today.getDay() + 6) % 7) + 1;
  const todaysLessons = (myTimetable.data ?? []).find((d) => d.weekday === weekday)?.entries ?? [];

  const openRequests = requests.requests.filter((r) => r.status === "aberto" || r.status === "em_analise");
  const highRisk = risk.alerts.filter((a) => a.riskLevel === "HIGH" && a.status !== "RESOLVED" && a.status !== "DROPPED_OUT");

  const isLoading = [students, enrollments, attendance, receipts, debts].some((q) => q.isLoading);

  return {
    role, period, setPeriod, range, isLoading,
    scope: { risk: hasRisk, calendar: hasCalendar, collections: hasCollections, academic, finance, teacher, staff, attendance: attendance.data !== null && attendance.data !== undefined, receipts: receipts.data !== null && receipts.data !== undefined, debts: debts.data !== null && debts.data !== undefined, students: students.data !== null && students.data !== undefined },
    kpis: { studentsTotal, studentsActive, enrolled, attendanceRate, absenceRiskCount: absenceRisk.data?.length ?? 0, noSectionCount: noSection.data?.length ?? 0, collectedPeriod, overdueTotal, debtors: debts.data?.length ?? 0, openRequests: openRequests.length, highRisk: highRisk.length },
    monthly, byLevel, attendanceBySection: att, topDebtors: (debts.data ?? []).slice(0, 5),
    highRiskAlerts: highRisk.slice(0, 5), openRequests: openRequests.slice(0, 5), upcoming, todaysLessons,
    year: year.data, studentsByStatus: students.data ?? [],
  };
}
