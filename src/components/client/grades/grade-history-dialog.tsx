"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Icon } from "@/components";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { gradesService, type GradeField, type GradeState } from "@/services/grades-service";
import { formatDateTime } from "@/utils";

const FIELD_LABEL: Record<GradeField, string> = { continuousAssessment: "MAC", teacherTest: "NPP", termExam: "NPT" };
const STATE_LABEL: Record<GradeState, string> = { avaliado: "", ausente: "Ausente", dispensado: "Dispensado", nao_avaliado: "Não avaliado" };

interface GradeHistoryDialogProps {
  assessmentIds: Partial<Record<GradeField, string>>;
  cacheKey: string;
}

/** Historial das notas da mini-pauta: cada versão lançada, por quem e quando (as notas nunca se perdem, corrigem-se). */
export function GradeHistoryDialog({ assessmentIds, cacheKey }: GradeHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const hasAny = Object.keys(assessmentIds).length > 0;
  const history = useQuery({
    queryKey: ["grade-history", cacheKey, assessmentIds],
    queryFn: () => gradesService.history(assessmentIds),
    enabled: open && hasAny,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={!hasAny}>
          <Icon name="History" className="size-4" />
          Historial de notas
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="p-0">
          <SheetTitle>Historial de notas</SheetTitle>
          <SheetDescription>Cada nota lançada ou corrigida nesta mini-pauta, com quem a registou e quando. Mostra as últimas alterações.</SheetDescription>
        </SheetHeader>
        {history.isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">A carregar o historial…</p>
        ) : history.isError ? (
          <p className="py-6 text-center text-sm text-destructive">Não foi possível carregar o historial.</p>
        ) : (history.data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Ainda não há notas lançadas nesta mini-pauta.</p>
        ) : (
          <ul className="divide-y text-sm">
            {history.data!.map((v) => (
              <li key={`${v.enrollmentId}-${v.field}-${v.versionNumber}`} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{v.studentName}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.recordedBy} · {formatDateTime(v.recordedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{FIELD_LABEL[v.field]}</Badge>
                  <span className="w-14 text-right font-mono">{v.value !== undefined ? v.value.toFixed(1) : STATE_LABEL[v.status] || "—"}</span>
                  <Badge variant={v.isCurrent ? "success" : "secondary"}>{v.isCurrent ? "Atual" : `v${v.versionNumber}`}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
