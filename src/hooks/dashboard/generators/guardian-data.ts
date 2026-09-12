import {
  Role,
  RoleDashboardData,
  StudentDashboardSummary,
  DashboardQuickAction,
} from "@/types";

export function buildGuardianData(
  role: Role,
  period: string,
  academicYear: string
): RoleDashboardData {
  const studentSummary: StudentDashboardSummary = {
    studentName: "Carlos Daniel Kuanza",
    studentNumber: "MS-2025-0481",
    className: "9ª Classe A - Manhã",
    academicYear,
    generalAverage: 14.8,
    totalAbsences: 3,
    tuitionStatus: "REGULAR",
    grades: [
      {
        subjectName: "Língua Portuguesa",
        teacherName: "Prof. Manuel dos Santos",
        mac: 15.0,
        cpp: 14.0,
        ct: 14.5,
        absences: 1,
        status: "APROVADO",
      },
      {
        subjectName: "Matemática",
        teacherName: "Profª. Teresa Silva",
        mac: 16.5,
        cpp: 15.0,
        ct: 15.8,
        absences: 0,
        status: "APROVADO",
      },
      {
        subjectName: "Física",
        teacherName: "Prof. Alberto Silva",
        mac: 13.0,
        cpp: 12.0,
        ct: 12.5,
        absences: 1,
        status: "APROVADO",
      },
      {
        subjectName: "Química",
        teacherName: "Profª. Maria Afonso",
        mac: 14.0,
        cpp: 13.5,
        ct: 13.8,
        absences: 0,
        status: "APROVADO",
      },
      {
        subjectName: "História",
        teacherName: "Prof. Domingos Kiala",
        mac: 17.0,
        cpp: 16.0,
        ct: 16.5,
        absences: 1,
        status: "APROVADO",
      },
    ],
    upcomingExams: [
      {
        title: "Mini-Teste Online de Matemática",
        subject: "Matemática",
        date: "Sexta-feira, 10:00",
        type: "ONLINE",
      },
      {
        title: "Prova Presencial do Trimestre",
        subject: "Física",
        date: "24 de Março, 08:30",
        type: "PRESENTIAL",
      },
    ],
  };

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-boletim",
      label: "Boletim de Notas Trimestral",
      description: "Visualizar e descarregar PDF oficial",
      href: "/certificates/report-cards",
      icon: "FileText",
      variant: "terracotta",
    },
    {
      id: "qa-fazer-prova",
      label: "Realizar Prova Online",
      description: "Mini-teste de Matemática ativo",
      href: "/online-exams",
      icon: "Laptop",
      badge: "Disponível",
    },
    {
      id: "qa-declaracao",
      label: "Pedir Declaração Escolar",
      description: "Solicitar documento sem sair de casa",
      href: "/certificates/declarations",
      icon: "Award",
    },
    {
      id: "qa-tuition-pay",
      label: "Situação da Propina",
      description: "Março liquidado com sucesso",
      href: "/tuition/payments",
      icon: "CircleCheck",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Média Global do Trimestre",
        value: "14.8 / 20",
        description: "Aproveitamento Satisfatório",
        variation: 1.2,
        icon: "Award",
        trend: "up",
      },
      {
        title: "Faltas no Trimestre",
        value: "3 Faltas",
        description: "Todas justificadas pela escola",
        variation: -25.0,
        icon: "UserCheck",
        trend: "down",
      },
      {
        title: "Próxima Avaliação",
        value: "Sexta-feira",
        description: "Mini-Teste Online de Matemática",
        icon: "Calendar",
      },
      {
        title: "Propina do Mês (Março)",
        value: "Regularizada",
        description: "Recibo disponível para download",
        icon: "CircleCheck",
        trend: "up",
      },
    ],
    quickActions,
    studentSummary,
  };
}
