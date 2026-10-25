"use client";

import { Badge, DataList, DynamicMetricCard, TitleList, type Column } from "@/components";
import { useSchoolEmails } from "@/modules/finance/hooks/use-tuition-payments";
import type { ApiEmailLog } from "@/modules/finance/services/tuition-payments-service";
import { formatDateTime } from "@/utils/format-date";

export const EMAIL_STATUS: Record<ApiEmailLog["status"], { label: string; variant: "success" | "destructive" | "warning" | "secondary" }> = {
  enviado: { label: "Enviado", variant: "success" },
  falhou: { label: "Falhou", variant: "destructive" },
  pendente: { label: "Pendente", variant: "warning" },
  ignorado: { label: "Não enviado (sem canal)", variant: "secondary" },
};

const GROUP: Record<string, string> = {
  auth: "Conta", security: "Segurança", trial: "Período de avaliação", subscription: "Subscrição", platform: "Plataforma", tuition: "Propinas", admission: "Admissões",
  enrollment: "Matrículas", grades: "Notas", attendance: "Assiduidade", risk: "Risco de abandono", document: "Documentos", secretary: "Secretaria", announcement: "Comunicados",
  calendar: "Calendário", ops: "Operações",
};
export const emailGroup = (code: string) => GROUP[code.split(".")[0] ?? ""] ?? "Outros";

export function EmailStatusBadge({ status }: { status: ApiEmailLog["status"] }) {
  const c = EMAIL_STATUS[status];
  return <Badge variant={c.variant} className="font-normal">{c.label}</Badge>;
}

export const emailLogColumns = (showSchool = false): Column<ApiEmailLog>[] => [
  { key: "created_at", header: "Quando", render: (_, l) => <span className="text-xs">{formatDateTime(l.created_at)}</span> },
  { key: "subject", header: "Assunto", render: (_, l) => (<div className="max-w-sm"><span className="line-clamp-1 font-medium">{l.subject}</span><span className="font-mono text-[11px] text-muted-foreground">{l.template_code}</span></div>) },
  { key: "recipient", header: "Destinatário", render: (_, l) => <span className="text-xs">{l.recipient}</span> },
  ...(showSchool ? [{ key: "school_id", header: "Escola", render: (_: unknown, l: ApiEmailLog) => <span className="font-mono text-[11px] text-muted-foreground">{l.school_id?.slice(-8) ?? "plataforma"}</span> }] : []),
  { key: "status", header: "Estado", render: (_, l) => (<div><EmailStatusBadge status={l.status} />{l.error && <p className="mt-1 max-w-[200px] text-[11px] text-muted-foreground">{l.error}</p>}</div>) },
  { key: "attempts", header: "Tentativas", render: (_, l) => <span className="text-xs tabular-nums">{l.attempts}</span> },
];

export const emailLogFilters = (rows: ApiEmailLog[]) => [
  { key: "estado", label: "Estado", icon: "ListFilter" as const, options: Object.entries(EMAIL_STATUS).map(([value, c]) => ({ value, label: c.label })), match: (l: ApiEmailLog, v: string) => l.status === v },
  { key: "grupo", label: "Tipo de email", icon: "Mail" as const, options: [...new Set(rows.map((r) => emailGroup(r.template_code)))].sort().map((v) => ({ value: v, label: v })), match: (l: ApiEmailLog, v: string) => emailGroup(l.template_code) === v },
  { key: "modelo", label: "Modelo", icon: "FileText" as const, options: [...new Set(rows.map((r) => r.template_code))].sort().map((v) => ({ value: v, label: v })), match: (l: ApiEmailLog, v: string) => l.template_code === v },
];

/** Emails enviados pela escola (confirmações de pagamento, lembretes de propinas, comunicados…): auditoria e entrega. */
export function SchoolEmailsContent() {
  const { log, stats, isLoading, isError } = useSchoolEmails();
  return (
    <div className="space-y-6">
      <TitleList title="Emails enviados" suTitle="Registo dos emails que a plataforma enviou em nome da escola (últimos 30 dias nos indicadores)." />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={stats?.sent ?? 0} subtitle="Enviados" icon="Send" description="Últimos 30 dias" />
        <DynamicMetricCard title={stats?.delivery_rate != null ? `${stats.delivery_rate}%` : "—"} subtitle="Taxa de entrega" icon="CircleCheck" description="Enviados sobre tentativas" />
        <DynamicMetricCard title={stats?.failed ?? 0} subtitle="Falhas" icon="TriangleAlert" colors={(stats?.failed ?? 0) > 0 ? "destructive" : "default"} description="As temporárias são reenviadas sozinhas; as permanentes pedem a correção do email" />
        <DynamicMetricCard title={stats?.skipped ?? 0} subtitle="Não enviados" icon="MailX" description="Canal de email não configurado" />
      </div>

      <DataList<ApiEmailLog>
        prefix="emails"
        rows={log}
        columns={emailLogColumns()}
        isLoading={isLoading}
        isError={isError}
        pageSize={12}
        searchPlaceholder="Pesquisar destinatário ou assunto"
        searchText={(l) => `${l.recipient} ${l.subject} ${l.template_code}`}
        filters={emailLogFilters(log)}
        dateFilters={[{ key: "data", label: "Envio", getDate: (l) => l.created_at }]}
        sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }, { value: "destinatario", label: "Destinatário", compare: (a, b) => a.recipient.localeCompare(b.recipient) }]}
        emptyTitle="Ainda não foram enviados emails"
        emptyDescription="Os emails aparecem aqui assim que a plataforma enviar o primeiro."
        emptyIcon="Mail"
      />
    </div>
  );
}
