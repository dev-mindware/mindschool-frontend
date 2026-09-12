"use client";

import React, { useState } from "react";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { AbsenceJustification, JustificationStatus } from "@/types";
import { Button, Badge, Icon } from "@/components";
import { JustificationModal } from "./justification-modal";
import { toast } from "sonner";

interface JustificationsListProps {
  classId: string;
}

export function JustificationsList({ classId }: JustificationsListProps) {
  const { justifications, reviewJustification } = useStudentAttendanceStore();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredJustifications = justifications.filter((j) => {
    if (filterStatus === "ALL") return true;
    return j.status === filterStatus;
  });

  const handleApprove = (id: string) => {
    reviewJustification(
      id,
      "APPROVED",
      "Profª. Maria Teresa Diogo da Silva (Directora Pedagógica)",
      "Documentação em conformidade com o Regulamento Escolar."
    );
    toast.success("Justificação deferida com sucesso!");
  };

  const handleReject = (id: string) => {
    const reason = prompt("Indique o motivo do indeferimento:") || "Documentação incompleta ou fora do prazo legal.";
    reviewJustification(
      id,
      "REJECTED",
      "Profª. Maria Teresa Diogo da Silva (Directora Pedagógica)",
      reason
    );
    toast.error("Justificação indeferida.");
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={filterStatus === "ALL" ? "default" : "outline"}
            onClick={() => setFilterStatus("ALL")}
            className="text-xs"
          >
            Todas ({justifications.length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "PENDING" ? "default" : "outline"}
            onClick={() => setFilterStatus("PENDING")}
            className="text-xs"
          >
            Pendentes ({justifications.filter((j) => j.status === "PENDING").length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === "APPROVED" ? "default" : "outline"}
            onClick={() => setFilterStatus("APPROVED")}
            className="text-xs"
          >
            Deferidas ({justifications.filter((j) => j.status === "APPROVED").length})
          </Button>
        </div>

        <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5 text-xs">
          <Icon name={"Plus" as any} className="size-3.5" />
          Nova Justificação de Falta
        </Button>
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {filteredJustifications.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40 text-muted-foreground text-sm">
            Nenhuma justificação encontrada para o filtro seleccionado.
          </div>
        ) : (
          filteredJustifications.map((item) => {
            const isApproved = item.status === "APPROVED";
            const isPending = item.status === "PENDING";
            const isRejected = item.status === "REJECTED";

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {item.studentName}
                      </span>
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {item.className}
                      </Badge>
                      {item.documentRef && (
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          Doc: {item.documentRef}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-primary font-medium">
                      Motivo: {item.reasonLabel}
                    </div>
                  </div>

                  <div>
                    {isApproved && (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-xs">
                        <Icon name={"Check" as any} className="size-3" />
                        Deferida (Aprovada)
                      </Badge>
                    )}
                    {isPending && (
                      <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10 gap-1 text-xs">
                        <Icon name={"Clock" as any} className="size-3" />
                        Aguardando Parecer
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <Icon name={"X" as any} className="size-3" />
                        Indeferida
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <div>
                    Período de Ausência: <strong className="text-foreground">{new Date(item.startDate).toLocaleDateString("pt-PT")}</strong> até <strong className="text-foreground">{new Date(item.endDate).toLocaleDateString("pt-PT")}</strong>
                  </div>

                  {/* Actions for pending justifications */}
                  {isPending && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        onClick={() => handleReject(item.id)}
                      >
                        Indeferir
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleApprove(item.id)}
                      >
                        Deferir Falta
                      </Button>
                    </div>
                  )}

                  {item.reviewedBy && (
                    <div className="text-[11px] italic">
                      Parecer: {item.reviewedBy} em {item.reviewedAt}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <JustificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        classId={classId}
      />
    </div>
  );
}
