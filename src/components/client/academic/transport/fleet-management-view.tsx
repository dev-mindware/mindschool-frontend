"use client";

import React from "react";
import {
  Badge,
  Icon,
} from "@/components";
import { useTransportStore } from "@/stores/school/transport-store";

export function FleetManagementView() {
  const { vehicles } = useTransportStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Icon name="Bus" className="size-4 text-primary" />
            Frota de Autocarros & Viaturas Escolares
          </h3>
          <p className="text-xs text-muted-foreground">
            Acompanhamento de capacidade de lugares, inspecção técnica periódica e seguros obrigatórios
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((veh) => {
          const isInspectionSoon =
            new Date(veh.inspectionExpiryDate).getTime() - Date.now() <
            45 * 24 * 60 * 60 * 1000;

          return (
            <div
              key={veh.id}
              className="p-4 rounded-lg border bg-card space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {veh.plateNumber}
                  </Badge>
                  <h4 className="font-semibold text-sm text-foreground mt-1">
                    {veh.model}
                  </h4>
                </div>

                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {veh.capacity} Lugares
                </Badge>
              </div>

              {/* Driver and monitor */}
              <div className="space-y-1.5 text-xs bg-muted/20 p-2.5 rounded border">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Motorista:</span>
                  <span className="font-medium text-foreground">{veh.driverName}</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {veh.driverPhone}
                  </span>
                </div>
                <div className="border-t pt-1">
                  <span className="text-[10px] text-muted-foreground block">Monitor(a) de Bordo:</span>
                  <span className="font-medium text-foreground">{veh.monitorName}</span>
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    {veh.monitorPhone}
                  </span>
                </div>
              </div>

              {/* Legal & safety docs */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Inspecção Técnica:</span>
                  <span className={`font-mono ${isInspectionSoon ? "text-amber-600 font-bold" : "text-foreground"}`}>
                    {veh.inspectionExpiryDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Seguro Automóvel:</span>
                  <span className="font-mono text-foreground">{veh.insuranceExpiryDate}</span>
                </div>
              </div>

              {veh.notes && (
                <p className="text-[11px] text-muted-foreground italic border-t pt-2">
                  {veh.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
