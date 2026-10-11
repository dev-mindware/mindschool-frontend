"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DynamicMetricCard, EmptyState, FormModal, FormTextarea, Icon, Input, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { formatCurrencyCompact } from "@/utils/format-currency";
import { STATUS_LABEL, STATUS_VARIANT, SUBSYSTEM_LABEL } from "@/modules/admin/components/schools-content";
import { SchoolActivityTab } from "@/modules/admin/components/school-activity-tab";
import { SchoolEntitlementsTab } from "@/modules/admin/components/school-entitlements-tab";
import { UsersContent } from "@/modules/admin/components/users-content";
import { adminSchoolService } from "@/modules/admin/services/admin-school-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MODAL = "admin-school-state";
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-PT") : "—");
const ORDER_STATUS: Record<string, string> = {
  pending_payment: "A aguardar pagamento", payment_proof_submitted: "Comprovativo enviado", under_review: "Em análise", approved: "Aprovada", rejected: "Rejeitada",
  replacement_required: "Novo comprovativo pedido", cancelled: "Cancelada", expired: "Expirada",
};
const ROLE_LABEL: Record<string, string> = {
  titular: "Titulares", direccao_pedagogica: "Direcção Pedagógica", secretaria: "Secretaria", professor: "Professores", financeiro: "Financeiro", encarregado: "Encarregados", aluno: "Alunos (com conta)", auditor_med: "Auditores MED",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="text-sm font-medium">{children || "—"}</dd></div>);
}

/** Ficha da escola (administração de sistema): resumo, subscrição, direitos, utilizadores e actividade, tudo num só lugar. */
export function SchoolDetailContent({ schoolId }: { schoolId: string }) {
  const qc = useQueryClient();
  const { openModal } = useModal();
  const q = useQuery({ queryKey: ["admin-school", schoolId], queryFn: () => adminSchoolService.detail(schoolId), staleTime: 30_000, retry: false });
  const [action, setAction] = useState<"suspend" | "reactivate">("suspend");
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");

  const change = useMutation({
    mutationFn: () => (action === "suspend" ? adminSchoolService.suspend : adminSchoolService.reactivate)(schoolId, reason.trim(), ticket.trim() || undefined),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-school", schoolId] }); void qc.invalidateQueries({ queryKey: ["admin-school-ent", schoolId] }); void qc.invalidateQueries({ queryKey: ["admin-schools"] }); },
  });
  const start = (a: "suspend" | "reactivate") => { setAction(a); setReason(""); setTicket(""); openModal(MODAL); };
  const submit = () => change.mutateAsync().then(() => SucessMessage(action === "suspend" ? "Subscrição suspensa: a escola passa a modo de leitura." : "Subscrição reactivada.")).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; });

  if (q.isLoading) return <p className="p-6 text-sm text-muted-foreground">A carregar a ficha…</p>;
  if (q.isError || !q.data) return <EmptyState icon="SearchX" title="Escola não encontrada" description="A escola não existe ou não tem acesso a esta área." />;

  const { school, subscription: sub, orders, usage, titulars, activation } = q.data;
  const canSuspend = sub !== null && ["trial", "active", "past_due", "grace"].includes(sub.status);
  const canReactivate = sub?.status === "suspended";

  return (
    <div className="space-y-6">
      <TitleList title={school.name} suTitle={`NIF ${school.nif}${school.med_code ? ` · MED ${school.med_code}` : ""} · ${SUBSYSTEM_LABEL[school.subsystem as keyof typeof SUBSYSTEM_LABEL] ?? school.subsystem}`}>
        <div className="flex flex-wrap items-center gap-2">
          {sub && <Badge variant={STATUS_VARIANT[sub.status]}>{STATUS_LABEL[sub.status]}{sub.days_left !== null && sub.days_left >= 0 ? ` · ${sub.days_left} dia(s)` : ""}</Badge>}
          <Button asChild size="sm" variant="outline"><Link href="/admin/schools"><Icon name="ArrowLeft" className="mr-1.5 size-4" />Escolas</Link></Button>
          {canSuspend && <Button size="sm" variant="outline" className="text-destructive" onClick={() => start("suspend")}><Icon name="PauseCircle" className="mr-1.5 size-4" />Suspender</Button>}
          {canReactivate && <Button size="sm" onClick={() => start("reactivate")}><Icon name="PlayCircle" className="mr-1.5 size-4" />Reactivar</Button>}
        </div>
      </TitleList>

      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumo" className="text-xs">Resumo</TabsTrigger>
          <TabsTrigger value="subscricao" className="text-xs">Subscrição</TabsTrigger>
          <TabsTrigger value="direitos" className="text-xs">Utilização e direitos</TabsTrigger>
          <TabsTrigger value="utilizadores" className="text-xs">Utilizadores</TabsTrigger>
          <TabsTrigger value="actividade" className="text-xs">Actividade e alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <Card className={activation.status === "parada" ? "border-amber-500/40" : undefined}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Icon name="Rocket" className="size-4 text-primary" />Arranque da escola<span className="text-xs font-normal text-muted-foreground">{activation.done} de {activation.total} passos</span></CardTitle>
              {activation.status === "parada" && <Badge variant="warning">Parada há {activation.days_inactive} dias</Badge>}
              {activation.status === "completa" && <Badge variant="success">Completo</Badge>}
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={activation.percent} className="h-2" />
              {activation.status === "parada" && <p className="text-sm text-amber-700 dark:text-amber-300">Sem actividade de ninguém há {activation.days_inactive} dias e o arranque não está concluído: vale a pena contactar o Titular.</p>}
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {activation.items.map((i) => (
                  <li key={i.key} className="flex items-start gap-2 text-sm">
                    <Icon name={i.done ? "CircleCheck" : "Circle"} className={i.done ? "mt-0.5 size-4 text-emerald-500" : "mt-0.5 size-4 text-muted-foreground"} />
                    <span><span className={i.done ? "" : "font-medium"}>{i.label}</span>{!i.done && <span className="block text-[11px] text-muted-foreground">{i.hint}</span>}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
            <DynamicMetricCard title={usage.students} subtitle="Alunos" description="Registados" icon="GraduationCap" />
            <DynamicMetricCard title={usage.teachers} subtitle="Professores" description="Com ficha activa" icon="Users" />
            <DynamicMetricCard title={usage.sections} subtitle="Turmas" description="No total" icon="LayoutGrid" />
            <DynamicMetricCard title={day(q.data.last_login_at)} subtitle="Último acesso" description="De qualquer utilizador" icon="Clock" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Dados da escola</CardTitle></CardHeader>
              <CardContent><dl className="grid grid-cols-2 gap-3">
                <Field label="Email">{school.email}</Field><Field label="Telefone">{school.phone}</Field>
                <div className="col-span-2"><Field label="Morada">{school.address}</Field></div>
                <Field label="Série fiscal">{school.fiscal_series_prefix}</Field><Field label="Criada em">{day(school.created_at)}</Field>
              </dl></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Titular(es)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {titulars.length === 0 && <Badge variant="destructive">Sem Titular</Badge>}
                {titulars.map((t) => (
                  <div key={t.user_id} className="flex items-start justify-between gap-2 text-sm">
                    <div><p className="font-medium">{t.full_name}</p><p className="text-xs text-muted-foreground">{t.email}</p></div>
                    <div className="flex flex-col items-end gap-1">{t.mfa_enabled && <Badge variant="outline" className="text-[10px]">2FA</Badge>}<span className="text-[11px] text-muted-foreground">{t.last_login_at ? `entrou ${day(t.last_login_at)}` : "nunca entrou"}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Pessoas com acesso</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {Object.entries(usage.roles).length === 0 && <span className="text-sm text-muted-foreground">Sem papéis activos.</span>}
              {Object.entries(usage.roles).map(([r, n]) => <Badge key={r} variant="outline">{ROLE_LABEL[r] ?? r}: {n}</Badge>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscricao" className="space-y-4">
          {!sub ? <EmptyState icon="CreditCard" title="Sem subscrição" description="Esta escola ainda não tem estado comercial." /> : (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Estado da subscrição</CardTitle></CardHeader>
              <CardContent><dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label="Estado"><Badge variant={STATUS_VARIANT[sub.status]}>{STATUS_LABEL[sub.status]}</Badge></Field>
                <Field label="Plano">{sub.plan.name}</Field>
                <Field label={sub.status === "trial" ? "Teste termina" : "Período termina"}>{day(sub.ends_at)}{sub.days_left !== null ? ` (${sub.days_left} dia(s))` : ""}</Field>
                <Field label="Crédito">{formatCurrencyCompact(sub.credit_balance)}</Field>
                <Field label="Início do período">{day(sub.period_start)}</Field>
                <Field label="Cancela no fim do período">{sub.cancel_at_period_end ? "Sim" : "Não"}</Field>
                <Field label="Mudança de plano pendente">{sub.pending_plan?.name}</Field>
                <Field label="Extras">{sub.addons.length ? sub.addons.map((a) => `${a.name} (${a.status})`).join(", ") : null}</Field>
              </dl></CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Ordens de subscrição (últimas 10)</CardTitle>
              <Button asChild size="sm" variant="outline"><Link href="/admin/platform">Fila de revisão</Link></Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {orders.length === 0 && <p className="text-sm text-muted-foreground">Sem ordens.</p>}
              {orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-1.5 text-sm last:border-0">
                  <span>{o.plan.name} · {o.period_months} mês(es) · <span className="font-mono text-xs">{formatCurrencyCompact(o.total_amount)}</span></span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline" className="text-[10px]">{ORDER_STATUS[o.status] ?? o.status}</Badge>{day(o.created_at)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direitos"><SchoolEntitlementsTab schoolId={schoolId} /></TabsContent>
        <TabsContent value="utilizadores"><UsersContent schoolId={schoolId} embedded /></TabsContent>
        <TabsContent value="actividade"><SchoolActivityTab schoolId={schoolId} /></TabsContent>
      </Tabs>

      <FormModal id={MODAL} title={action === "suspend" ? "Suspender subscrição" : "Reactivar subscrição"} description={action === "suspend" ? "A escola passa a modo de leitura (consulta e exportação) até ser reactivada. Exige a sua reautenticação." : "A escola recupera o acesso completo do seu plano. Exige a sua reautenticação."} submitLabel="Confirmar" isLoading={change.isPending} disabled={reason.trim().length < 10} onSubmit={submit}>
        <div className="sm:col-span-2"><FormTextarea label="Motivo * (mínimo 10 caracteres)" value={reason} onChange={setReason} rows={3} /></div>
        <div className="sm:col-span-2"><Input label="Referência do pedido de suporte (opcional)" value={ticket} onChange={(e) => setTicket(e.target.value)} /></div>
      </FormModal>
    </div>
  );
}
