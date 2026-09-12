import {
  Role,
  RoleDashboardData,
  SecretaryQueueItem,
  DashboardQuickAction,
} from "@/types";

export function buildSecretaryData(
  role: Role,
  period: string,
  _academicYear: string
): RoleDashboardData {
  const secretaryQueue: SecretaryQueueItem[] = [
    {
      id: "sq-1",
      title: "Declaração com Notas para Fins de Emprego",
      requesterName: "Mateus Kuanza (Enc. Aluno Carlos Kuanza)",
      type: "DECLARATION",
      requestedAt: "Há 42 minutos",
      status: "PENDING",
      urgency: "URGENT",
    },
    {
      id: "sq-2",
      title: "Certificado de Conclusão do II Ciclo",
      requesterName: "Ana Paula Baptista (Ex-aluna)",
      type: "CERTIFICATE",
      requestedAt: "Há 2 horas",
      status: "PROCESSING",
      urgency: "HIGH",
    },
    {
      id: "sq-3",
      title: "Validação de Inscrição e Exame de Acesso",
      requesterName: "Candidato #4092 - João Manuel",
      type: "ADMISSION_VALIDATION",
      requestedAt: "Hoje, 09:15",
      status: "PENDING",
      urgency: "NORMAL",
    },
    {
      id: "sq-4",
      title: "Guia de Transferência Inter-Escolar",
      requesterName: "Beatriz Cassoma",
      type: "DECLARATION",
      requestedAt: "Ontem",
      status: "READY",
      urgency: "NORMAL",
    },
  ];

  const quickActions: DashboardQuickAction[] = [
    {
      id: "qa-matricula",
      label: "Nova Matrícula",
      description: "Registo e confirmação de vaga",
      href: "/students/enrollments",
      icon: "UserPlus",
      variant: "terracotta",
    },
    {
      id: "qa-certificados",
      label: "Emitir Certificado / Declaração",
      description: "Modelos oficiais com QR de autenticidade",
      href: "/certificates/declarations",
      icon: "Award",
      badge: "4 Solicitados",
    },
    {
      id: "qa-admissions",
      label: "Candidaturas & Exames",
      description: "Triagem e listas de chamada",
      href: "/students/admissions/exams",
      icon: "FileCheck2",
    },
    {
      id: "qa-students",
      label: "Gestão de Alunos",
      description: "Processos e ficheiros individuais",
      href: "/students/list",
      icon: "Users",
    },
  ];

  return {
    role,
    period: period as any,
    kpis: [
      {
        title: "Candidaturas por Validar",
        value: "26 Candidatos",
        description: "Fase de Exames de Acesso",
        variation: 14.0,
        icon: "FileQuestion",
        trend: "up",
      },
      {
        title: "Matrículas Pendentes",
        value: "15 Processos",
        description: "Aguardando documentação física",
        variation: -10.0,
        icon: "Clock",
        trend: "down",
      },
      {
        title: "Declarações Solicitadas",
        value: "8 Pedidos",
        description: "3 com prazo urgente",
        variation: 25.0,
        icon: "FileText",
        trend: "up",
      },
      {
        title: "Vagas Remanescentes",
        value: "42 Vagas",
        description: "Maior disponibilidade no I Ciclo",
        icon: "DoorOpen",
      },
    ],
    quickActions,
    secretaryQueue,
  };
}
