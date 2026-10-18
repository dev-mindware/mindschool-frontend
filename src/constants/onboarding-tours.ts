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
  owner: ["OWNER"],
  ownerManager: ["OWNER", "MANAGER"],
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
    roles: TOUR_ROLES.ownerManager,
    minPlan: "essencial",
    steps: [
      tourStep(
        "setup-layout",
        "Definições da conta",
        "Prepare empresa, fiscalidade e operação antes de emitir documentos.",
        { side: "bottom" },
      ),
      tourStep(
        "setup-general-tabs",
        "Área geral",
        "Aceda a perfil, segurança, aparência, subscrição e preferências dos guias.",
        { side: "right" },
      ),
      tourStep(
        "setup-company-profile",
        "Perfil da empresa",
        "Confirme nome, contacto, endereço e NIF usados nos documentos.",
        { side: "left" },
      ),
      tourStep(
        "setup-tab-appearance",
        "Aparência",
        "Personalize a experiência visual quando o plano permitir.",
        { side: "right" },
      ),
      tourStep(
        "setup-tab-subscription",
        "Subscrição",
        "Reveja plano, limites e estado de pagamento da empresa.",
        { side: "right" },
      ),
      tourStep(
        "setup-workplace-tabs",
        "Ambiente de trabalho",
        "Configure colaboradores, categorias, lojas, bancos e dados fiscais.",
        { side: "right" },
      ),
      tourStep(
        "setup-tab-collaborators",
        "Colaboradores",
        "Gira acessos da equipa sem misturar perfis operacionais.",
        { side: "right" },
      ),
      tourStep(
        "setup-tab-categories",
        "Categorias",
        "Organize produtos, serviços e documentos por categorias.",
        { side: "right" },
      ),
      tourStep(
        "setup-tab-entities",
        "Lojas",
        "Configure lojas quando o plano tiver suporte multi-loja.",
        { side: "right" },
      ),
      tourStep(
        "setup-banks-content",
        "Bancos",
        "Cadastre bancos usados em documentos, recibos e controlo financeiro.",
        { side: "left" },
      ),
      tourStep(
        "setup-agt-content",
        "Dados fiscais",
        "Reveja séries, validações e configurações ligadas à integração fiscal.",
        { side: "left" },
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
        "Comece por confirmar se está a consultar os dados globais da empresa ou apenas os dados da loja associada.",
        { side: "bottom" },
      ),
      tourStep(
        "dashboard-summary",
        "Indicadores principais",
        "Compare produtos vendidos, serviços prestados e valores facturados. Utilize as variações para identificar mudanças que exigem atenção.",
        { side: "bottom" },
      ),
      tourStep(
        "dashboard-revenue",
        "Evolução da facturação",
        "Observe a evolução por período para reconhecer crescimento, quebras e sazonalidade antes de consultar os detalhes.",
        { side: "top" },
      ),
      tourStep(
        "dashboard-distribution",
        "Distribuição das vendas",
        "Compare o peso de produtos e serviços na receita para perceber a composição do negócio.",
        { side: "left" },
      ),
      tourStep(
        "dashboard-recent-sales",
        "Vendas recentes",
        "Confirme os últimos movimentos, respectivos valores e estados para detectar rapidamente situações pendentes.",
        { side: "top" },
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
        "Compare planos, limites e funcionalidades para perceber qual se adapta melhor à empresa.",
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
