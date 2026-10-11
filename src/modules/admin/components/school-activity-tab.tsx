"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components";
import { adminSchoolService, type AdminAuditEvent } from "@/modules/admin/services/admin-school-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage } from "@/utils/messages";

const when = (iso: string) => new Date(iso).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
const SEVERITY = { critical: "destructive", high: "destructive", medium: "warning", low: "secondary" } as Record<string, "destructive" | "warning" | "secondary">;

/** Actividade recente (auditoria) e alertas de segurança de uma escola. */
export function SchoolActivityTab({ schoolId }: { schoolId: string }) {
  const qc = useQueryClient();
  const audit = useInfiniteQuery({
    queryKey: ["admin-school-audit", schoolId],
    queryFn: ({ pageParam }) => adminSchoolService.audit(schoolId, pageParam || undefined),
    initialPageParam: "" as string,
    getNextPageParam: (last) => (last.page.has_more ? last.page.next_cursor ?? undefined : undefined),
    staleTime: 30_000,
  });
  const alerts = useQuery({ queryKey: ["admin-school-alerts", schoolId], queryFn: () => adminSchoolService.alerts(schoolId), staleTime: 30_000 });
  const ack = useMutation({
    mutationFn: adminSchoolService.acknowledgeAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-school-alerts", schoolId] }),
    onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível reconhecer o alerta.")),
  });
  const events: AdminAuditEvent[] = audit.data?.pages.flatMap((p) => p.data) ?? [];
  const open = (alerts.data ?? []).filter((a) => !a.acknowledged_at);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas de segurança {open.length > 0 && <Badge variant="destructive" className="ml-2 text-[10px]">{open.length} por reconhecer</Badge>}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(alerts.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Sem alertas para esta escola.</p>}
          {(alerts.data ?? []).map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-md border p-2 text-sm">
              <div><p className="flex items-center gap-2 font-medium"><Badge variant={SEVERITY[a.severity] ?? "secondary"} className="text-[10px]">{a.severity}</Badge>{a.type}</p><p className="text-[11px] text-muted-foreground">{when(a.created_at)}{a.acknowledged_at ? ` · reconhecido ${when(a.acknowledged_at)}` : ""}</p></div>
              {!a.acknowledged_at && <Button size="sm" variant="outline" disabled={ack.isPending} onClick={() => ack.mutate(a.id)}>Reconhecer</Button>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Actividade recente</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {audit.isLoading && <p className="text-sm text-muted-foreground">A carregar…</p>}
          {!audit.isLoading && events.length === 0 && <p className="text-sm text-muted-foreground">Sem actividade registada.</p>}
          {events.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 border-b py-1.5 text-sm last:border-0">
              <div>
                <p><span className="font-medium">{e.actor?.full_name ?? "Sistema"}</span> <span className="text-muted-foreground">{e.action} · {e.entity_type}</span></p>
                {e.reason && <p className="text-[11px] text-muted-foreground">{e.reason}</p>}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{when(e.occurred_at)}</span>
            </div>
          ))}
          {audit.hasNextPage && <div className="pt-2 text-center"><Button size="sm" variant="outline" disabled={audit.isFetchingNextPage} onClick={() => void audit.fetchNextPage()}>{audit.isFetchingNextPage ? "A carregar…" : "Ver mais"}</Button></div>}
        </CardContent>
      </Card>
    </div>
  );
}
