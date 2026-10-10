"use client";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage, WarningMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, DataList, DynamicMetricCard, FormModal, Icon, Input, type Column } from "@/components";
import { EmailStatusBadge, emailLogColumns, emailLogFilters } from "@/components/client/settings/emails/school-emails-content";
import { useAdminEmails } from "@/modules/finance/hooks/use-tuition-payments";
import { adminEmailsService, type ApiEmailLog, type EmailPreview, type EmailTemplateInfo } from "@/modules/finance/services/tuition-payments-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const PREVIEW = "email-preview";
const TEST = "email-test";
const AUDIENCE: Record<string, string> = { utilizador: "Utilizador", titular: "Titular", direccao: "Direcção", financeiro: "Financeiro", secretaria: "Secretaria", encarregado: "Encarregado", aluno: "Aluno", plataforma: "Plataforma" };

/** Centro de emails (plataforma): catálogo de modelos com pré-visualização, envio de teste, registo global e automação. */
export function PlatformEmails() {
  const mails = useAdminEmails();
  const { openModal } = useModal();
  const [selected, setSelected] = useState<EmailTemplateInfo | null>(null);
  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [to, setTo] = useState("");
  const categories = mails.templates?.categories ?? {};
  const templates = mails.templates?.data ?? [];

  useEffect(() => {
    if (!selected) return;
    setPreview(null);
    adminEmailsService.preview(selected.code).then(setPreview).catch(() => ErrorMessage("Não foi possível pré-visualizar."));
  }, [selected]);

  const fail = (e: unknown): never => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };

  const columns: Column<EmailTemplateInfo & { id: string }>[] = [
    { key: "name", header: "Modelo", render: (_, t) => (<div className="max-w-md"><span className="font-medium">{t.name}</span><p className="line-clamp-1 text-xs text-muted-foreground">{t.description}</p></div>) },
    { key: "code", header: "Código", render: (_, t) => <span className="font-mono text-[11px]">{t.code}</span> },
    { key: "category", header: "Categoria", render: (_, t) => <span className="text-xs">{categories[t.category] ?? t.category}</span> },
    { key: "audience", header: "Destinatário", render: (_, t) => <Badge variant="outline" className="font-normal">{AUDIENCE[t.audience] ?? t.audience}</Badge> },
    { key: "essential", header: "Tipo", render: (_, t) => <Badge variant={t.essential ? "info" : "secondary"} className="font-normal">{t.essential ? "Essencial" : "Ciclo de vida"}</Badge> },
    {
      key: "actions", header: "Acção",
      render: (_, t) => <ButtonOnlyAction data={t} actions={[
        { label: "Pré-visualizar", icon: "Eye", onClick: (x) => { setSelected(x); openModal(PREVIEW); } },
        { label: "Enviar teste", icon: "Send", onClick: (x) => { setSelected(x); openModal(TEST); } },
      ]} />,
    },
  ];
  const rows = templates.map((t) => ({ ...t, id: t.code }));

  return (
    <div className="space-y-6">
      {mails.templates && !mails.templates.configured && (
        <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>O fornecedor de email não está configurado (<span className="font-mono">EMAIL_API_URL</span> / <span className="font-mono">EMAIL_API_KEY</span>). Os emails ficam registados como «não enviados» até ser configurado.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={templates.length} subtitle="Modelos" icon="Mail" description={`${Object.keys(categories).length} categorias`} />
        <DynamicMetricCard title={mails.stats?.sent ?? 0} subtitle="Enviados (30 dias)" icon="Send" description={mails.stats?.delivery_rate != null ? `Entrega ${mails.stats.delivery_rate}%` : "Sem envios"} />
        <DynamicMetricCard title={mails.stats?.failed ?? 0} subtitle="Falhas" icon="TriangleAlert" colors={(mails.stats?.failed ?? 0) > 0 ? "destructive" : "default"} description="Reenviadas com recuo" />
        <DynamicMetricCard title={mails.stats?.skipped ?? 0} subtitle="Não enviados" icon="MailX" description="Sem canal configurado" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">A automação corre de hora a hora: sequência de trial, renovações, lembretes de propinas e resumo financeiro. É idempotente (nunca duplica).</p>
        <Button size="sm" variant="outline" className="gap-2" disabled={mails.run.isPending} onClick={() => void mails.run.mutateAsync().then((r) => SucessMessage(`Automação executada: ${r["trial"] ?? 0} trial, ${r["renewals"] ?? 0} renovações, ${r["tuition"] ?? 0} propinas, ${r["digests"] ?? 0} resumos.`)).catch(fail)}>
          <Icon name="Play" className="size-4" />Executar automação agora
        </Button>
      </div>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Modelos de email</h3>
        <DataList<EmailTemplateInfo & { id: string }>
          prefix="modelos"
          rows={rows}
          columns={columns}
          isLoading={mails.isLoading}
          pageSize={10}
          searchPlaceholder="Pesquisar modelo ou código"
          searchText={(t) => `${t.name} ${t.code} ${t.description}`}
          filters={[
            { key: "categoria", label: "Categoria", icon: "Layers", options: Object.entries(categories).map(([value, label]) => ({ value, label })), match: (t, v) => t.category === v },
            { key: "destino", label: "Destinatário", icon: "Users", options: Object.entries(AUDIENCE).map(([value, label]) => ({ value, label })), match: (t, v) => t.audience === v },
            { key: "tipo", label: "Tipo", icon: "Tag", options: [{ value: "essencial", label: "Essencial" }, { value: "ciclo", label: "Ciclo de vida" }], match: (t, v) => (v === "essencial" ? t.essential : !t.essential) },
          ]}
          sorts={[{ value: "nome", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name, "pt") }, { value: "codigo", label: "Código", compare: (a, b) => a.code.localeCompare(b.code) }]}
          emptyTitle="Sem modelos"
          emptyIcon="Mail"
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Registo de envios</h3>
        <DataList<ApiEmailLog>
          prefix="log"
          rows={mails.log}
          columns={emailLogColumns(true)}
          pageSize={10}
          searchPlaceholder="Pesquisar destinatário ou assunto"
          searchText={(l) => `${l.recipient} ${l.subject} ${l.template_code}`}
          filters={emailLogFilters(mails.log)}
          dateFilters={[{ key: "data", label: "Envio", getDate: (l) => l.created_at }]}
          sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }]}
          emptyTitle="Sem envios"
          emptyDescription="Ainda não foram enviados emails."
          emptyIcon="Mail"
        />
      </section>

      <FormModal id={PREVIEW} title={selected?.name ?? "Pré-visualização"} description={preview?.subject} size="lg" readOnly onSubmit={() => undefined}>
        <div className="sm:col-span-2">
          {!preview ? <p className="p-6 text-center text-sm text-muted-foreground">A carregar…</p> : (
            <iframe title="Pré-visualização do email" srcDoc={preview.html} sandbox="" className="h-[520px] w-full rounded-lg border bg-white" />
          )}
        </div>
      </FormModal>

      <FormModal id={TEST} title="Enviar email de teste" description={selected ? `${selected.name} — com dados de exemplo` : undefined} submitLabel="Enviar teste" size="sm" isLoading={mails.test.isPending} disabled={!to.includes("@")}
        onSubmit={() => (selected ? mails.test.mutateAsync({ code: selected.code, to: to.trim() }).then((r) => { if (r.outcome === "sent") SucessMessage("Email de teste enviado."); else WarningMessage(`Não enviado (${r.outcome}).`); }).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><Input label="Enviar para *" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="nome@dominio.ao" /></div>
      </FormModal>
    </div>
  );
}

export { EmailStatusBadge };
