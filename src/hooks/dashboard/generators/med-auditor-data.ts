import {
  Role,
  RoleDashboardData,
  CyclePerformanceData,
  DashboardQuickAction,
} from "@/types";

export function buildMedAuditorData(
  role: Role,
  period: string,
  _academicYear: string
): RoleDashboardData {
  const cyclePerformance: CyclePerformanceData[] = [
    {
      cycle: "PRIMARY",
      label: "Ensino Primário (1ª - 6ª)",
      totalStudents: 620,
      approvedCount: 545,
      appealCount: 45,
      failedCount: 30,
      approvalRate: 87.9,
    },
    {
      cycle: "CYCLE_1",
      label: "I Ciclo do Ensino Secundário",
      totalStudents: 410,
      approvedCount: 338,
      appealCount: 42,
      failedCount: 30,
      approvalRate: 82.4,
    },
    {
      cycle: "CYCLE_2",
      label: "II Ciclo / Ensino Médio",
      totalStudents: 220,
      approvedCount: 187,
      appealCount: 21,
      failedCount: 12,
      approvalRate: 85.0,
    },
  ];

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-med-export",
      label: "Descarregar Mapas Oficiais MED",
      description: "Formatos I, II e III do Ministério",
      href: "/reports/med",
      icon: "FileSpreadsheet",
      variant: "terracotta",
    },
    {
      id: "qa-inspect-pautas",
      label: "Inspecionar Pautas Oficiais",
      description: "Pautas com assinatura digital",
      href: "/grades/pautas",
      icon: "CheckCheck",
    },
    {
      id: "qa-decree",
      label: "Conformidade Decreto 424/25",
      description: "Regulamento Geral de Avaliação",
      href: "/grades/transitions",
      icon: "Scale",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Conformidade Decreto 424/25",
        value: "100% Homologado",
        description: "Fórmula de transição validada",
        icon: "Scale",
        trend: "up",
      },
      {
        title: "Pautas Homologadas pelo MED",
        value: "32 de 38",
        description: "84.2% das turmas homologadas",
        icon: "FileCheck",
        trend: "up",
      },
      {
        title: "Rácio Alunos / Professor",
        value: "26:1",
        description: "Padrão regulamentar respeitado",
        icon: "Users",
        trend: "neutral",
      },
      {
        title: "Distribuição por Género",
        value: "52% F | 48% M",
        description: "650 Meninas / 600 Meninos",
        icon: "ChartPie",
        trend: "neutral",
      },
    ],
    quickActions,
    cyclePerformance,
  };
}
