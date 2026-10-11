"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, FormModal, FormSelect, FormTextarea, Icon, Input } from "@/components";
import { Progress } from "@/components/ui/progress";
import { adminSchoolService, QUOTA_LABEL } from "@/modules/admin/services/admin-school-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const MODAL = "admin-override";
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-PT");
const QUOTA_VARIANT = { OK: "success", ALERT: "warning", LIMIT_REACHED: "destructive" } as const;

/** Quotas (uso vs limite), funcionalidades e excepções de direitos de uma escola. As excepções exigem motivo, fim e reautenticação. */
export function SchoolEntitlementsTab({ schoolId }: { schoolId: string }) {
  const qc = useQueryClient();
  const { openModal } = useModal();
  const ent = useQuery({ queryKey: ["admin-school-ent", schoolId], queryFn: () => adminSchoolService.entitlements(schoolId), staleTime: 30_000 });
  const ovr = useQuery({ queryKey: ["admin-school-ovr", schoolId], queryFn: () => adminSchoolService.overrides(schoolId), staleTime: 30_000 });
  const [kind, setKind] = useState<"feature" | "quota">("feature");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("true");
  const [endsAt, setEndsAt] = useState("");
  const [reason, setReason] = useState("");
  const [ticket, setTicket] = useState("");

  const create = useMutation({
    mutationFn: () => adminSchoolService.createOverride(schoolId, {
      key: `${kind}:${key}`,
      value: kind === "feature" ? value === "true" : value.trim() === "" ? null : Number(value),
      endsAt: new Date(`${endsAt}T23:59:59`).toISOString(),
      reason: reason.trim(),
      ...(ticket.trim() ? { ticket: ticket.trim() } : {}),
    }),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["admin-school-ent", schoolId] }); void qc.invalidateQueries({ queryKey: ["admin-school-ovr", schoolId] }); },
  });

  const features = ent.data?.features ?? [];
  const quotas = ent.data?.quotas ?? [];
  const keys = kind === "feature" ? features.map((f) => f.key) : quotas.map((q) => q.key);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const valid = key !== "" && endsAt >= tomorrow && reason.trim().length >= 10 && (kind === "feature" || value.trim() === "" || /^\d+$/.test(value.trim()));

  const openNew = () => { setKind("feature"); setKey(""); setValue("true"); setEndsAt(""); setReason(""); setTicket(""); openModal(MODAL); };
  const submit = () => create.mutateAsync().then(() => SucessMessage("Excepção criada.")).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível criar a excepção.")); throw e; });

  if (ent.isLoading) return <p className="text-sm text-muted-foreground">A carregar…</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Quotas do plano</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {quotas.map((q) => {
            const pct = q.limit ? Math.min(100, Math.round((q.used / q.limit) * 100)) : 0;
            return (
              <div key={q.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{QUOTA_LABEL[q.key] ?? q.key}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">{q.used}{q.limit === null ? " (sem limite)" : ` / ${q.limit}`}<Badge variant={QUOTA_VARIANT[q.state]} className="text-[10px]">{q.state === "OK" ? "Normal" : q.state === "ALERT" ? "Perto do limite" : "Limite atingido"}</Badge></span>
                </div>
                {q.limit !== null && <Progress value={pct} className="h-1.5" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Funcionalidades</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.key} className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm">
              <div><p className="font-mono text-xs">{f.key}</p><p className="text-[11px] text-muted-foreground">{f.reason}</p></div>
              <Badge variant={f.entitled ? "success" : "secondary"} className="shrink-0 text-[10px]">{f.entitled ? (f.source === "override" ? "Excepção" : "Incluída") : "Indisponível"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm">Excepções de direitos</CardTitle>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={openNew}><Icon name="Plus" className="size-4" />Nova excepção</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {(ovr.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sem excepções. As excepções dão (ou retiram) uma funcionalidade ou alteram uma quota durante um período, com motivo.</p>}
          {(ovr.data ?? []).map((o) => (
            <div key={o.id} className="flex items-start justify-between gap-3 rounded-md border p-2 text-sm">
              <div><p className="font-mono text-xs">{o.key} = {String(o.value)}</p><p className="text-[11px] text-muted-foreground">{o.reason}{o.ticket ? ` · ${o.ticket}` : ""}</p></div>
              <Badge variant={o.active ? "info" : "secondary"} className="shrink-0 text-[10px]">{o.active ? `até ${day(o.ends_at)}` : `terminou ${day(o.ends_at)}`}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <FormModal id={MODAL} title="Nova excepção de direitos" description="Temporária e auditada. Exige a sua reautenticação." submitLabel="Criar excepção" isLoading={create.isPending} disabled={!valid} onSubmit={submit}>
        <FormSelect label="Tipo" value={kind} onValueChange={(v) => { setKind(v as "feature" | "quota"); setKey(""); setValue(v === "feature" ? "true" : ""); }} options={[{ value: "feature", label: "Funcionalidade" }, { value: "quota", label: "Quota" }]} />
        <FormSelect label={kind === "feature" ? "Funcionalidade" : "Quota"} value={key} onValueChange={setKey} options={keys.map((k) => ({ value: k, label: kind === "quota" ? QUOTA_LABEL[k] ?? k : k }))} />
        {kind === "feature"
          ? <FormSelect label="Valor" value={value} onValueChange={setValue} options={[{ value: "true", label: "Activar" }, { value: "false", label: "Desactivar" }]} />
          : <Input label="Novo limite (vazio = sem limite)" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ex.: 500" />}
        <Input label="Termina em *" type="date" min={tomorrow} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        <div className="sm:col-span-2"><FormTextarea label="Motivo * (mínimo 10 caracteres)" value={reason} onChange={setReason} rows={2} /></div>
        <div className="sm:col-span-2"><Input label="Referência do pedido de suporte (opcional)" value={ticket} onChange={(e) => setTicket(e.target.value)} /></div>
      </FormModal>
    </div>
  );
}
