import type { Alignment, DriveStep, Side } from "driver.js";
import type { PlanType, Role } from "@/types";

export type OnboardingTourId =
  | "setup"
  | "dashboard"
  | "plans"
  | "students"
  | "enrollments"
  | "grades"
  | "tuition";

export type OnboardingTourGroup =
  | "setup"
  | "core"
  | "operation"
  | "advanced"
  | "reporting";

export type OnboardingTourType =
  | "setup"
  | "core"
  | "advanced"
  | "reporting";

export type OnboardingTourMode = "normal" | "demo";

export type OnboardingTourDemo = never;

export type TourStepDefinition = {
  selector: string;
  title: string;
  description: string;
  side?: Side;
  align?: Alignment;
  demo?: OnboardingTourDemo;
};

export type TourDefinition = {
  id: OnboardingTourId;
  version: number;
  title: string;
  group: OnboardingTourGroup;
  type: OnboardingTourType;
  priority: number;
  roles: Role[];
  minPlan: PlanType;
  steps: TourStepDefinition[];
};

export type OnboardingDriveStep = DriveStep & {
  selector?: string;
  demo?: OnboardingTourDemo;
};

type TourConfig = Omit<TourDefinition, "id" | "version"> & { version?: number };
type StepOptions = Pick<TourStepDefinition, "side" | "align" | "demo">;

const TOUR_ROLES = {
  owner: ["OWNER", "DIRECTOR_GENERAL"],
  ownerManager: ["OWNER", "MANAGER", "DIRECTOR_GENERAL", "PEDAGOGIC_DIRECTOR", "SECRETARY", "FINANCIAL"],
  // quem configura a escola (definições)
  schoolManagement: ["OWNER", "MANAGER", "DIRECTOR_GENERAL"],
  schoolOffice: ["OWNER", "MANAGER", "DIRECTOR_GENERAL", "PEDAGOGIC_DIRECTOR", "SECRETARY"],
  grades: ["OWNER", "MANAGER", "DIRECTOR_GENERAL", "PEDAGOGIC_DIRECTOR", "TEACHER"],
  finance: ["OWNER", "MANAGER", "DIRECTOR_GENERAL", "SECRETARY", "FINANCIAL"],
} satisfies Record<string, Role[]>;

function dataTour(name: string) {
  return `[data-tour="${name}"]`;
}

function tourStep(
  selector: string,
  title: string,
  description: string,
  options: StepOptions = {},
): TourStepDefinition {
  return {
    selector: dataTour(selector),
    title,
    description,
    ...options,
  };
}

function defineTour(id: OnboardingTourId, config: TourConfig): TourDefinition {
  return {
    id,
    version: config.version ?? 1,
    ...config,
  };
}

export const onboardingTours: Record<OnboardingTourId, TourDefinition> = {
  setup: defineTour("setup", {
    title: "Configuração inicial",
    group: "setup",
    type: "setup",
    priority: 1,
    roles: TOUR_ROLES.schoolManagement,
    minPlan: "essencial",
    steps: [
      tourStep(
        "setup-layout",
        "Definições da escola",
        "Comece aqui: preencha os dados da instituição, crie o ano letivo e convide a equipa antes de matricular alunos.",
        { side: "bottom" },
      ),
      tourStep(
        "setup-general-tabs",
        "Área geral",
        "Aceda a perfil, segurança, aparência, subscrição e preferências dos guias.",
        { side: "right" },
      ),
      tourStep(
        "setup-workplace-tabs",
        "Ambiente de trabalho",
        "Instituição de Ensino (dados legais e logótipo), Corpo Docente, utilizadores e papéis, políticas da escola e integrações.",
        { side: "right" },
      ),
      tourStep(
        "setup-guides-content",
        "Guias orientados",
        "Defina se os guias devem aparecer automaticamente e reponha os guias já vistos.",
        { side: "left" },
      ),
    ],
  }),

  dashboard: defineTour("dashboard", {
    title: "Leitura do painel",
    group: "core",
    type: "core",
    priority: 2,
    roles: TOUR_ROLES.ownerManager,
    minPlan: "essencial",
    steps: [
      tourStep(
        "dashboard-header",
        "Visão operacional",
        "Comece por confirmar a escola e o período em análise: os números abaixo referem-se a eles.",
        { side: "bottom" },
      ),
      tourStep(
        "dashboard-summary",
        "Indicadores principais",
        "Alunos ativos, matrículas, propinas cobradas e risco de abandono num relance. Os alertas pedem atenção primeiro.",
        { side: "bottom" },
      ),
      tourStep(
        "dashboard-revenue",
        "Propinas cobradas",
        "A evolução mensal do que foi recebido ajuda a ver quebras e a antecipar a cobrança.",
        { side: "top" },
      ),
      tourStep(
        "dashboard-distribution",
        "Alunos por classe",
        "Veja como se distribuem as matrículas ativas pelas classes para planear turmas e professores.",
        { side: "left" },
      ),
    ],
  }),

  students: defineTour("students", {
    title: "Alunos",
    group: "operation",
    type: "core",
    priority: 3,
    roles: TOUR_ROLES.schoolOffice,
    minPlan: "essencial",
    steps: [
      tourStep("page-title", "Ficha dos alunos", "Cadastre alunos e consulte a ficha de cada um: dados pessoais, encarregados, documentos e percurso.", { side: "bottom" }),
      tourStep("page-summary", "Resumo", "Alunos registados, matriculados, pendentes e anulações deste ano letivo.", { side: "bottom" }),
      tourStep("alunos-filters", "Pesquisar e filtrar", "Procure por nome, n.º de processo ou BI e filtre por turma, classe ou estado.", { side: "bottom" }),
    ],
  }),

  enrollments: defineTour("enrollments", {
    title: "Matrículas",
    group: "operation",
    type: "core",
    priority: 4,
    roles: TOUR_ROLES.schoolOffice,
    minPlan: "essencial",
    steps: [
      tourStep("page-title", "Matrículas do ano", "Matricule alunos numa turma do ano letivo; a matrícula gera logo o plano de propinas da escola.", { side: "bottom" }),
      tourStep("page-summary", "Estado das matrículas", "Ativas, pendentes de confirmação, transferidas e anuladas.", { side: "bottom" }),
      tourStep("matriculas-filters", "Pesquisar e filtrar", "Filtre por turma, classe, estado ou data para encontrar uma matrícula.", { side: "bottom" }),
    ],
  }),

  grades: defineTour("grades", {
    title: "Lançamento de notas",
    group: "operation",
    type: "core",
    priority: 5,
    roles: TOUR_ROLES.grades,
    minPlan: "essencial",
    steps: [
      tourStep("page-title", "Notas do trimestre", "Lance MAC, NPP e NPT por turma e disciplina; a MT calcula-se sozinha com as regras do MED.", { side: "bottom" }),
      tourStep("page-summary", "Situação da disciplina", "Média, taxa de positivas, notas em falta e estado da pauta.", { side: "bottom" }),
      tourStep("notas-filters", "Escolher a pauta", "Escolha a turma, a disciplina e o trimestre. As notas ficam guardadas ao lançar; quem fecha a pauta é a Direção.", { side: "bottom" }),
    ],
  }),

  tuition: defineTour("tuition", {
    title: "Propinas",
    group: "operation",
    type: "core",
    priority: 6,
    roles: TOUR_ROLES.finance,
    minPlan: "essencial",
    steps: [
      tourStep("page-title", "Propinas e mensalidades", "Acompanhe as propinas geradas pelas matrículas e registe pagamentos.", { side: "bottom" }),
      tourStep("page-summary", "Cobrança", "Arrecadado, taxa de cobrança, mensalidades vencidas e previsão a receber.", { side: "bottom" }),
      tourStep("propinas-filters", "Pesquisar e filtrar", "Filtre por estado, mês, turma ou método. Seleccione as propinas de um aluno e use «Marcar como pago».", { side: "bottom" }),
    ],
  }),

  plans: defineTour("plans", {
    title: "Planos e subscrição",
    group: "setup",
    type: "setup",
    priority: 16,
    roles: TOUR_ROLES.owner,
    minPlan: "essencial",
    steps: [
      tourStep(
        "plans-header",
        "Escolha de plano",
        "Compare planos, limites e funcionalidades para perceber qual se adapta melhor à escola.",
        { side: "bottom" },
      ),
      tourStep(
        "plans-grid",
        "Cartões de planos",
        "Cada cartão mostra preço, benefícios e funcionalidades incluídas.",
        { side: "top" },
      ),
      tourStep(
        "plans-addons",
        "Add-ons",
        "Capacidade e canais extra que se juntam ao plano no checkout, sem mudar de plano.",
        { side: "top" },
      ),
    ],
  }),
};

export function toDriveStep(step: TourStepDefinition): OnboardingDriveStep {
  return {
    element: step.selector,
    selector: step.selector,
    demo: step.demo,
    disableActiveInteraction: true,
    popover: {
      title: step.title,
      description: step.description,
      side: step.side,
      align: step.align,
    },
  };
}
