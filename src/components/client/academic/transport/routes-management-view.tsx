"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
} from "@/components";
import { SearchHandlerWrapper } from "@/components/common";
import { useTransportStore } from "@/stores/school/transport-store";
import { TransportRoute } from "@/types";

interface RoutesManagementViewProps {
  onOpenNewRoute: () => void;
  onOpenAssignStudent: (routeId?: string) => void;
  onPrintManifest: (route: TransportRoute) => void;
}

export function RoutesManagementView({
  onOpenNewRoute,
  onOpenAssignStudent,
  onPrintManifest,
}: RoutesManagementViewProps) {
  const { routes, assignments } = useTransportStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutes = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.stops.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <SearchHandlerWrapper
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Pesquisar por rota, paragem, motorista..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenAssignStudent()}
            className="gap-1.5 text-xs h-8"
          >
            <Icon name="UserPlus" className="size-3.5 text-primary" />
            Alocar Aluno
          </Button>
          <Button
            size="sm"
            onClick={onOpenNewRoute}
            className="gap-1.5 text-xs h-8"
          >
            <Icon name="Plus" className="size-3.5" />
            Nova Rota
          </Button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRoutes.map((route) => {
          const occupancyRate = Math.round(
            (route.assignedStudentsCount / route.maxCapacity) * 100
          );
          const isFull = route.assignedStudentsCount >= route.maxCapacity;

          return (
            <div
              key={route.id}
              className="p-4 rounded-lg border bg-card hover:border-primary/40 transition-colors space-y-4 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-[11px] font-bold">
                        {route.code}
                      </Badge>
                      <h3 className="font-semibold text-sm text-foreground">
                        {route.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Turno:{" "}
                      {route.shift === "BOTH"
                        ? "Manhã & Tarde"
                        : route.shift === "MORNING"
                        ? "Apenas Manhã"
                        : "Apenas Tarde"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    title="Imprimir Guia Oficial A4 para o motorista"
                    onClick={() => onPrintManifest(route)}
                  >
                    <Icon name="Printer" className="size-3" />
                    Guia A4
                  </Button>
                </div>

                {/* Occupancy progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Lotação da Rota:</span>
                    <span className={`font-semibold ${isFull ? "text-destructive" : "text-foreground"}`}>
                      {route.assignedStudentsCount} / {route.maxCapacity} alunos ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull
                          ? "bg-destructive"
                          : occupancyRate > 80
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Crew details */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Viatura & Placa</span>
                  <span className="font-semibold font-mono text-foreground">{route.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Motorista</span>
                  <span className="font-medium text-foreground">{route.driverName}</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">{route.driverPhone}</span>
                </div>
                <div className="col-span-2 pt-1 border-t flex items-center justify-between text-[11px]">
                  <span><strong>Monitor(a):</strong> {route.monitorName}</span>
                  <span className="font-mono text-muted-foreground">{route.monitorPhone}</span>
                </div>
              </div>

              {/* Stops list */}
              <div className="space-y-1.5 border-t pt-2 text-xs">
                <span className="font-semibold text-[11px] text-foreground block">
                  Itinerário de Paragens ({route.stops.length}):
                </span>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {route.stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center justify-between text-[11px] p-1.5 rounded bg-muted/10"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-primary">{stop.order}.</span>
                        <span className="truncate text-foreground">{stop.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground shrink-0 ml-2">
                        {stop.estimatedPickupTime} ➔ {stop.estimatedDropoffTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 text-primary"
                  onClick={() => onOpenAssignStudent(route.id)}
                >
                  <Icon name="UserPlus" className="size-3.5 mr-1" />
                  Alocar Novo Estudante
                </Button>

                <span className="text-[11px] text-muted-foreground font-mono">
                  {route.stops.length} Paragens
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
