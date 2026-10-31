import type { Alignment, DriveStep, Side } from "driver.js";
import type { PlanType, Role } from "@/types";

export type OnboardingTourId =
  | "setup"
  | "dashboard"
  | "plans";

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
