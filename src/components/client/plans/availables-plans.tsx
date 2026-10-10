"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle, GlobalModal, Icon, PlansPageSkeleton, RequestError } from "@/components";
import { useSubscription } from "@/hooks/school/use-subscription";
import type { ApiPlan } from "@/services/subscription-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { FEATURE_LABEL, QUOTA_ORDER, fmtQuota, kz, planHighlights } from "./plan-catalog";

const PAID = ["active", "past_due", "grace"];
const STATE_NOTICE: Record<string, string> = {
  trial: "Está no período de teste do plano Essencial.",
  expired: "A sua subscrição expirou: só é possível consultar dados. Escolha um plano para voltar a editar.",
  suspended: "A subscrição está suspensa: só é possível consultar dados. Regularize o pagamento para continuar.",
  cancelled: "A subscrição foi cancelada: só é possível consultar dados.",
  past_due: "Pagamento em atraso: renove para evitar limitações.",
  grace: "Período de tolerância: algumas funcionalidades já estão limitadas. Renove a subscrição.",
};

/** Modal com tudo o que o plano inclui (os cartões mostram só o essencial). */
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
            <h4 className="mb-2 font-semibold">Limites</h4>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {QUOTA_ORDER.filter((k) => plan.limits[k]).map((k) => (
                <li key={k} className="flex items-center gap-2"><Icon name="Gauge" className="size-4 text-muted-foreground" />{fmtQuota(k, plan.limits[k]!.limit)}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="mb-2 font-semibold">Funcionalidades</h4>
            {plan.features.length === 0 ? (
              <p className="text-muted-foreground">Gestão académica e administrativa completa. Funcionalidades extra disponíveis nos planos superiores.</p>
            ) : (
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Icon name="Check" className="mt-0.5 size-4 shrink-0 text-green-600" />{FEATURE_LABEL[f] ?? f}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </GlobalModal>
  );
}

/** Add-ons de auto-serviço: o que fazem e o que é preciso para funcionarem. */
function AddonsModal() {
  const { catalog } = useSubscription();
  return (
    <GlobalModal id="plan-addons" size="lg" title="Add-ons" description="Acrescentam capacidade ao seu plano. Escolhem-se no checkout, ao subscrever ou renovar.">
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
        {(catalog?.addons ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sem add-ons disponíveis de momento.</p>}
      </div>
    </GlobalModal>
  );
}

/** Planos (padrão MindGest, versão minimalista): cartões curtos; detalhes e add-ons em modais; o pedido segue para o checkout. */
export function AvailablePlans() {
  const router = useRouter();
  const { catalog, current, isLoading } = useSubscription();
  const { openModal, closeModal } = useModal();
  const [details, setDetails] = useState<ApiPlan | null>(null);
  const sub = current?.subscription;
  const paid = sub ? PAID.includes(sub.status) : false;

  const choose = (plan: ApiPlan) => {
    closeModal("plan-details");
    router.push(`/plans/checkout?plan=${plan.code}`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-16 text-center" data-tour="plans-header">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Escolha o plano da sua escola</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Preço mensal por escola. Pague por transferência e envie o comprovativo: o plano é activado após a validação.</p>
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" data-tour="plans-grid">
            {catalog.plans.map((plan, index) => {
              const popular = index === 1;
              const isCurrent = sub?.plan.code === plan.code;
              const label = isCurrent ? (paid ? "Renovar" : "Subscrever") : paid ? `Mudar para ${plan.name}` : `Escolher ${plan.name}`;
              return (
                <Card key={plan.code} className={`relative flex flex-col gap-6 rounded-lg py-8 shadow-lg transition-all duration-300 hover:shadow-xl ${popular ? "border-2 border-primary bg-primary/5 shadow-2xl lg:scale-105" : "border bg-card"}`}>
                  {popular && <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 shadow-lg"><Icon name="Star" className="mr-1 h-3 w-3" />Mais popular</Badge>}
                  <CardHeader className="px-8 text-center">
                    {isCurrent && <Badge variant={paid ? "default" : "secondary"} className="mx-auto mb-1 w-fit text-xs">{paid ? "Plano actual" : sub?.status === "trial" ? "Em teste" : "Plano anterior"}</Badge>}
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-4xl font-bold text-primary">{kz(plan.monthly_price)}<span className="text-sm font-normal text-muted-foreground"> /mês</span></p>
                  </CardHeader>
                  <CardContent className="flex-1 px-8">
                    <ul className="space-y-3">
                      {planHighlights(plan, catalog.plans[index - 1]).map((h) => (
                        <li key={h} className="flex items-start gap-3 text-base text-foreground"><Icon name="Check" className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />{h}</li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 px-8 pt-2">
                    <Button size="lg" className="w-full gap-2 font-semibold" variant={popular || isCurrent ? "default" : "outline"} onClick={() => choose(plan)}>{label}</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setDetails(plan); openModal("plan-details"); }}>Ver detalhes</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base text-muted-foreground" data-tour="plans-addons">
            <span>Precisa de mais capacidade ou canais de comunicação?</span>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => openModal("plan-addons")}>Ver add-ons</Button>
          </div>
        </>
      )}

      <PlanDetailsModal plan={details} onChoose={choose} />
      <AddonsModal />
    </div>
  );
}
