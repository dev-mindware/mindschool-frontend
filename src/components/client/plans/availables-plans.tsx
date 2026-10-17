"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, GlobalModal, Icon, PlansPageSkeleton, RequestError, Switch } from "@/components";
import { useSubscription } from "@/hooks/school/use-subscription";
import type { ApiPlan } from "@/services/subscription-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { cn } from "@/lib/utils";
import { FEATURE_LABEL, QUOTA_ORDER, fmtQuota, kz } from "./plan-catalog";

const PAID = ["active", "past_due", "grace"];
const STATE_NOTICE: Record<string, string> = {
  trial: "Está no período de teste do plano Essencial.",
  expired: "A sua subscrição expirou: só é possível consultar dados. Escolha um plano para voltar a editar.",
  suspended: "A subscrição está suspensa: só é possível consultar dados. Regularize o pagamento para continuar.",
  cancelled: "A subscrição foi cancelada: só é possível consultar dados.",
  past_due: "Pagamento em atraso: renove para evitar limitações.",
  grace: "Período de tolerância: algumas funcionalidades já estão limitadas. Renove a subscrição.",
};

interface PlanStructureMeta {
  category: string;
  icon: string;
  description: string;
  features: string[];
}

const PLAN_STRUCTURE_META: Record<string, PlanStructureMeta> = {
  essencial: {
    category: "Básico",
    icon: "FileText",
    description: "Ideal para escolas em fase inicial ou de pequena dimensão.",
    features: [
      "Até 300 alunos matriculados",
      "Até 20 turmas e 30 professores",
      "Até 15 utilizadores internos",
      "Portal do Aluno e Encarregado",
      "5 GB de armazenamento em nuvem",
      "Gestão académica e administrativa",
      "Facturação e propinas da escola",
      "Suporte técnico padrão MindSchool",
    ],
  },
  profissional: {
    category: "Equipa",
    icon: "Layers",
    description: "Melhor para colégios e institutos em crescimento.",
    features: [
      "Tudo incluído no Essencial",
      "Até 1.500 alunos matriculados",
      "Até 100 turmas e 150 professores",
      "Até 50 utilizadores internos",
      "Gestão de Salas e Conflitos",
      "Aulas, Substituições e Sumários",
      "Assiduidade Docente com QR Code",
      "Alerta Preditivo de Risco de Abandono",
      "Dashboard Avançado e Relatórios",
      "25 GB de armazenamento em nuvem",
    ],
  },
  enterprise: {
    category: "Institucional",
    icon: "Building2",
    description: "Para grandes complexos escolares e redes de ensino.",
    features: [
      "Tudo incluído no Profissional",
      "Alunos e turmas ilimitados",
      "Professores e utilizadores ilimitados",
      "50 GB de armazenamento em nuvem",
      "Multi-Escola e Gestão Centralizada",
      "Provas Online e Avaliação Digital",
      "Cobrança Automatizada por E-mail",
      "Gerador Automático de Horários com IA",
      "BI, Analytics e Acesso à API",
      "Suporte Dedicado com SLA Prioritário",
    ],
  },
};

/** Modal com limites MED e funcionalidades técnicas completas */
function PlanDetailsModal({ plan, onChoose }: { plan: ApiPlan | null; onChoose: (p: ApiPlan) => void }) {
  return (
    <GlobalModal
      id="plan-details"
      size="md"
      title={plan ? `Plano ${plan.name}` : "Plano"}
      description={plan ? `${kz(plan.monthly_price)} por mês` : undefined}
      footer={plan ? <Button onClick={() => onChoose(plan)}>Escolher {plan.name}</Button> : undefined}
    >
      {plan && (
        <div className="space-y-5 text-sm">
          <section>
            <h4 className="mb-2 font-semibold">Limites Contratuais</h4>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {QUOTA_ORDER.filter((k) => plan.limits[k]).map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <Icon name="Gauge" className="size-4 text-muted-foreground" />
                  {fmtQuota(k, plan.limits[k]!.limit)}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="mb-2 font-semibold">Funcionalidades</h4>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                Gestão académica e administrativa completa
              </li>
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {FEATURE_LABEL[f] ?? f}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </GlobalModal>
  );
}

/** Add-ons de auto-serviço */
function AddonsModal() {
  const { catalog } = useSubscription();
  return (
    <GlobalModal
      id="plan-addons"
      size="lg"
      title="Add-ons Disponíveis"
      description="Acrescente capacidade ao seu plano. Pode seleccioná-los no checkout ao subscrever ou renovar."
    >
      <div className="space-y-3">
        {(catalog?.addons ?? []).map((a) => (
          <div key={a.code} className="rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">{a.name}</p>
              <Badge variant="outline">+{kz(a.monthly_price)}/mês</Badge>
            </div>
            {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
          </div>
        ))}
        {(catalog?.addons ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Sem add-ons disponíveis de momento.</p>
        )}
      </div>
    </GlobalModal>
  );
}

export function AvailablePlans() {
  const router = useRouter();
  const { catalog, current, isLoading } = useSubscription();
  const { openModal, closeModal } = useModal();
  const [details, setDetails] = useState<ApiPlan | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  const sub = current?.subscription;
  const paid = sub ? PAID.includes(sub.status) : false;

  const choose = (plan: ApiPlan) => {
    closeModal("plan-details");
    router.push(`/plans/checkout?plan=${plan.code}&period=${isYearly ? 12 : 1}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <div className="mb-10 text-center" data-tour="plans-header">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Escolha o plano da sua escola
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Preço transparente e previsível. Sem taxas ocultas nem fidelizações.
        </p>

        {/* Alternador Mensal / Anual */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <span
            className={cn(
              "text-sm font-medium transition-colors cursor-pointer",
              !isYearly ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setIsYearly(false)}
          >
            Mensal
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            aria-label="Alternar entre ciclo mensal e anual"
          />
          <span
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer",
              isYearly ? "font-semibold text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setIsYearly(true)}
          >
            Anual
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              2 meses grátis
            </span>
          </span>
        </div>
      </div>

      {sub && STATE_NOTICE[sub.status] && (
        <div className="mx-auto mb-8 flex max-w-2xl items-start gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
          <Icon name="Info" className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>{STATE_NOTICE[sub.status]}</p>
        </div>
      )}

      {isLoading ? (
        <PlansPageSkeleton />
      ) : !catalog ? (
        <RequestError refetch={() => window.location.reload()} message="Não foi possível carregar os planos." />
      ) : (
        <>
          {/* Contentor estrutural dos 3 cartões */}
          <div
            className="grid grid-cols-1 items-stretch gap-6 rounded-3xl border border-border/60 bg-muted/20 p-4 sm:p-6 lg:grid-cols-3"
            data-tour="plans-grid"
          >
            {catalog.plans.map((plan, index) => {
              const popular = index === 1; // O plano do meio (Profissional)
              const isCurrent = sub?.plan.code === plan.code;
              const meta = PLAN_STRUCTURE_META[plan.code] ?? {
                category: plan.name,
                icon: "Check",
                description: `Plano ${plan.name} para a sua escola.`,
                features: plan.features.map((f) => FEATURE_LABEL[f] ?? f),
              };

              // Preço calculado de acordo com o switch (Mensal vs Anual)
              const monthlyPriceNum = Number(plan.monthly_price);
              const annualPriceNum = monthlyPriceNum * 10; // 10 meses facturados em 12
              const displayPrice = isYearly ? kz(annualPriceNum) : kz(monthlyPriceNum);

              // Rótulo do botão
              let buttonLabel = `Escolher ${plan.name}`;
              if (isCurrent) {
                buttonLabel = paid ? "Renovar Plano" : sub?.status === "trial" ? "Subscrever Plano" : "Regularizar";
              } else if (paid) {
                buttonLabel = `Mudar para ${plan.name}`;
              }

              return (
                <Card
                  key={plan.code}
                  className={cn(
                    "relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-200 bg-card",
                    popular
                      ? "border-2 border-primary shadow-lg ring-1 ring-primary/20"
                      : "border border-border/80 shadow-xs"
                  )}
                >
                  <div>
                    {/* Linha Superior: Ícone + Categoria à esquerda | Badge Popular à direita */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Icon name={meta.icon} className="size-4 text-foreground" />
                        <span>{meta.category}</span>
                      </div>
                      {popular && (
                        <Badge variant="secondary" className="gap-1 font-semibold text-primary bg-primary/10 border-primary/20">
                          <Icon name="Sparkles" className="size-3 text-primary" />
                          Popular
                        </Badge>
                      )}
                      {!popular && isCurrent && (
                        <Badge variant={paid ? "default" : "secondary"} className="text-xs">
                          {paid ? "Plano actual" : "Em teste"}
                        </Badge>
                      )}
                    </div>

                    {/* Título do Plano */}
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
                      {plan.name}
                    </h2>

                    {/* Bloco de Preço */}
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        {displayPrice}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        / {isYearly ? "ano" : "mês"}
                      </span>
                    </div>
                    {isYearly && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Equivalente a {kz(Math.round(annualPriceNum / 12))}/mês (poupança de 2 meses)
                      </p>
                    )}

                    {/* Descrição Curta */}
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {meta.description}
                    </p>

                    {/* Botão de Acção (posicionado logo após a descrição) */}
                    <div className="mt-6">
                      <Button
                        size="lg"
                        className="w-full font-semibold"
                        variant={popular ? "default" : "outline"}
                        onClick={() => choose(plan)}
                      >
                        {buttonLabel}
                      </Button>
                    </div>

                    {/* Lista de Funcionalidades */}
                    <div className="mt-8">
                      <ul className="space-y-3.5">
                        {meta.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-3 text-sm text-foreground/90">
                            <Icon
                              name="CircleCheck"
                              className={cn(
                                "mt-0.5 size-4.5 shrink-0",
                                popular ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Rodapé: Garantia e link de detalhes técnicos */}
                  <div className="mt-8 border-t border-border/50 pt-6">
                    <div className="flex items-start gap-2.5">
                      <Icon
                        name="CircleCheck"
                        className="mt-0.5 size-4.5 shrink-0 text-emerald-600 dark:text-emerald-500"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          Garantia e Ativação Imediata
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Factura oficial com NIF. Sem compromisso de fidelização.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setDetails(plan);
                          openModal("plan-details");
                        }}
                      >
                        Ver todos os limites e detalhes
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Secção de Add-ons */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-muted-foreground"
            data-tour="plans-addons"
          >
            <span>Precisa de pacotes adicionais de alunos ou utilizadores?</span>
            <Button variant="link" size="sm" className="h-auto p-0 font-semibold" onClick={() => openModal("plan-addons")}>
              Consultar add-ons
            </Button>
          </div>
        </>
      )}

      <PlanDetailsModal plan={details} onChoose={choose} />
      <AddonsModal />
    </div>
  );
}
