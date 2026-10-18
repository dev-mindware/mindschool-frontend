"use client";

import { Badge, PageWrapper, TitleList } from "@/components";
import { useAuth } from "@/hooks/auth/use-auth";
import { ROLE_LABELS } from "@/constants/roles";
import { useSchoolSettingsStore } from "@/stores/school";
import { DashboardOverview, OverviewPeriodSelect } from "./overview";

const SUBTITLE: Record<string, string> = {
  DIRECTOR_GENERAL: "Visão executiva da escola: alunos, assiduidade e propinas",
  OWNER: "Desempenho institucional consolidado",
  ADMIN: "Visão executiva da escola",
  MANAGER: "Visão executiva da escola",
  SYSTEM_ADMIN: "Plataforma: receita, subscrições das escolas e filas",
  PEDAGOGIC_DIRECTOR: "Matrículas, assiduidade, avaliação e risco de abandono",
  SECRETARY: "Atendimento, matrículas e pedidos pendentes",
  FINANCIAL: "Propinas cobradas, dívidas em atraso e devedores",
  TEACHER: "As suas aulas de hoje, turmas e tarefas pedagógicas",
  MED_AUDITOR: "Mapas oficiais do MED: estado, protocolos e pendências",
  GUARDIAN: "Acompanhamento dos seus educandos",
  STUDENT: "O seu percurso escolar",
};

export function DashboardPageContent() {
  const { user } = useAuth();
  const { profile } = useSchoolSettingsStore();
  const role = user?.role ?? "DIRECTOR_GENERAL";

  return (
    <PageWrapper routeLabel="Dashboard" subRoute={ROLE_LABELS[role] ?? role} onboardingTourId="dashboard">
      <div data-tour="dashboard-header">
        <TitleList title="Visão Geral" suTitle={SUBTITLE[role] ?? "Resumo da escola"}>
          <div className="flex flex-wrap items-center gap-2">
            {profile.schoolName && <Badge variant="outline" className="hidden sm:inline-flex text-xs font-semibold">{profile.schoolName}</Badge>}
            {/* o período só faz sentido nos painéis da escola; professor, auditor MED, admin e família têm painéis próprios */}
            {!["TEACHER", "MED_AUDITOR", "SYSTEM_ADMIN", "GUARDIAN", "STUDENT"].includes(role) && <div data-tour="dashboard-period"><OverviewPeriodSelect /></div>}
          </div>
        </TitleList>
      </div>

      <div className="mt-6">
        <DashboardOverview />
      </div>
    </PageWrapper>
  );
}
