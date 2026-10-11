"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge, Button, DataList, DynamicMetricCard, EmptyState, FormModal, FormSelect, Icon, Input, TitleList, type Column } from "@/components";
import { useAdminSchools } from "@/modules/admin/hooks/use-admin-directory";
import type { AdminSchool, OnboardSchoolInput, SubscriptionStatus } from "@/modules/admin/services/admin-directory-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MODAL = "admin-onboard-school";

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  trial: "Em teste", active: "Activa", past_due: "Em atraso", grace: "Tolerância", suspended: "Suspensa", cancelled: "Cancelada", expired: "Expirada",
};
export const STATUS_VARIANT: Record<SubscriptionStatus, "info" | "success" | "warning" | "destructive" | "secondary"> = {
  trial: "info", active: "success", past_due: "warning", grace: "warning", suspended: "destructive", cancelled: "secondary", expired: "destructive",
};
export const SUBSYSTEM_LABEL: Record<AdminSchool["subsystem"], string> = { geral: "Ensino geral", tecnico_profissional: "Técnico-profissional", formacao_professores: "Formação de professores" };

const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-PT") : "—");

/** Quanto mais baixo, mais urgente: expirada/suspensa/em atraso primeiro, depois testes a acabar. */
function urgency(s: AdminSchool): number {
  const sub = s.subscription;
  if (s.activation.status === "parada") return 2;
  if (!sub) return 0;
  if (sub.status === "expired" || sub.status === "suspended" || sub.status === "past_due" || sub.status === "grace") return 1;
  if (sub.status === "trial") return 10 + Math.max(sub.days_left ?? 99, 0);
  return 1000;
}

const EMPTY = { name: "", nif: "", subsystem: "geral" as AdminSchool["subsystem"], fiscalSeriesPrefix: "", medCode: "", phone: "", email: "", address: "", trialDays: "", titularName: "", titularEmail: "" };

/** Directório de escolas da plataforma (administração de sistema): estado comercial, titular, utilização e criação de escolas. */
export function SchoolsContent() {
  const { schools, isLoading, isError, refetch, onboard } = useAdminSchools();
  const { openModal } = useModal();
  const [f, setF] = useState(EMPTY);
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const stats = useMemo(() => ({
    total: schools.length,
    trial: schools.filter((s) => s.subscription?.status === "trial").length,
    active: schools.filter((s) => s.subscription?.status === "active").length,
    attention: schools.filter((s) => urgency(s) < 18).length,
  }), [schools]);

  const valid =
    f.name.trim().length >= 2 && /^[0-9A-Za-z]{9,14}$/.test(f.nif.trim()) && /^[A-Z0-9]{2,10}$/.test(f.fiscalSeriesPrefix.trim()) &&
    f.titularName.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(f.titularEmail.trim()) &&
    (f.trialDays === "" || (Number(f.trialDays) >= 1 && Number(f.trialDays) <= 90)) && (f.email === "" || /^\S+@\S+\.\S+$/.test(f.email.trim()));

  const submit = () => {
    const v: OnboardSchoolInput = {
      name: f.name.trim(), nif: f.nif.trim(), subsystem: f.subsystem, fiscalSeriesPrefix: f.fiscalSeriesPrefix.trim(),
      ...(f.medCode.trim() ? { medCode: f.medCode.trim() } : {}), ...(f.phone.trim() ? { phone: f.phone.trim() } : {}),
      ...(f.email.trim() ? { email: f.email.trim() } : {}), ...(f.address.trim() ? { address: f.address.trim() } : {}),
      ...(f.trialDays ? { trialDays: Number(f.trialDays) } : {}), titularName: f.titularName.trim(), titularEmail: f.titularEmail.trim(),
    };
    return onboard.mutateAsync(v).then((r) => {
      const inv = r.titular.invite;
      if (!r.titular.is_new_user) SucessMessage(`Escola criada. ${r.titular.email} já tinha conta e passou a Titular.`);
      else if (inv && inv.sent) SucessMessage(`Escola criada. Convite enviado a ${r.titular.email}.`);
      else ErrorMessage(`Escola criada, mas o convite não foi enviado (${inv && !inv.sent ? inv.reason : "sem resposta"}). Reenvie-o a partir da recuperação de palavra-passe.`);
      setF(EMPTY);
    }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível criar a escola.")); throw e; });
  };

  const columns: Column<AdminSchool>[] = [
    { key: "name", header: "Escola", render: (_, s) => (<div><Link href={`/admin/schools/${s.id}`} className="text-sm font-semibold hover:text-primary hover:underline underline-offset-4">{s.name}</Link><p className="text-xs text-muted-foreground">NIF {s.nif}{s.med_code ? ` · MED ${s.med_code}` : ""} · {SUBSYSTEM_LABEL[s.subsystem]}</p></div>) },
    {
      key: "status", header: "Estado comercial",
      render: (_, s) => s.subscription
        ? (<div className="flex flex-col items-start gap-1"><Badge variant={STATUS_VARIANT[s.subscription.status]}>{STATUS_LABEL[s.subscription.status]}</Badge>{s.subscription.days_left !== null && <span className="text-[11px] text-muted-foreground">{s.subscription.days_left >= 0 ? `${s.subscription.days_left} dia(s) até ${day(s.subscription.ends_at)}` : `terminou a ${day(s.subscription.ends_at)}`}</span>}</div>)
        : <Badge variant="secondary">Sem subscrição</Badge>,
    },
    { key: "plan", header: "Plano", render: (_, s) => <span className="text-sm">{s.subscription?.plan.name ?? "—"}</span> },
    {
      key: "titular", header: "Titular",
      render: (_, s) => s.titular
        ? (<div><p className="text-sm">{s.titular.full_name}</p><p className="text-xs text-muted-foreground">{s.titular.email}</p><div className="mt-0.5 flex gap-1">{s.titular.mfa_enabled && <Badge variant="outline" className="text-[10px]">2FA</Badge>}{!s.titular.last_login_at && <Badge variant="warning" className="text-[10px]">Nunca entrou</Badge>}</div></div>)
        : <Badge variant="destructive">Sem Titular</Badge>,
    },
    {
      key: "activation", header: "Arranque",
      render: (_, s) => (
        <div className="w-40 space-y-1">
          <div className="flex items-center justify-between text-xs"><span>{s.activation.done}/{s.activation.total}</span>{s.activation.status === "parada" ? <Badge variant="warning" className="text-[10px]">Parada há {s.activation.days_inactive} d</Badge> : s.activation.status === "completa" ? <Badge variant="success" className="text-[10px]">Completo</Badge> : null}</div>
          <Progress value={s.activation.percent} className="h-1.5" />
          {s.activation.next_step && <p className="text-[11px] text-muted-foreground">Falta: {s.activation.next_step.label}</p>}
        </div>
      ),
    },
    { key: "usage", header: "Utilização", render: (_, s) => <span className="text-xs">{s.usage.students} aluno(s)<br />{s.usage.internal_users} utilizador(es)</span> },
    { key: "last", header: "Último acesso", render: (_, s) => <span className="text-xs">{day(s.last_login_at)}</span> },
  ];

  if (isError) return <EmptyState icon="ShieldAlert" title="Área restrita" description="Esta área é só para a administração do sistema." />;

  return (
    <div className="space-y-6">
      <TitleList title="Escolas" suTitle="Todas as escolas da plataforma: estado comercial, Titular, utilização e criação de novas escolas.">
        <Button size="sm" className="gap-2" onClick={() => { setF(EMPTY); openModal(MODAL); }}><Icon name="Plus" className="size-4" />Nova escola</Button>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={stats.total} subtitle="Escolas" description="Registadas na plataforma" icon="School" />
        <DynamicMetricCard title={stats.trial} subtitle="Em teste" description="Ainda sem subscrição paga" icon="Hourglass" />
        <DynamicMetricCard title={stats.active} subtitle="Activas" description="Subscrição em dia" icon="BadgeCheck" />
        <DynamicMetricCard title={stats.attention} subtitle="A precisar de atenção" description="Em atraso, suspensas, teste a acabar ou arranque parado" icon="TriangleAlert" />
      </div>

      <DataList
        prefix="escolas" rows={schools} columns={columns} isLoading={isLoading} isError={isError} refetch={() => void refetch()}
        searchPlaceholder="Pesquisar por escola, NIF, código MED ou Titular..."
        searchText={(s) => `${s.name} ${s.nif} ${s.med_code ?? ""} ${s.titular?.email ?? ""} ${s.titular?.full_name ?? ""}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: (Object.keys(STATUS_LABEL) as SubscriptionStatus[]).map((v) => ({ value: v, label: STATUS_LABEL[v] })), match: (s, v) => s.subscription?.status === v },
          { key: "arranque", label: "Arranque", icon: "Rocket", options: [{ value: "parada", label: "Parada" }, { value: "em_curso", label: "Em curso" }, { value: "completa", label: "Completo" }], match: (s, v) => s.activation.status === v },
          { key: "plano", label: "Plano", icon: "Package", options: [...new Set(schools.map((s) => s.subscription?.plan.name).filter((x): x is string => Boolean(x)))].map((v) => ({ value: v, label: v })), match: (s, v) => s.subscription?.plan.name === v },
        ]}
        sorts={[
          { value: "atencao", label: "Mais urgentes", compare: (a, b) => urgency(a) - urgency(b) },
          { value: "arranque", label: "Arranque (menos avançado)", compare: (a, b) => a.activation.percent - b.activation.percent },
          { value: "nome", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name, "pt") },
          { value: "criada", label: "Mais recentes", compare: (a, b) => b.created_at.localeCompare(a.created_at) },
        ]}
        emptyTitle="Sem escolas" emptyDescription="Crie a primeira escola com o botão «Nova escola»." emptyIcon="School"
      />

      <FormModal id={MODAL} title="Nova escola" description="Cria a escola com teste gratuito e convida o Titular por email, tudo numa só operação. Exige a sua reautenticação." submitLabel="Criar escola" size="lg" isLoading={onboard.isPending} disabled={!valid} onSubmit={submit}>
        <div className="sm:col-span-2"><Input label="Nome da escola *" value={f.name} onChange={set("name")} placeholder="Ex.: Colégio Horizonte" /></div>
        <Input label="NIF *" value={f.nif} onChange={set("nif")} placeholder="9 a 14 caracteres" />
        <Input label="Código MED" value={f.medCode} onChange={set("medCode")} />
        <FormSelect label="Subsistema *" value={f.subsystem} onValueChange={(v) => setF((x) => ({ ...x, subsystem: v as AdminSchool["subsystem"] }))} options={Object.entries(SUBSYSTEM_LABEL).map(([value, label]) => ({ value, label }))} />
        <Input label="Prefixo da série fiscal *" value={f.fiscalSeriesPrefix} onChange={(e) => setF((x) => ({ ...x, fiscalSeriesPrefix: e.target.value.toUpperCase() }))} placeholder="Ex.: CHZ" />
        <Input label="Telefone" value={f.phone} onChange={set("phone")} placeholder="+244 ..." />
        <Input label="Email da escola" value={f.email} onChange={set("email")} />
        <div className="sm:col-span-2"><Input label="Morada" value={f.address} onChange={set("address")} /></div>
        <Input label="Dias de teste" value={f.trialDays} onChange={set("trialDays")} placeholder="Por omissão: 14 (máx. 90)" />
        <div className="hidden sm:block" />
        <div className="sm:col-span-2 border-t pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Titular (recebe o convite)</div>
        <Input label="Nome do Titular *" value={f.titularName} onChange={set("titularName")} />
        <Input label="Email do Titular *" value={f.titularEmail} onChange={set("titularEmail")} />
      </FormModal>
    </div>
  );
}
