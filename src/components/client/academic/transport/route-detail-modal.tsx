"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, EmptyState, FormModal, Input } from "@/components";
import { useTransport } from "@/hooks/school/use-transport";
import { getApiErrorMessage } from "@/utils/api-error";

/** Paragens da rota (com adição de nova paragem) e passageiros por paragem. */
export function RouteDetailModal({ routeId }: { routeId: string | null }) {
  const { routes, assignments, nameOf, addStop } = useTransport();
  const [stop, setStop] = useState("");
  const route = routes.find((r) => r.id === routeId);
  const riders = assignments.filter((a) => a.route_id === routeId);

  return (
    <FormModal id="transport-route-detail" title={route?.name ?? "Rota"} description={route ? `${route.vehicle_plate ?? "Sem viatura"} • ${route.driver_name ?? "Sem motorista"} • ${route.occupied}/${route.capacity} lugares` : undefined} size="lg" readOnly onSubmit={() => undefined}>
      {route && (
        <div className="sm:col-span-2 space-y-4 text-sm">
          <ol className="space-y-3">
            {route.stops.length === 0 && (
              <EmptyState
                icon="MapPin"
                title="Sem paragens"
                description="Adicione a primeira paragem no formulário abaixo."
              />
            )}
            {route.stops.map((s) => {
              const list = riders.filter((a) => a.stop_id === s.id);
              return (
                <li key={s.id} className="rounded-xs border p-3">
                  <div className="flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-mono text-xs text-primary">{s.order_index}</span><span className="flex-1 font-medium">{s.name}</span><span className="font-mono text-xs text-muted-foreground">{s.pickup_time ?? ""}</span><Badge variant="outline">{list.length}</Badge></div>
                  {list.length > 0 && <ul className="mt-2 list-disc pl-10 text-xs text-muted-foreground">{list.map((a) => <li key={a.id}>{nameOf.get(a.student_id) ?? "Aluno"}</li>)}</ul>}
                </li>
              );
            })}
          </ol>
          <div className="flex items-end gap-2 border-t pt-3">
            <div className="flex-1"><Input label="Nova paragem" value={stop} onChange={(e) => setStop(e.target.value)} placeholder="Nome da paragem" /></div>
            <Button size="sm" className="h-10" disabled={stop.trim().length < 2 || addStop.isPending} onClick={() => addStop.mutateAsync({ routeId: route.id, name: stop.trim() }).then(() => { SucessMessage("Paragem adicionada."); setStop(""); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Adicionar</Button>
          </div>
        </div>
      )}
    </FormModal>
  );
}
