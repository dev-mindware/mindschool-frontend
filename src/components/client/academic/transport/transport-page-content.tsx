"use client";

import { Can, Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useTransport } from "@/hooks/school/use-transport";
import { useModal } from "@/stores/modal/use-modal-store";
import { RoutesManagementView } from "./routes-management-view";
import { NewRouteModal } from "./new-route-modal";
import { AssignStudentTransportModal } from "./assign-student-transport-modal";
import { RouteManifestPrintModal } from "./route-manifest-print-modal";

export function TransportPageContent() {
  const { metrics } = useTransport();
  const { openModal } = useModal();

  return (
    <div className="space-y-6">
      <TitleList title="Transporte Escolar & Rotas" suTitle="Rotas, paragens, viaturas, motoristas e alunos transportados (a lotação da viatura é respeitada).">
        <div className="flex items-center gap-2">
          <Can permission="transport:write"><Button size="sm" variant="outline" className="gap-1.5" onClick={() => openModal("transport-assign")}><Icon name="UserPlus" className="size-4" />Alocar aluno</Button></Can>
          <Can permission="transport:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("transport-new-route")}><Icon name="Plus" className="size-4" />Nova rota</Button></Can>
        </div>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={metrics.activeRoutes} subtitle="Itinerários activos" description="Rotas em operação" icon="MapPin" />
        <DynamicMetricCard title={metrics.students} subtitle="Alunos alocados" description="Com rota e paragem definidas" icon="Users" />
        <DynamicMetricCard title={metrics.seats} subtitle="Capacidade das viaturas" description="Soma das rotas activas" icon="Bus" />
        <DynamicMetricCard title={metrics.free} subtitle="Lugares disponíveis" description="Para novas alocações" icon="CircleCheck" />
      </div>

      <RoutesManagementView />

      <NewRouteModal />
      <AssignStudentTransportModal />
      <RouteManifestPrintModal />
    </div>
  );
}
