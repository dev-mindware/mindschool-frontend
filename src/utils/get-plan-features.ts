import {
  getPlanFeatureGroups,
} from "@/constants/plan-features";
import { Plan } from "@/types";

export function getPlanFeatures(plan: Plan): string[] {
  const { features } = getPlanFeatureGroups(plan.name);

  const planLimits = [
    plan.maxUsers > 0 ? `Até ${plan.maxUsers} utilizadores` : "Utilizadores ilimitados",
    plan.maxStores > 0 ? `Até ${plan.maxStores} loja(s)` : "Lojas ilimitadas",
  ];

  const baseBackendFeatures = [
    plan.features.hasInvoices && "Facturas e documentos ilimitados",
    plan.features.hasReporting && "Relatórios",
  ];

  const smartBackendFeatures = [
    plan.features.hasPrintFormats && "Impressão em A4 e Talão",
    plan.features.hasStock && "Gestão de stock",
    plan.features.hasPos && "Ponto de Venda",
    plan.features.hasAppearance && "Personalização de Aparência",
  ];

  const proBackendFeatures = [
    plan.features.hasSuppliers && "Gestão de Fornecedores",
  ];

  const dynamicFeatures = [
    ...planLimits,
    ...(plan.name === "Base" ? baseBackendFeatures : []),
    ...(plan.name === "Smart" ? smartBackendFeatures : []),
    ...(plan.name === "Pro" ? proBackendFeatures : []),
  ].filter((feature): feature is string => Boolean(feature));

  return [
    ...dynamicFeatures,
    ...features,
  ].filter((feature, index, list) => list.indexOf(feature) === index);
}
