"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
} from "@/components";
import { FilterPopover } from "@/components/shared";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { useTransportStore } from "@/stores/school/transport-store";
import { BoardingStatus, DailyBoardingRecord } from "@/types";
import { toast } from "sonner";

export function BoardingControlView() {
  const { boardingLogs, routes, updateBoardingStatus } = useTransportStore();

  const [selectedRouteId, setSelectedRouteId] = useState<string>("ALL");
  const [selectedShift, setSelectedShift] = useState<string>("ALL");

  const routeOptions = [
    { value: "ALL", label: "Todas as Rotas" },
    ...routes.map((r) => ({ value: r.id, label: `${r.code}: ${r.name}` })),
  ];

  const shiftOptions = [
    { value: "ALL", label: "Todos os Turnos" },
    { value: "MORNING", label: "Manhã (Ida)" },
    { value: "AFTERNOON", label: "Tarde (Volta)" },
  ];

  const hasFilters = selectedRouteId !== "ALL" || selectedShift !== "ALL";

  const handleClearFilters = () => {
    setSelectedRouteId("ALL");
    setSelectedShift("ALL");
  };

  const filteredLogs = boardingLogs.filter((log) => {
    const matchRoute = selectedRouteId === "ALL" || log.routeId === selectedRouteId;
    const matchShift = selectedShift === "ALL" || log.shift === selectedShift;
    return matchRoute && matchShift;
  });

  const handleStatusChange = (
    logId: string,
    newStatus: BoardingStatus,
    studentName: string
  ) => {
    updateBoardingStatus(logId, newStatus);
    toast.success(`Estado de ${studentName} actualizado com sucesso.`);
  };

  return (
    <div className="space-y-4">
      {/* MindGest Standard Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Rota"
            icon="MapPin"
            options={routeOptions}
            value={selectedRouteId === "ALL" ? null : selectedRouteId}
            onChange={(val) => setSelectedRouteId(val ?? "ALL")}
          />

          <FilterPopover
            label="Turno"
            icon="Clock"
            options={shiftOptions}
            value={selectedShift === "ALL" ? null : selectedShift}
            onChange={(val) => setSelectedShift(val ?? "ALL")}
          />

          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>📅 Data: <strong>{new Date().toLocaleDateString("pt-AO")}</strong></span>
        </div>
      </div>

      {/* Boarding Table */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-3">Estudante</th>
                <th className="py-2.5 px-3">Rota</th>
                <th className="py-2.5 px-3">Paragem Designada</th>
                <th className="py-2.5 px-3">Turno</th>
                <th className="py-2.5 px-3">Estado de Embarque</th>
                <th className="py-2.5 px-3">Registo & Monitor(a)</th>
                <th className="py-2.5 px-3 text-right">Actualizar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Icon name="Bus" className="size-8 mx-auto mb-2 opacity-40" />
                    Nenhum registo de embarque encontrado para os filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{log.studentName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {log.studentNumber}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground font-medium">
                      {log.routeName}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-foreground font-medium">{log.stopName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px]">
                        {log.shift === "MORNING" ? "Ida (Manhã)" : "Volta (Tarde)"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <SchoolStatusBadge status={log.status} />
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                      {log.checkedAt ? (
                        <span>
                          {log.checkedAt} • {log.checkedBy || "Monitor(a)"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {log.status !== "BOARDED" && log.status !== "DROPPED_OFF" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                            onClick={() =>
                              handleStatusChange(log.id, "BOARDED", log.studentName)
                            }
                          >
                            Embarcou
                          </Button>
                        )}

                        {log.status === "BOARDED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                            onClick={() =>
                              handleStatusChange(log.id, "DROPPED_OFF", log.studentName)
                            }
                          >
                            Desembarcou
                          </Button>
                        )}

                        {log.status !== "ABSENT_NOTIFIED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                            onClick={() =>
                              handleStatusChange(log.id, "ABSENT_NOTIFIED", log.studentName)
                            }
                          >
                            Falta
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
