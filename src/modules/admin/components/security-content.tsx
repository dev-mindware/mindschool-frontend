"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, FormSelect, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { SecurityAuditTab } from "@/modules/admin/components/security-audit-tab";
import {
  adminSecurityService, ALERT_TYPE_LABEL, OPERATION_LABEL, SEVERITY_LABEL, type AlertSeverity, type PlatformAlert,
} from "@/modules/admin/services/admin-security-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";

const SEVERITY_VARIANT: Record<AlertSeverity, "destructive" | "warning" | "secondary"> = { critical: "destructive", warning: "warning", info: "secondary" };
const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });

function Stat({ label, value, tone }: { label: string; value: number; tone?: "bad" | "ok" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className={`text-2xl font-semibold tabular-nums ${tone === "bad" && value > 0 ? "text-destructive" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function OverviewTab() {
  const [days, setDays] = useState("7");
  const q = useQuery({ queryKey: ["admin-security-overview", days], queryFn: () => adminSecurityService.overview(Number(days)), staleTime: 30_000, retry: false });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  if (q.isError || !q.data) return <EmptyState icon="ShieldAlert" title="Não foi possível carregar o relatório" description="Tente de novo dentro de instantes." />;
  const { alerts, accounts, impersonations, sensitive_operations: ops } = q.data;

  return (
    <div className="space-y-4">
      <div className="w-56"><FormSelect label="Período" value={days} onValueChange={setDays} options={[{ value: "1", label: "Último dia" }, { value: "7", label: "Últimos 7 dias" }, { value: "30", label: "Últimos 30 dias" }, { value: "90", label: "Últimos 90 dias" }]} /></div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Por tratar agora</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Alertas por reconhecer" value={alerts.unacknowledged} tone="bad" />
          <Stat label="Alertas críticos por reconhecer" value={alerts.critical_unacknowledged} tone="bad" />
          <Stat label="Contas bloqueadas" value={accounts.blocked} />
          <Stat label="Titulares sem segundo factor" value={accounts.titulars_without_mfa} tone="bad" />
          <Stat label="Contas com bloqueio temporário" value={accounts.temporarily_locked} />
          <Stat label="Contas com tentativas falhadas" value={accounts.with_failed_attempts} />
          <Stat label="Personificações activas" value={impersonations.active_now} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas no período</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {alerts.by_type.length === 0 && <p className="text-sm text-muted-foreground">Nenhum alerta no período.</p>}
            {alerts.by_type.map((a) => (
              <div key={`${a.type}-${a.severity}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2"><Badge variant={SEVERITY_VARIANT[a.severity]} className="text-[10px]">{SEVERITY_LABEL[a.severity]}</Badge>{ALERT_TYPE_LABEL[a.type] ?? a.type}</span>
                <span className="font-semibold tabular-nums">{a.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Operações sensíveis e personificações</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <div className="flex items-center justify-between text-sm"><span>Personificações iniciadas</span><span className="font-semibold tabular-nums">{impersonations.started}</span></div>
            <div className="flex items-center justify-between text-sm"><span>…com permissão de escrita</span><span className="font-semibold tabular-nums">{impersonations.with_write}</span></div>
            {ops.length > 0 && <div className="my-2 border-t" />}
            {ops.map((o) => (
              <div key={o.operation} className="flex items-center justify-between gap-3 text-sm"><span>{OPERATION_LABEL[o.operation] ?? o.operation}</span><span className="font-semibold tabular-nums">{o.count}</span></div>
            ))}
            {ops.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma operação sensível no período.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Contas a precisar de atenção</CardTitle></CardHeader>
        <CardContent className="space-y-1.5">
          {accounts.attention.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma conta com tentativas falhadas em curso.</p>}
          {accounts.attention.map((u) => (
            <div key={u.user_id} className="flex flex-wrap items-center justify-between gap-2 border-b py-1.5 text-sm last:border-0">
              <div><p className="font-medium">{u.full_name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
              <div className="flex items-center gap-2">
                {u.status === "bloqueado" && <Badge variant="destructive" className="text-[10px]">Bloqueada</Badge>}
                {u.locked_until && <Badge variant="warning" className="text-[10px]">Bloqueio temporário até {when(u.locked_until)}</Badge>}
                <span className="text-xs text-muted-foreground">{u.failed_attempts} tentativa(s) falhada(s)</span>
              </div>
            </div>
          ))}
          <p className="pt-1 text-[11px] text-muted-foreground">As tentativas falhadas não ficam guardadas como histórico: mostram-se as contas com falhas em curso. Para desbloquear, use Utilizadores.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertsTab() {
  const qc = useQueryClient();
  const [severity, setSeverity] = useState("todas");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const q = useQuery({
    queryKey: ["admin-security-alerts", severity, onlyOpen],
    queryFn: () => adminSecurityService.alerts({ ...(severity !== "todas" ? { severity } : {}), onlyOpen }),
    staleTime: 15_000, retry: false,
  });
  const ack = useMutation({
    mutationFn: adminSecurityService.acknowledge,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-security-alerts"] }); void qc.invalidateQueries({ queryKey: ["admin-security-overview"] }); },
    onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível reconhecer o alerta.")),
  });
  const rows: PlatformAlert[] = q.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48"><FormSelect label="Gravidade" value={severity} onValueChange={setSeverity} options={[{ value: "todas", label: "Todas" }, { value: "critical", label: "Crítico" }, { value: "warning", label: "Aviso" }, { value: "info", label: "Informação" }]} /></div>
        <div className="w-48"><FormSelect label="Estado" value={onlyOpen ? "abertos" : "todos"} onValueChange={(v) => setOnlyOpen(v === "abertos")} options={[{ value: "abertos", label: "Por reconhecer" }, { value: "todos", label: "Todos" }]} /></div>
      </div>
      {q.isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
      {!q.isLoading && rows.length === 0 && <EmptyState icon="ShieldCheck" title="Sem alertas" description="Nenhum alerta corresponde aos filtros." />}
      {rows.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex flex-wrap items-start justify-between gap-3 p-3">
            <div className="space-y-0.5">
              <p className="flex items-center gap-2 text-sm font-medium"><Badge variant={SEVERITY_VARIANT[a.severity] ?? "secondary"} className="text-[10px]">{SEVERITY_LABEL[a.severity] ?? a.severity}</Badge>{ALERT_TYPE_LABEL[a.type] ?? a.type}</p>
              <p className="text-xs text-muted-foreground">
                {when(a.created_at)}
                {a.school ? ` · ${a.school.name ?? "Escola"}` : ""}
                {a.user ? ` · ${a.user.full_name ?? ""} ${a.user.email ? `(${a.user.email})` : ""}` : ""}
                {a.acknowledged_at ? ` · reconhecido ${when(a.acknowledged_at)}` : ""}
              </p>
              {a.details != null && <p className="max-w-2xl truncate font-mono text-[11px] text-muted-foreground" title={JSON.stringify(a.details)}>{JSON.stringify(a.details)}</p>}
            </div>
            {!a.acknowledged_at && <Button size="sm" variant="outline" disabled={ack.isPending} onClick={() => ack.mutate(a.id)}>Reconhecer</Button>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Centro de segurança da plataforma: relatório, alertas com reconhecimento, auditoria global e verificação de integridade. */
export function SecurityContent() {
  return (
    <div className="space-y-6">
      <TitleList title="Segurança" suTitle="O que precisa de atenção na plataforma: alertas, contas, operações sensíveis e a integridade da auditoria." />
      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria e integridade</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo" className="pt-4"><OverviewTab /></TabsContent>
        <TabsContent value="alertas" className="pt-4"><AlertsTab /></TabsContent>
        <TabsContent value="auditoria" className="pt-4"><SecurityAuditTab /></TabsContent>
      </Tabs>
    </div>
  );
}
