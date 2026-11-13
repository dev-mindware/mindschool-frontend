"use client";

import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, ButtonOnlyAction, DataList, Tabs, TabsContent, TabsList, TabsTrigger, type Column } from "@/components";
import { useTransport } from "@/hooks/school/use-transport";
import type { ApiRoute, ApiTransportAssignment } from "@/services/transport-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { RouteDetailModal } from "./route-detail-modal";
import { useState } from "react";

const err = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar os dados da rota de transporte. Tente novamente."));

/** Rotas e alunos transportados: listas com filtros; paragens, passageiros e impressão abrem em modais. */
export function RoutesManagementView() {
  const { routes, assignments, nameOf, isLoading, setActive, endAssignment } = useTransport();
  const { openModal } = useModal();
  const [detailId, setDetailId] = useState<string | null>(null);

  const routeName = (id: string) => routes.find((r) => r.id === id)?.name ?? "—";
  const stopName = (a: ApiTransportAssignment) => routes.find((r) => r.id === a.route_id)?.stops.find((s) => s.id === a.stop_id)?.name ?? "—";

  const routeColumns: Column<ApiRoute>[] = [
    { key: "name", header: "Rota", render: (_, r) => (<div className="flex flex-col"><span className="font-medium">{r.name}</span><span className="text-xs text-muted-foreground">{r.stops.length} paragem(ns)</span></div>) },
    { key: "vehicle_plate", header: "Viatura", render: (_, r) => <span className="font-mono text-xs">{r.vehicle_plate ?? "—"}</span> },
    { key: "driver_name", header: "Motorista", render: (_, r) => (<div className="flex flex-col"><span>{r.driver_name ?? "—"}</span><span className="text-xs text-muted-foreground">{r.driver_phone ?? ""}</span></div>) },
    { key: "occupied", header: "Ocupação", render: (_, r) => <Badge variant={r.seats_free === 0 ? "destructive" : "outline"} className="font-mono">{r.occupied}/{r.capacity}</Badge> },
    { key: "is_active", header: "Estado", render: (_, r) => (r.is_active ? <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Ativa</Badge> : <Badge variant="secondary">Inactiva</Badge>) },
    {
      key: "action", header: "Ação",
      render: (_, r) => (
        <ButtonOnlyAction data={r} actions={[
          { permission: "transport:write", label: "Paragens e passageiros", icon: "Route", onClick: (x) => { setDetailId(x.id); openModal("transport-route-detail"); } },
          { permission: "transport:write", label: "Alocar aluno", icon: "UserPlus", onClick: (x) => openModal("transport-assign", { routeId: x.id }), className: !r.is_active || r.seats_free === 0 ? "pointer-events-none opacity-40" : "" },
          { permission: "transport:write", label: "Lista de passageiros (PDF)", icon: "FileDown", onClick: (x) => openModal("transport-manifest", { routeId: x.id }) },
          { permission: "transport:write", label: r.is_active ? "Desativar rota" : "Ativar rota", icon: "CirclePower", onClick: (x) => void setActive.mutateAsync({ id: x.id, isActive: !x.is_active }).then(() => SucessMessage(x.is_active ? "Rota desativada." : "Rota ativada.")).catch(err) },
        ]} />
      ),
    },
  ];

  const riderColumns: Column<ApiTransportAssignment>[] = [
    { key: "student_id", header: "Aluno", render: (_, a) => <span className="font-medium">{nameOf.get(a.student_id) ?? "Aluno"}</span> },
    { key: "route_id", header: "Rota", render: (_, a) => routeName(a.route_id) },
    { key: "stop_id", header: "Paragem", render: (_, a) => stopName(a) },
    { key: "valid_from", header: "Desde", render: (_, a) => <span className="font-mono text-xs">{a.valid_from}</span> },
    { key: "action", header: "Ação", render: (_, a) => <ButtonOnlyAction data={a} actions={[{ permission: "transport:write", label: "Terminar alocação", icon: "UserX", variant: "destructive", onClick: (x) => void endAssignment.mutateAsync(x.id).then(() => SucessMessage("Alocação terminada.")).catch(err) }]} /> },
  ];

  return (
    <>
      <Tabs defaultValue="routes" className="space-y-2">
        <TabsList>
          <TabsTrigger value="routes">Rotas ({routes.length})</TabsTrigger>
          <TabsTrigger value="riders">Alunos transportados ({assignments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="routes">
          <DataList<ApiRoute>
            prefix="routes"
            rows={routes}
            columns={routeColumns}
            isLoading={isLoading}
            searchPlaceholder="Pesquisar por rota, paragem, motorista ou matrícula"
            searchText={(r) => `${r.name} ${r.driver_name ?? ""} ${r.vehicle_plate ?? ""} ${r.stops.map((s) => s.name).join(" ")}`}
            filters={[
              { key: "status", label: "Estado", icon: "Tag", options: [{ value: "active", label: "Ativa" }, { value: "inactive", label: "Inactiva" }], match: (r, v) => (v === "active" ? r.is_active : !r.is_active) },
              { key: "occupancy", label: "Lotação", icon: "Armchair", options: [{ value: "available", label: "Com lugares livres" }, { value: "full", label: "Lotada" }], match: (r, v) => (v === "available" ? r.seats_free > 0 : r.seats_free === 0) },
              { key: "vehicle", label: "Viatura", icon: "Bus", options: [{ value: "with", label: "Com viatura" }, { value: "without", label: "Sem viatura" }], match: (r, v) => (v === "with" ? Boolean(r.vehicle_plate) : !r.vehicle_plate) },
            ]}
            sorts={[{ value: "name", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name) }, { value: "occupancy", label: "Ocupação", compare: (a, b) => a.occupied - b.occupied }, { value: "capacity", label: "Capacidade", compare: (a, b) => a.capacity - b.capacity }]}
            emptyTitle="Nenhuma rota registada"
            emptyDescription="Crie a primeira rota de transporte."
            emptyIcon="Bus"
          />
        </TabsContent>
        <TabsContent value="riders">
          <DataList<ApiTransportAssignment>
            prefix="passengers"
            rows={assignments}
            columns={riderColumns}
            isLoading={isLoading}
            searchPlaceholder="Pesquisar por aluno, rota ou paragem"
            searchText={(a) => `${nameOf.get(a.student_id) ?? ""} ${routeName(a.route_id)} ${stopName(a)}`}
            filters={[{ key: "route", label: "Rota", icon: "Route", options: routes.map((r) => ({ value: r.id, label: r.name })), match: (a, v) => a.route_id === v }]}
            dateFilters={[{ key: "assigned", label: "Alocado", getDate: (a) => a.valid_from }]}
            sorts={[{ value: "student", label: "Aluno", compare: (a, b) => (nameOf.get(a.student_id) ?? "").localeCompare(nameOf.get(b.student_id) ?? "") }, { value: "date", label: "Data", compare: (a, b) => a.valid_from.localeCompare(b.valid_from) }]}
            emptyTitle="Nenhum aluno alocado"
            emptyIcon="Users"
          />
        </TabsContent>
      </Tabs>
      <RouteDetailModal routeId={detailId} />
    </>
  );
}
