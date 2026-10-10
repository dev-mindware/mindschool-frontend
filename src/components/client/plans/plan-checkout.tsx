"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, Card, FileUpload, GlobalModal, Icon, PROOF_ACCEPT_PDF_PNG, RequestError } from "@/components";
import { useSubscription } from "@/hooks/school/use-subscription";
import { subscriptionService, type ApiQuote } from "@/services/subscription-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { PERIODS, kz } from "./plan-catalog";


function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-4 p-6 shadow-none">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{n}</span>
        {title}
      </h3>
      {children}
    </Card>
  );
}

/** Checkout da subscrição (padrão MindGest): ciclo, add-ons, instruções de pagamento, comprovativo e resumo. */
export function PlanCheckout() {
  const router = useRouter();
  const params = useSearchParams();
  const { catalog, current, isLoading, createOrder, submitProof } = useSubscription();
  const { openModal, closeModal } = useModal();
  const [months, setMonths] = useState<1 | 3 | 6 | 12>(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const plan = useMemo(() => catalog?.plans.find((p) => p.code === params.get("plan")) ?? null, [catalog, params]);
  const openOrder = current?.orders.find((o) => ["pending_payment", "payment_proof_submitted", "under_review", "proof_replacement_required"].includes(o.status));

  // O preço vem sempre do servidor: recalcula a cada mudança de plano, ciclo ou add-ons.
  const quoteQuery = useQuery({
    queryKey: ["subscription-quote", plan?.code, months, [...addons].sort().join(",")],
    queryFn: () => subscriptionService.quote({ plan_code: plan!.code, addon_codes: addons, period_months: months }),
    enabled: Boolean(plan),
    staleTime: 60_000,
    retry: false,
  });
  const preview: ApiQuote | null = quoteQuery.data ?? null;
  const quoteError = quoteQuery.error ? getApiErrorMessage(quoteQuery.error, "Não foi possível calcular o preço.") : null;
  if (isLoading) return <div className="mx-auto max-w-5xl animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-muted" /><div className="h-64 rounded-xl bg-muted" /></div>;
  if (!catalog) return <RequestError refetch={() => window.location.reload()} message="Não foi possível carregar os planos." />;
  if (!plan) {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <p className="text-muted-foreground">Escolha primeiro um plano.</p>
        <Button asChild><Link href="/plans">Ver planos</Link></Button>
      </div>
    );
  }


  const toggle = (code: string) => setAddons((c) => (c.includes(code) ? c.filter((x) => x !== code) : [...c, code]));

  async function submit() {
    if (!file || !plan) return;
    setBusy(true);
    try {
      const order = await createOrder.mutateAsync({ plan_code: plan.code, addon_codes: addons, period_months: months });
      await submitProof.mutateAsync({ orderId: order.id, file });
      openModal("subscription-created");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível concluir a subscrição."));
    } finally {
      setBusy(false);
    }
  }

  const available = catalog.addons.filter((a) => a.min_plan_rank === null || a.min_plan_rank <= plan.rank);
  const instructions = catalog.payment_instructions;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <Link href="/plans" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Icon name="ArrowLeft" className="size-4" />Planos</Link>
        <h1 className="text-2xl font-bold">Concluir subscrição</h1>
        <p className="text-muted-foreground">Plano {plan.name}. Pague por transferência e envie o comprovativo.</p>
      </div>

      {openOrder && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" />
          <p>Já tem uma ordem em curso. Conclua-a ou cancele-a em <Link href="/subscription" className="font-medium underline">Subscrição</Link> antes de criar outra.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Step n={1} title="Ciclo de facturação">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PERIODS.map((p) => (
                <button key={p.value} type="button" onClick={() => setMonths(p.value)} className={`rounded-lg border-2 p-3 text-left transition ${months === p.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}>
                  <p className="font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.hint}</p>
                </button>
              ))}
            </div>
          </Step>

          {available.length > 0 && (
            <Step n={2} title="Add-ons (opcional)">
              <div className="grid gap-2">
                {available.map((a) => (
                  <label key={a.code} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-muted/40">
                    <input type="checkbox" className="mt-1" checked={addons.includes(a.code)} onChange={() => toggle(a.code)} />
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="font-medium">{a.name}</span><Badge variant="outline">+{kz(a.monthly_price)}/mês</Badge></span>
                      {a.description && <span className="mt-0.5 block text-xs text-muted-foreground">{a.description}</span>}
                    </span>
                  </label>
                ))}
              </div>
            </Step>
          )}

          <Step n={available.length > 0 ? 3 : 2} title="Pagamento por transferência">
            <div className="flex items-start gap-3 rounded-lg bg-primary/5 p-4 text-sm">
              <Icon name="Landmark" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="flex-1 space-y-1">
                <p className="whitespace-pre-line">{instructions || "Os dados bancários para pagamento são indicados pela equipa Mindware após a criação da ordem."}</p>
                <p className="text-xs text-muted-foreground">Taxa: 0 Kz. Indique o valor total do resumo ao lado.</p>
              </div>
              {instructions && (
                <Button type="button" size="icon" variant="ghost" title="Copiar" onClick={() => { void navigator.clipboard.writeText(instructions); SucessMessage("Copiado"); }}><Icon name="Copy" className="size-4" /></Button>
              )}
            </div>
          </Step>

          <Step n={available.length > 0 ? 4 : 3} title="Comprovativo">
            <FileUpload value={file} onChange={setFile} accept={PROOF_ACCEPT_PDF_PNG} label="Anexar o comprovativo da transferência" />
            <Button size="lg" className="w-full" disabled={!file || !preview || busy || Boolean(openOrder)} onClick={submit}>
              {busy && <Icon name="LoaderCircle" className="mr-2 size-4 animate-spin" />}
              {busy ? "A processar..." : "Concluir subscrição"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">O plano é activado depois de a equipa validar o comprovativo.</p>
          </Step>
        </div>

        <aside className="self-start lg:sticky lg:top-6 lg:col-span-4">
          <Card className="gap-3 p-6 text-sm shadow-none">
            <h3 className="text-base font-semibold">Resumo</h3>
            {quoteError ? (
              <p className="text-destructive">{quoteError}</p>
            ) : !preview ? (
              <div className="animate-pulse space-y-2"><div className="h-4 w-2/3 rounded bg-muted" /><div className="h-4 w-1/2 rounded bg-muted" /></div>
            ) : (
              <>
                <div className="flex justify-between"><span>Plano {preview.breakdown.plan.name}</span><span>{kz(preview.breakdown.plan.monthly_price)}/mês</span></div>
                {preview.breakdown.addons.map((a) => <div key={a.name} className="flex justify-between text-muted-foreground"><span>{a.name}</span><span>+{kz(a.monthly_price)}/mês</span></div>)}
                <div className="flex justify-between text-muted-foreground"><span>Ciclo</span><span>{preview.breakdown.months} {preview.breakdown.months > 1 ? "meses" : "mês"}</span></div>
                <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{kz(preview.breakdown.total)}</span></div>
                <p className="text-xs text-muted-foreground">{preview.effective === "next_cycle" ? "Produz efeito no próximo ciclo." : "Produz efeito após a validação do pagamento."}</p>
                {preview.features_lost.length > 0 && (
                  <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <p className="font-medium">Deixa de ter:</p>
                    {preview.features_lost.map((f) => <p key={f.key}>• {f.message}</p>)}
                  </div>
                )}
                {preview.notes.map((n) => <p key={n} className="text-xs text-muted-foreground">{n}</p>)}
              </>
            )}
          </Card>
        </aside>
      </div>

      <GlobalModal sucess canClose={false} id="subscription-created" size="sm" title="Comprovativo enviado" description="Receberá uma notificação quando o pagamento for validado e o plano ficar activo.">
        <Button className="w-full" onClick={() => { closeModal("subscription-created"); router.push("/subscription"); }}>Ver a minha subscrição</Button>
      </GlobalModal>
    </div>
  );
}
