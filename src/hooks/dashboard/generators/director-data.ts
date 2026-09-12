import {
  Role,
  RoleDashboardData,
  CyclePerformanceData,
  TeacherAttendanceKpi,
  DropoutRiskAlertItem,
  TuitionFinancialKpi,
  DashboardQuickAction,
} from "@/types";

export function buildDirectorData(
  role: Role,
  period: string,
  academicYear: string
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
      label: "I Ciclo do Ensino Secundário (7ª - 9ª)",
      totalStudents: 410,
      approvedCount: 338,
      appealCount: 42,
      failedCount: 30,
      approvalRate: 82.4,
    },
    {
      cycle: "CYCLE_2",
      label: "II Ciclo / Ensino Médio (10ª - 12ª/13ª)",
      totalStudents: 220,
      approvedCount: 187,
      appealCount: 21,
      failedCount: 12,
      approvalRate: 85.0,
    },
  ];

  const teacherAttendance: TeacherAttendanceKpi = {
    totalTeachers: 48,
    checkedInToday: 45,
    absentToday: 2,
    lateArrivals: 1,
    punctualityRate: 95.8,
    lastCheckInTime: "07:42",
  };

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
      recommendedAction: "Convocatória urgente do encarregado de educação",
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
      recommendedAction: "Plano de apoio pedagógico e reforço",
    },
    {
      id: "dr-3",
      studentName: "Lucas Varela Pedro",
      studentNumber: "MS-2025-0511",
      className: "11ª Classe - Ciências Físicas",
      cycle: "II Ciclo",
      riskScore: 65,
      riskLevel: "MEDIUM",
      unjustifiedAbsences: 8,
      failingSubjectsCount: 2,
      recommendedAction: "Acompanhamento da tutoria de turma",
    },
  ];

  const tuitionFinancial: TuitionFinancialKpi = {
    monthName: "Março 2026",
    expectedRevenueAoa: 31250000,
    collectedRevenueAoa: 27812500,
    collectionRatePercent: 89.0,
    overdueStudentsCount: 68,
    overdueTotalAoa: 3437500,
    certifiedInvoicesCount: 1182,
    monthlyEvolution: [
      { month: "Jan", expected: 31000000, collected: 29500000 },
      { month: "Fev", expected: 31200000, collected: 28900000 },
      { month: "Mar", expected: 31250000, collected: 27812500 },
    ],
  };

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-med",
      label: "Mapas Estatísticos MED",
      description: "Mapas I, II e III para inspeção",
      href: "/reports/med",
      icon: "FileSpreadsheet",
      variant: "terracotta",
    },
    {
      id: "qa-multi",
      label: "Rede Multi-Escola",
      description: "Visão integrada de campus",
      href: "/reports/multi-school",
      icon: "Building2",
    },
    {
      id: "qa-dropout",
      label: "Prevenção de Abandono",
      description: "Alertas precoces de evasão",
      href: "/dropout-risk",
      icon: "ShieldAlert",
      badge: "3 Críticos",
    },
    {
      id: "qa-teachers",
      label: "Assiduidade Docente",
      description: "Controlo biométrico e QR",
      href: "/teachers-attendance",
      icon: "QrCode",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Total de Alunos Matriculados",
        value: "1.250",
        description: "Ano Letivo " + academicYear,
        variation: 8.4,
        icon: "GraduationCap",
        trend: "up",
      },
      {
        title: "Taxa Global de Transição",
        value: "85.6%",
        description: "Conforme Decreto 424/25",
        variation: 3.2,
        icon: "TrendingUp",
        trend: "up",
      },
      {
        title: "Assiduidade Docente Hoje",
        value: "95.8%",
        description: "45 de 48 professores presentes",
        variation: 1.5,
        icon: "CircleCheck",
        trend: "up",
      },
      {
        title: "Risco Crítico de Abandono",
        value: "14 Alunos",
        description: "Necessitam de intervenção urgente",
        variation: -12.5,
        icon: "TriangleAlert",
        trend: "down",
      },
    ],
    quickActions,
    cyclePerformance,
    teacherAttendance,
    dropoutAlerts,
    tuitionFinancial,
  };
}
