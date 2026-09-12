"use client";

import React, { useState } from "react";
import { useTransportStore } from "@/stores/school/transport-store";
import { RoutesManagementView } from "./routes-management-view";
import { BoardingControlView } from "./boarding-control-view";
import { FleetManagementView } from "./fleet-management-view";
import { NewRouteModal } from "./new-route-modal";
import { AssignStudentTransportModal } from "./assign-student-transport-modal";
import { RouteManifestPrintModal } from "./route-manifest-print-modal";
import { TransportRoute } from "@/types";
import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function TransportPageContent() {
  const { routes, vehicles, assignments, boardingLogs } = useTransportStore();

  const [activeTab, setActiveTab] = useState<string>("ROUTES");
  const [newRouteModalOpen, setNewRouteModalOpen] = useState(false);
  const [assignStudentModalOpen, setAssignStudentModalOpen] = useState(false);
  const [printManifestModalOpen, setPrintManifestModalOpen] = useState(false);
  const [selectedRouteForPrint, setSelectedRouteForPrint] = useState<TransportRoute | null>(null);
  const [targetRouteIdForAssign, setTargetRouteIdForAssign] = useState<string | undefined>(undefined);

  // Metrics
  const activeRoutes = routes.filter((r) => r.isActive).length;
  const totalStudentsTransported = assignments.filter((a) => a.isActive).length;
  const totalFleetCapacity = vehicles.reduce((acc, v) => acc + v.capacity, 0);
  const boardedOrDroppedCount = boardingLogs.filter(
    (l) => l.status === "BOARDED" || l.status === "DROPPED_OFF"
  ).length;
  const boardingRate = boardingLogs.length > 0
    ? Math.round((boardedOrDroppedCount / boardingLogs.length) * 100)
    : 100;

  const handlePrintManifest = (route: TransportRoute) => {
    setSelectedRouteForPrint(route);
    setPrintManifestModalOpen(true);
  };

  const handleOpenAssignStudent = (routeId?: string) => {
    setTargetRouteIdForAssign(routeId);
    setAssignStudentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Transporte Escolar & Rotas"
        suTitle="Gestão de frotas, itinerários e controlo de embarque diário."
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenAssignStudent()}
            variant="outline"
            className="gap-1.5 shadow-xs text-xs"
          >
            <Icon name="UserPlus" className="size-3.5" />
            Alocar Aluno
          </Button>

          <Button
            size="sm"
            onClick={() => setNewRouteModalOpen(true)}
            className="gap-1.5 shadow-xs text-xs"
          >
            <Icon name="Plus" className="size-3.5" />
            Nova Rota
          </Button>
        </div>
      </TitleList>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${activeRoutes} Rotas`}
          subtitle="Itinerários Activos"
          description="Cobertura de bairros e centralidades"
          icon="MapPin"
        />

        <DynamicMetricCard
          title={`${totalStudentsTransported} Alunos`}
          subtitle="Estudantes Alocados"
          description="Passageiros frequentes no ano lectivo"
          icon="Users"
        />

        <DynamicMetricCard
          title={`${totalFleetCapacity} Lugares`}
          subtitle="Capacidade da Frota"
          description={`${vehicles.length} viaturas activas em circulação`}
          icon="Bus"
        />

        <DynamicMetricCard
          title={`${boardingRate}%`}
          subtitle="Taxa de Embarque Hoje"
          description={`${boardedOrDroppedCount} de ${boardingLogs.length} passageiros confirmados`}
          icon="CircleCheck"
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-[540px]">
          <TabsTrigger value="ROUTES" className="gap-1.5 text-xs">
            <Icon name="Route" className="size-3.5" />
            Rotas & Itinerários
          </TabsTrigger>
          <TabsTrigger value="BOARDING" className="gap-1.5 text-xs">
            <Icon name="ClipboardCheck" className="size-3.5" />
            Controlo de Embarque
          </TabsTrigger>
          <TabsTrigger value="FLEET" className="gap-1.5 text-xs">
            <Icon name="Bus" className="size-3.5" />
            Frota & Motoristas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ROUTES" className="space-y-4">
          <RoutesManagementView
            onOpenNewRoute={() => setNewRouteModalOpen(true)}
            onOpenAssignStudent={handleOpenAssignStudent}
            onPrintManifest={handlePrintManifest}
          />
        </TabsContent>

        <TabsContent value="BOARDING" className="space-y-4">
          <BoardingControlView />
        </TabsContent>

        <TabsContent value="FLEET" className="space-y-4">
          <FleetManagementView />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewRouteModal
        open={newRouteModalOpen}
        onOpenChange={setNewRouteModalOpen}
      />

      <AssignStudentTransportModal
        open={assignStudentModalOpen}
        onOpenChange={setAssignStudentModalOpen}
        preselectedRouteId={targetRouteIdForAssign}
      />

      <RouteManifestPrintModal
        open={printManifestModalOpen}
        onOpenChange={setPrintManifestModalOpen}
        route={selectedRouteForPrint}
        assignments={assignments}
      />
    </div>
  );
}
