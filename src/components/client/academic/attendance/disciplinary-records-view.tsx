"use client";

import React, { useState } from "react";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { DisciplinaryOccurrence, DisciplinarySeverity } from "@/types";
import { Button, Badge, Icon } from "@/components";
import { DisciplinaryModal } from "./disciplinary-modal";
import { toast } from "sonner";

interface DisciplinaryRecordsViewProps {
  classId: string;
}

export function DisciplinaryRecordsView({ classId }: DisciplinaryRecordsViewProps) {
  const { disciplinaryOccurrences, resolveDisciplinaryOccurrence } = useStudentAttendanceStore();
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = disciplinaryOccurrences.filter((d) => {
    if (filterSeverity === "ALL") return true;
    return d.severity === filterSeverity;
  });

  const handleResolve = (id: string) => {
    resolveDisciplinaryOccurrence(id);
    toast.success("Ocorrência marcada como resolvida com termo assinado!");
  };

  const getSeverityBadge = (sev: DisciplinarySeverity) => {
    switch (sev) {
      case "HIGH":
        return (
          <Badge variant="destructive" className="gap-1 text-xs">
            <Icon name={"Flame" as any} className="size-3" />
            Infração Grave
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10 gap-1 text-xs">
            <Icon name={"TriangleAlert" as any} className="size-3" />
            Infração Média
          </Badge>
        );
      case "LOW":
      default:
        return (
          <Badge variant="secondary" className="gap-1 text-xs">
            <Icon name={"Info" as any} className="size-3" />
            Infração Leve
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filterSeverity === "ALL" ? "default" : "outline"}
            onClick={() => setFilterSeverity("ALL")}
            className="text-xs"
          >
            Todas ({disciplinaryOccurrences.length})
          </Button>
          <Button
            size="sm"
            variant={filterSeverity === "LOW" ? "default" : "outline"}
            onClick={() => setFilterSeverity("LOW")}
            className="text-xs"
          >
            Leves ({disciplinaryOccurrences.filter((d) => d.severity === "LOW").length})
          </Button>
          <Button
            size="sm"
            variant={filterSeverity === "MEDIUM" ? "default" : "outline"}
            onClick={() => setFilterSeverity("MEDIUM")}
            className="text-xs"
          >
            Médias ({disciplinaryOccurrences.filter((d) => d.severity === "MEDIUM").length})
          </Button>
          <Button
            size="sm"
            variant={filterSeverity === "HIGH" ? "default" : "outline"}
            onClick={() => setFilterSeverity("HIGH")}
            className="text-xs"
          >
            Graves ({disciplinaryOccurrences.filter((d) => d.severity === "HIGH").length})
          </Button>
        </div>

        <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5 text-xs">
          <Icon name={"ShieldAlert" as any} className="size-3.5" />
          Lavrar Nova Ocorrência
        </Button>
      </div>

      {/* Occurrences List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40 text-muted-foreground text-sm">
            Nenhum registo disciplinar encontrado para este filtro.
          </div>
        ) : (
          filtered.map((item) => {
            const isResolved = item.status === "RESOLVED";

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
                      <span className="text-xs text-muted-foreground">
                        • {new Date(item.date).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                    <div className="font-medium text-xs text-foreground">
                      {item.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    {isResolved ? (
                      <Badge className="bg-emerald-600 text-white text-xs">
                        Resolvido
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-rose-400 text-rose-600 bg-rose-50 text-xs">
                        Em Acompanhamento
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  {item.description}
                </p>

                <div className="text-xs space-y-1">
                  <div className="text-muted-foreground">
                    <strong className="text-foreground">Medida Adotada:</strong> {item.actionTaken}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <span>Reportado por: <strong>{item.reportedBy}</strong></span>
                      {item.parentNotified && (
                        <span className="flex items-center gap-1 text-primary">
                          <Icon name={"MessageSquare" as any} className="size-3" />
                          Encarregado Notificado
                        </span>
                      )}
                    </div>

                    {!isResolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-emerald-600 hover:bg-emerald-50 border-emerald-300"
                        onClick={() => handleResolve(item.id)}
                      >
                        <Icon name={"CircleCheck" as any} className="size-3.5 mr-1" />
                        Concluir e Arquivar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <DisciplinaryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        classId={classId}
      />
    </div>
  );
}
