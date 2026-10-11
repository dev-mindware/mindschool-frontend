"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, FormSelect, Input } from "@/components";
import { useAdminSchools } from "@/modules/admin/hooks/use-admin-directory";
import { adminSecurityService, type AuditFilters, type IntegrityResult } from "@/modules/admin/services/admin-security-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";

const ALL = "todas";
const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
const ACTIONS = [["criacao", "Criação"], ["actualizacao", "Actualização"], ["fecho", "Fecho"], ["reabertura", "Reabertura"], ["anulacao", "Anulação"]] as const;
const MODULES = ["academico", "avaliacao", "pessoas", "financeiro", "documentos", "organizacao", "comunicacao", "relatorios"] as const;
const MAX_ROUNDS = 40; // 40 x 5000 registos: o suficiente para escolas grandes sem prender o navegador

/** Auditoria global (janela até 31 dias) e verificação da cadeia de hashes de uma escola. */
export function SecurityAuditTab() {
  const { schools } = useAdminSchools();
  const schoolOptions = [{ value: ALL, label: "Todas as escolas" }, ...schools.map((s) => ({ value: s.id, label: s.name }))];

  const [draft, setDraft] = useState({ school: ALL, actor: "", action: ALL, module: ALL, from: "", to: "", text: "" });
  const [applied, setApplied] = useState<AuditFilters>({});
  const set = (k: keyof typeof draft) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const apply = () => setApplied({
    ...(draft.school !== ALL ? { schoolId: draft.school } : {}), ...(draft.actor.trim().length >= 3 ? { actorEmail: draft.actor.trim() } : {}),
    ...(draft.action !== ALL ? { action: draft.action } : {}), ...(draft.module !== ALL ? { module: draft.module } : {}),
    ...(draft.from ? { from: draft.from } : {}), ...(draft.to ? { to: draft.to } : {}), ...(draft.text.trim().length >= 3 ? { text: draft.text.trim() } : {}),
  });

  const audit = useInfiniteQuery({
    queryKey: ["admin-security-audit", applied],
    queryFn: ({ pageParam }) => adminSecurityService.audit(applied, pageParam || undefined),
    initialPageParam: "" as string,
    getNextPageParam: (last) => (last.page.has_more ? last.page.next_cursor ?? undefined : undefined),
    staleTime: 30_000, retry: false,
  });
  const events = audit.data?.pages.flatMap((p) => p.data) ?? [];
  const schoolName = (id: string | null) => (id ? schools.find((s) => s.id === id)?.name ?? "—" : "Plataforma");

  const [verifySchool, setVerifySchool] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<(IntegrityResult & { total: number; partial: boolean }) | null>(null);
  const verify = async () => {
    if (!verifySchool) return;
    setRunning(true); setResult(null);
    try {
      let total = 0; let after: string | undefined; let last: IntegrityResult | null = null;
      for (let i = 0; i < MAX_ROUNDS; i++) {
        last = await adminSecurityService.integrity(verifySchool, after);
        total += last.checked;
        if (!last.ok || !last.next_after_seq) break;
        after = last.next_after_seq;
      }
      if (last) setResult({ ...last, total, partial: last.ok && last.next_after_seq !== null });
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível verificar a integridade."));
    } finally { setRunning(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Verificar integridade da auditoria</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Recalcula a cadeia de hashes de todos os registos da escola. Se alguém tiver alterado ou apagado um registo, a cadeia quebra e o primeiro registo afectado é indicado.</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-72"><FormSelect label="Escola" value={verifySchool} onValueChange={setVerifySchool} options={schools.map((s) => ({ value: s.id, label: s.name }))} /></div>
            <Button size="sm" disabled={!verifySchool || running} onClick={() => void verify()}>{running ? "A verificar…" : "Verificar"}</Button>
          </div>
          {result && (
            <div className={`rounded-md border p-3 text-sm ${result.ok ? "border-emerald-500/40" : "border-destructive/60"}`}>
              {result.ok
                ? <p><Badge variant="success" className="mr-2">Íntegra</Badge>{result.total} registo(s) verificado(s), sem alterações detectadas.{result.partial ? " A verificação parou ao atingir o limite; volte a correr para continuar." : ""}</p>
                : <p><Badge variant="destructive" className="mr-2">Quebrada</Badge>Primeiro registo afectado: <span className="font-mono text-xs">{result.first_break?.id}</span> (sequência {result.first_break?.seq}; {result.first_break?.reason === "prev_hash_mismatch" ? "ligação ao registo anterior alterada" : "conteúdo alterado"}).</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Auditoria global</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <FormSelect label="Escola" value={draft.school} onValueChange={set("school")} options={schoolOptions} />
            <FormSelect label="Acção" value={draft.action} onValueChange={set("action")} options={[{ value: ALL, label: "Todas as acções" }, ...ACTIONS.map(([value, label]) => ({ value, label }))]} />
            <FormSelect label="Módulo" value={draft.module} onValueChange={set("module")} options={[{ value: ALL, label: "Todos os módulos" }, ...MODULES.map((m) => ({ value: m, label: m }))]} />
            <Input label="Autor (email, mín. 3 letras)" value={draft.actor} onChange={(e) => set("actor")(e.target.value)} />
            <Input label="Texto do motivo (mín. 3 letras)" value={draft.text} onChange={(e) => set("text")(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Desde" type="date" value={draft.from} onChange={(e) => set("from")(e.target.value)} />
              <Input label="Até" type="date" value={draft.to} onChange={(e) => set("to")(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={apply}>Pesquisar</Button>
            <p className="text-[11px] text-muted-foreground">Sem datas, mostram-se os últimos 7 dias; a janela máxima é de 31 dias. A pesquisa fica registada.</p>
          </div>

          {audit.isError && <p className="text-sm text-destructive">{getApiErrorMessage(audit.error, "A pesquisa falhou. Verifique as datas (máximo 31 dias).")}</p>}
          {audit.isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
          {!audit.isLoading && !audit.isError && events.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registo para estes filtros.</p>}
          <div>
            {events.map((e) => (
              <div key={e.id} className="flex items-start justify-between gap-3 border-b py-1.5 text-sm last:border-0">
                <div>
                  <p><span className="font-medium">{e.actor?.full_name ?? "Sistema"}</span> <span className="text-muted-foreground">{e.action} · {e.entity_type} · {schoolName(e.organization_id)}</span></p>
                  {e.reason && <p className="text-[11px] text-muted-foreground">{e.reason}</p>}
                </div>
                <span className="shrink-0 text-right text-xs text-muted-foreground">{when(e.occurred_at)}{e.ip ? <><br />{e.ip}</> : null}</span>
              </div>
            ))}
          </div>
          {audit.hasNextPage && <div className="text-center"><Button size="sm" variant="outline" disabled={audit.isFetchingNextPage} onClick={() => void audit.fetchNextPage()}>{audit.isFetchingNextPage ? "A carregar…" : "Ver mais"}</Button></div>}
        </CardContent>
      </Card>
    </div>
  );
}
