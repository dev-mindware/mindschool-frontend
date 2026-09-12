"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Badge,
  Icon,
} from "@/components";
import { SchoolCircular, RsvpStatus } from "@/types";
import { useCircularStore } from "@/stores/school/circular-store";
import { toast } from "sonner";

interface RsvpTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circular: SchoolCircular | null;
}

export function RsvpTrackerModal({
  open,
  onOpenChange,
  circular,
}: RsvpTrackerModalProps) {
  const { updateRsvpStatus } = useCircularStore();

  if (!circular || !circular.rsvpList) return null;

  const confirmedCount = circular.rsvpList.filter((r) => r.status === "CONFIRMED").length;
  const declinedCount = circular.rsvpList.filter((r) => r.status === "DECLINED").length;
  const pendingCount = circular.rsvpList.filter((r) => r.status === "PENDING").length;
  const total = circular.rsvpList.length;
  const confirmationRate = Math.round((confirmedCount / Math.max(1, total)) * 100);

  const handleStatusChange = (guardianId: string, status: RsvpStatus) => {
    let notes: string | undefined = undefined;
    if (status === "DECLINED") {
      notes = prompt("Motivo da ausência indicado pelo encarregado:") || "Ausência justificada por motivos particulares.";
    }
    updateRsvpStatus(circular.id, guardianId, status, notes);
    toast.success("Resposta do encarregado actualizada!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Icon name={"Users" as any} className="size-4 text-primary" />
              Controlo de Presenças (RSVP) • {circular.circularNumber}
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              {circular.audienceLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {circular.title}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Meeting Quick Bar */}
          {circular.eventDate && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <Icon name={"Calendar" as any} className="size-3.5 text-primary" />
                  {new Date(circular.eventDate).toLocaleDateString("pt-PT")} às {circular.eventTime}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon name={"MapPin" as any} className="size-3.5" />
                  {circular.eventLocation}
                </span>
              </div>
              <div className="font-semibold text-primary">
                Taxa de Confirmação: {confirmationRate}%
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-center">
              <div className="text-[11px] text-emerald-700 font-medium">Confirmaram Presença</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{confirmedCount}</div>
            </div>

            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 text-center">
              <div className="text-[11px] text-rose-700 font-medium">Não Poderão Comparecer</div>
              <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">{declinedCount}</div>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-center">
              <div className="text-[11px] text-amber-700 font-medium">Aguardam Resposta</div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">{pendingCount}</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5">Encarregado de Educação</th>
                    <th className="px-4 py-2.5">Educando / Turma</th>
                    <th className="px-4 py-2.5 text-center">Estado da Resposta</th>
                    <th className="px-4 py-2.5">Observações</th>
                    <th className="px-4 py-2.5 text-right">Alterar Resposta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {circular.rsvpList.map((item) => (
                    <tr key={item.guardianId} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{item.guardianName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{item.guardianPhone}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{item.studentName}</div>
                        <div className="text-[10px] text-muted-foreground">{item.className}</div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {item.status === "CONFIRMED" && (
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            Presença Confirmada
                          </Badge>
                        )}
                        {item.status === "DECLINED" && (
                          <Badge variant="destructive" className="text-[10px]">
                            Ausência Justificada
                          </Badge>
                        )}
                        {item.status === "PENDING" && (
                          <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 text-[10px]">
                            Aguardando
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-muted-foreground italic">
                        {item.notes || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.guardianId, "CONFIRMED")}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                            title="Confirmar Presença"
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item.guardianId, "DECLINED")}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
                            title="Justificar Ausência"
                          >
                            Não
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
