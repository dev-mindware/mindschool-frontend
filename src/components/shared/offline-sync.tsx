"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Icon } from "@/components";
import { QUEUE_EVENT, discardOp, failedOps, flushQueue, pendingOps, retryOp, type QueuedOp } from "@/lib/offline-queue";
import api from "@/services/api";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const RETRY_MS = 20_000;
const send = async (op: QueuedOp) => {
  await api.put(op.url, { [op.arrayKey]: op.items });
};
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Chamada e notas sem ligação: as alterações guardam-se neste dispositivo (ver `lib/offline-queue`) e seguem
 * sozinhas quando a rede volta. Mostra o estado e deixa decidir o que a API recusou.
 */
export function OfflineSync() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [online, setOnline] = useState(true);
  const [, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false); // a fila vem do dispositivo: só se mostra depois de montar (sem diferenças na hidratação)

  const pending = pendingOps(schoolId);
  const failed = failedOps(schoolId);

  const sync = useCallback(async () => {
    if (!schoolId || pendingOps(schoolId).length === 0) return;
    setBusy(true);
    const r = await flushQueue(schoolId, send, (e) => getApiErrorMessage(e, "A API recusou esta alteração."));
    setBusy(false);
    if (r.sent > 0) {
      for (const k of ["roll-call", "grade-sheet", "pautas", "section-panel"]) queryClient.invalidateQueries({ queryKey: [k] });
      SucessMessage(`${count(r.sent, "alteração sincronizada", "alterações sincronizadas")}.`);
    }
    if (r.failed > 0) ErrorMessage(`${count(r.failed, "alteração foi recusada", "alterações foram recusadas")}: veja o motivo no aviso no canto do ecrã.`);
  }, [schoolId, queryClient]);

  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);
    const refresh = () => setTick((n) => n + 1);
    const up = () => {
      setOnline(true);
      void sync();
    };
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    window.addEventListener(QUEUE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    void sync(); // alterações que ficaram da última vez
    const timer = window.setInterval(() => void sync(), RETRY_MS);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
      window.removeEventListener(QUEUE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.clearInterval(timer);
    };
  }, [sync]);

  if (!mounted || (online && pending.length === 0 && failed.length === 0)) return null;

  const items = pending.reduce((n, o) => n + o.items.length, 0);

  return (
    <div role="status" className="fixed bottom-4 left-4 z-50 w-[min(22rem,calc(100vw-2rem))] space-y-2 rounded-sm border bg-card p-3 text-sm shadow-lg">
      <div className="flex items-start gap-2">
        <Icon name={online ? "CloudUpload" : "WifiOff"} className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          {!online && <p className="font-medium">Sem ligação</p>}
          {pending.length > 0 ? (
            <p className={online ? "font-medium" : "text-xs text-muted-foreground"}>
              {count(items, "alteração guardada", "alterações guardadas")} neste dispositivo{online ? ", a enviar…" : ": seguem quando a rede voltar."}
            </p>
          ) : (
            !online && <p className="text-xs text-muted-foreground">Pode continuar a lançar notas e faltas: ficam guardadas neste dispositivo.</p>
          )}
        </div>
        {pending.length > 0 && online && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void sync()}>{busy ? "A enviar…" : "Enviar agora"}</Button>
        )}
      </div>
      {failed.map((op) => (
        <div key={op.id} className="rounded-sm border border-destructive/40 bg-destructive/5 p-2">
          <p className="text-xs font-medium">{op.label} · {count(op.items.length, "registo", "registos")} recusado(s)</p>
          <p className="text-xs text-muted-foreground">{op.error}</p>
          <div className="mt-1 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { retryOp(op.id); void sync(); }}>Tentar de novo</Button>
            <Button size="sm" variant="ghost" onClick={() => discardOp(op.id)}>Descartar</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
