import {
  Role,
  RoleDashboardData,
  PautaStatusSummary,
  CyclePerformanceData,
  DropoutRiskAlertItem,
  DashboardQuickAction,
} from "@/types";

export function buildPedagogicData(
  role: Role,
  period: string,
  _academicYear: string
): RoleDashboardData {
  const pautaStatus: PautaStatusSummary = {
    totalClasses: 38,
    openPautas: 6,
    submittedPautas: 18,
    approvedPautas: 10,
    closedPautas: 4,
    closingProgressPercent: 68.4,
  };

  const cyclePerformance: CyclePerformanceData[] = [
    {
      cycle: "PRIMARY",
      label: "Ensino Primário",
      totalStudents: 620,
      approvedCount: 545,
      appealCount: 45,
      failedCount: 30,
      approvalRate: 87.9,
    },
    {
      cycle: "CYCLE_1",
      label: "I Ciclo Secundário",
      totalStudents: 410,
      approvedCount: 338,
      appealCount: 42,
      failedCount: 30,
      approvalRate: 82.4,
    },
    {
      cycle: "CYCLE_2",
      label: "II Ciclo / Médio",
      totalStudents: 220,
      approvedCount: 187,
      appealCount: 21,
      failedCount: 12,
      approvalRate: 85.0,
    },
  ];

  const dropoutAlerts: DropoutRiskAlertItem[] = [
    {
      id: "dr-1",
      studentName: "António Manuel Sebastião",
      studentNumber: "MS-2025-0142",
      className: "9ª Classe A",
      cycle: "I Ciclo",
      riskScore: 88,
      riskLevel: "CRITICAL",
      unjustifiedAbsences: 16,
      failingSubjectsCount: 4,
      recommendedAction: "Conselho de Turma Extraordinário",
    },
    {
      id: "dr-2",
      studentName: "Esperança Domingos Garcia",
      studentNumber: "MS-2025-0319",
      className: "8ª Classe B",
      cycle: "I Ciclo",
      riskScore: 74,
      riskLevel: "HIGH",
      unjustifiedAbsences: 11,
      failingSubjectsCount: 3,
      recommendedAction: "Recuperação contínua de Matemática",
    },
  ];

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-pautas",
      label: "Pautas Trimestrais",
      description: "Homologação e fecho oficial",
      href: "/grades/pautas",
      icon: "FileCheck",
      badge: "6 Pendentes",
      variant: "terracotta",
    },
    {
      id: "qa-transitions",
      label: "Conselho de Transição",
      description: "Deliberações Decreto 424/25",
      href: "/grades/transitions",
      icon: "Scale",
    },
    {
      id: "qa-online-exams",
      label: "Provas Online & Avaliações",
      description: "Simuladores e testes digitais",
      href: "/online-exams",
      icon: "Laptop",
    },
    {
      id: "qa-dropout",
      label: "Intervenção de Abandono",
      description: "Casos em risco crítico",
      href: "/dropout-risk",
      icon: "ShieldAlert",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Pautas Trimestrais em Aberto",
        value: "6 / 38",
        description: "Aguardando envio dos professores",
        variation: -25.0,
        icon: "FileClock",
        trend: "down",
      },
      {
        title: "Em Deliberação no Conselho",
        value: "28 Alunos",
        description: "Critérios de transição especial",
        variation: 5.0,
        icon: "Users",
        trend: "neutral",
      },
      {
        title: "Avaliações Online Ativas",
        value: "12 Provas",
        description: "4 em curso de realização",
        variation: 20.0,
        icon: "SquareCheck",
        trend: "up",
      },
      {
        title: "Casos de Alerta Pedagógico",
        value: "19 Alunos",
        description: "Notas < 10 em 3+ disciplinas",
        variation: -8.0,
        icon: "OctagonAlert",
        trend: "down",
      },
    ],
    quickActions,
    pautaStatus,
    cyclePerformance,
    dropoutAlerts,
  };
}
