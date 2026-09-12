import {
  Role,
  RoleDashboardData,
  TeacherAttendanceKpi,
  DashboardQuickAction,
} from "@/types";

export function buildTeacherData(
  role: Role,
  period: string,
  _academicYear: string
): RoleDashboardData {
  const teacherAttendance: TeacherAttendanceKpi = {
    totalTeachers: 48,
    checkedInToday: 45,
    absentToday: 2,
    lateArrivals: 1,
    punctualityRate: 100,
    myStatusToday: {
      hasCheckedIn: true,
      checkInTime: "07:35",
      plannedClassesToday: 4,
      completedClassesToday: 2,
    },
  };

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-qr",
      label: "Registar Ponto QR",
      description: "Validar presença com o telemóvel",
      href: "/teachers-attendance",
      icon: "QrCode",
      variant: "terracotta",
    },
    {
      id: "qa-grades",
      label: "Lançar Notas (MAC/CPP)",
      description: "Mini-pautas das minhas turmas",
      href: "/grades/entry",
      icon: "FilePenLine",
    },
    {
      id: "qa-new-exam",
      label: "Criar Prova Online",
      description: "Avaliação com correcção automática",
      href: "/online-exams",
      icon: "CirclePlus",
    },
    {
      id: "qa-pautas",
      label: "Consultar Pautas",
      description: "Pautas da minha coordenação",
      href: "/grades/pautas",
      icon: "BookOpen",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Minhas Turmas Atribuídas",
        value: "4 Turmas",
        description: "Matemática e Física",
        icon: "BookOpen",
      },
      {
        title: "Total de Alunos sob Tutoria",
        value: "142 Alunos",
        description: "9ª A, 9ª B, 10ª A e 11ª A",
        icon: "GraduationCap",
      },
      {
        title: "Ponto de Hoje (Check-in QR)",
        value: "Validado às 07:35",
        description: "2 de 4 tempos de aula concluídos",
        icon: "CircleCheck",
        trend: "up",
      },
      {
        title: "Questões por Corrigir",
        value: "18 Submissões",
        description: "Provas online dissertativas",
        variation: -35.0,
        icon: "PenLine",
        trend: "down",
      },
    ],
    quickActions,
    teacherAttendance,
  };
}
