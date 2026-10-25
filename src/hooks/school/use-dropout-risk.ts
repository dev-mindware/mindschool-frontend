"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { fetchAllPages } from "@/services/api-pagination";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { ActionType, AlertStatus, DropoutMetrics, DropoutRiskAlert, RiskLevel } from "@/types/dropout-risk";

interface ApiAlert {
  id: string;
  enrollment_id: string;
  student: { id: string; full_name: string };
  section: { id: string; name: string; class_level: string };
  risk_level: "baixo" | "moderado" | "elevado";
  risk_score: string;
  status: "aberto" | "em_acompanhamento" | "resolvido" | "aluno_abandonou";
  assigned_to: string | null;
  contributing_factors: Record<string, unknown> | null;
  generated_at: string;
}

const LEVEL: Record<ApiAlert["risk_level"], RiskLevel> = { baixo: "LOW", moderado: "MODERATE", elevado: "HIGH" };
const STATUS: Record<ApiAlert["status"], AlertStatus> = { aberto: "OPEN", em_acompanhamento: "IN_PROGRESS", resolvido: "RESOLVED", aluno_abandonou: "DROPPED_OUT" };
const STATUS_TO_API: Partial<Record<AlertStatus, "em_acompanhamento" | "resolvido" | "aluno_abandonou">> = {
  IN_PROGRESS: "em_acompanhamento",
  RESOLVED: "resolvido",
  DROPPED_OUT: "aluno_abandonou",
};

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

const toAlert = (a: ApiAlert): DropoutRiskAlert => {
  const f = (a.contributing_factors ?? {}) as Record<string, unknown>;
  return {
    id: a.id,
    studentId: a.student.id,
    studentName: a.student.full_name,
    studentNumber: "",
    classId: a.section.id,
    className: `${a.section.class_level} ${a.section.name}`,
    cycle: "I_CICLO",
    guardianName: "",
    guardianPhone: "",
    riskLevel: LEVEL[a.risk_level],
    compositeRiskScore: Math.round(Number(a.risk_score)),
    signals: {
      consecutiveAbsences: num(f["consecutive_absences"]),
      absencePercentage: num(f["absence_rate"]),
      gradeDropSubjects: [],
      currentAverage: num(f["average"]),
      failingSubjectsCount: num(f["failing_subjects"]),
      tuitionOverdueMonths: num(f["overdue_months"]),
    },
    status: STATUS[a.status],
    openedAt: a.generated_at,
    actionsHistory: [],
  };
};

/**
 * Alertas de abandono da escola ativa (API `risk-alerts`) com a forma do antigo `useDropoutRiskStore`.
 * Os filtros sao estado local; cada transicao exige a accao tomada (historico auditado na API).
 */
export function useDropoutRisk(enabled = true) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [filterRiskLevel, setRiskFilter] = useState<RiskLevel | "ALL">("ALL");
  const [filterStatus, setStatusFilter] = useState<AlertStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["risk-alerts", schoolId],
    queryFn: async () => (await fetchAllPages<ApiAlert>("/s/risk-alerts")).map(toAlert),
    enabled: Boolean(schoolId) && enabled,
    staleTime: 30 * 1000,
  });

  const act = useMutation({
    mutationFn: (v: { id: string; action: string; status?: AlertStatus }) =>
      api.post(`/s/risk-alerts/${v.id}/actions`, { action: v.action, ...(v.status && STATUS_TO_API[v.status] ? { status: STATUS_TO_API[v.status] } : {}) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["risk-alerts", schoolId] }),
  });

  const getMetrics = (): DropoutMetrics => {
    const count = (l: RiskLevel) => data.filter((a) => a.riskLevel === l).length;
    const resolved = data.filter((a) => a.status === "RESOLVED").length;
    const dropped = data.filter((a) => a.status === "DROPPED_OUT").length;
    return {
      totalMonitored: data.length,
      highRiskCount: count("HIGH"),
      moderateRiskCount: count("MODERATE"),
      lowRiskCount: count("LOW"),
      activeInterventionsCount: data.filter((a) => a.status === "IN_PROGRESS").length,
      resolvedCasesCount: resolved,
      retentionRatePercentage: resolved + dropped > 0 ? Math.round((resolved / (resolved + dropped)) * 100) : 100,
    };
  };

  const alerts = useMemo(() => data, [data]);

  return {
    alerts,
    isLoading,
    filterRiskLevel,
    filterStatus,
    searchQuery,
    setRiskFilter,
    setStatusFilter,
    setSearchQuery,
    addInterventionAction: (alertId: string, d: { actionType: ActionType; title: string; notes: string; recordedBy: string; nextFollowUpDate?: string; newStatus?: AlertStatus }) =>
      act.mutate({ id: alertId, action: `${d.title}: ${d.notes}`.slice(0, 1000), status: d.newStatus ?? "IN_PROGRESS" }),
    updateAlertStatus: (alertId: string, newStatus: AlertStatus, note?: string) =>
      act.mutate({ id: alertId, action: note && note.length >= 5 ? note : "Estado atualizado pela direção pedagógica", status: newStatus }),
    getMetrics,
  };
}
