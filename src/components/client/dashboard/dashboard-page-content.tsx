"use client";

import { PageWrapper, TitleList, Badge } from "@/components";
import { useRoleDashboardData } from "@/hooks/dashboard";
import { ROLE_LABELS } from "@/constants/roles";
import { DashboardPeriodFilter } from "@/types";
import { DashboardRolePreviewSwitcher } from "./dashboard-role-preview-switcher";
import { DashboardRoleDispatcher } from "./dashboard-role-dispatcher";

/**
 * Descriptions and titles customized for each role
 */
const ROLE_HEADER_INFO: Record<string, { title: string; subtitle: string }> = {
  DIRECTOR_GENERAL: {
    title: "Painel Estratégico 360º",
    subtitle: "Visão executiva da escola, ciclos de ensino, abandono precoce e assiduidade docente",
  },
  SYSTEM_ADMIN: {
    title: "Painel de Administração do Sistema",
    subtitle: "Supervisão global, auditoria técnica e parâmetros institucionais",
  },
  OWNER: {
    title: "Painel da Direcção Geral & Mantenedora",
    subtitle: "Desempenho institucional consolidado e indicadores de transição",
  },
  PEDAGOGIC_DIRECTOR: {
    title: "Painel da Direcção Pedagógica",
    subtitle: "Supervisão de pautas trimestrais, deliberações de conselho e qualidade do ensino",
  },
  TEACHER: {
    title: "Painel do Docente & Sala de Aula",
    subtitle: "Minhas turmas, assiduidade diária QR Code e lançamento de notas",
  },
  SECRETARY: {
    title: "Painel da Secretaria Escolar",
    subtitle: "Fila de atendimento, emissão de certificados, candidaturas e matrículas",
  },
  FINANCIAL: {
    title: "Painel Financeiro & Tesouraria",
    subtitle: "Arrecadação de propinas em Kwanzas (Kz), inadimplência e faturação AGT",
  },
  CASHIER: {
    title: "Painel de Caixa & Liquidações",
    subtitle: "Recebimentos diários de propinas e emissão de recibos",
  },
  MED_AUDITOR: {
    title: "Painel de Conformidade e Auditoria MED",
    subtitle: "Fiscalização governamental, mapas estatísticos I/II/III e Decreto Presidencial 424/25",
  },
  GUARDIAN: {
    title: "Portal do Encarregado de Educação",
    subtitle: "Acompanhamento em tempo real das notas, faltas e propinas dos educandos",
  },
  STUDENT: {
    title: "Portal do Aluno",
    subtitle: "Meu aproveitamento escolar trimestral, calendário de provas e frequência",
  },
};

export function DashboardPageContent() {
  const {
    effectiveRole,
    selectedPeriod,
    academicYear,
    data,
    setSelectedPeriod,
  } = useRoleDashboardData();

  const headerInfo =
    ROLE_HEADER_INFO[effectiveRole] ?? ROLE_HEADER_INFO.DIRECTOR_GENERAL;

  return (
    <PageWrapper
      routeLabel="Dashboard"
      subRoute={ROLE_LABELS[effectiveRole] ?? effectiveRole}
      onboardingTourId="dashboard"
    >
      <div className="space-y-4">
        {/* Role Preview Switcher Bar */}
        <DashboardRolePreviewSwitcher />

        {/* Dynamic Header */}
        <div data-tour="dashboard-header">
          <TitleList
            title={headerInfo.title}
            suTitle={headerInfo.subtitle}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex text-xs font-semibold">
                Ano Lectivo {academicYear}
              </Badge>

              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(e.target.value as DashboardPeriodFilter)
                }
                className="h-8 px-2.5 py-0 text-xs rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                aria-label="Selecionar Trimestre do Dashboard"
              >
                <option value="1_TRIMESTRE">1º Trimestre</option>
                <option value="2_TRIMESTRE">2º Trimestre</option>
                <option value="3_TRIMESTRE">3º Trimestre</option>
                <option value="ANNUAL">Ano Lectivo Completo</option>
              </select>
            </div>
          </TitleList>
        </div>

        {/* Dynamic Role View Dispatcher */}
        <div className="pt-2">
          <DashboardRoleDispatcher role={effectiveRole} data={data} />
        </div>
      </div>
    </PageWrapper>
  );
}
