"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  FormSelect,
  Icon,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { useTeacherAvailability } from "@/hooks/school/use-admin-school";
import { cn } from "@/lib/utils";
import type { ApiAvailabilityBlock } from "@/services/admin-school-service";
import type { ApiBellSchedule, Shift } from "@/services/timetables-service";
import type { TeacherAssignment } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const WEEKDAY_SHORT: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  7: "Dom",
};

const WEEKDAY_FULL: Record<number, string> = {
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
  7: "Domingo",
};

const DEFAULT_SHIFT_WINDOWS: Array<{ key: Shift; label: string; start: string; end: string }> = [
  { key: "manha", label: "Manhã", start: "07:30", end: "12:30" },
  { key: "tarde", label: "Tarde", start: "13:00", end: "18:00" },
  { key: "noite", label: "Noite", start: "17:00", end: "21:30" },
];

const toMin = (hhmm: string): number => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string): boolean =>
  toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd);

interface TeacherAvailabilitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: { id: string; full_name: string } | null;
  teachers?: Array<{ id: string; full_name: string }>;
  onSelectTeacher?: (teacherId: string) => void;
  assignments?: TeacherAssignment[];
  bells?: ApiBellSchedule[];
  lectiveWeekdays?: number[];
  onSaved?: () => void;
}

/**
 * Editor visual da disponibilidade semanal do professor.
 * Nota de domínio: a API regista blocos de INDISPONIBILIDADE (`TeacherAvailability`).
 * Aqui traduzimos em células verdes (Disponível) vs vermelhas (Indisponível) para edição imediata.
 */
export function TeacherAvailabilitySheet({
  open,
  onOpenChange,
  teacher,
  teachers,
  onSelectTeacher,
  assignments = [],
  bells = [],
  lectiveWeekdays,
  onSaved,
}: TeacherAvailabilitySheetProps) {
  const activeId = teacher?.id ?? teachers?.[0]?.id;
  const activeName =
    teacher?.full_name ??
    teachers?.find((t) => t.id === activeId)?.full_name ??
    "Professor";

  const { blocks, isLoading, save } = useTeacherAvailability(open ? activeId : undefined);
  const [draft, setDraft] = useState<ApiAvailabilityBlock[]>([]);
  const [customDay, setCustomDay] = useState("1");
  const [customStart, setCustomStart] = useState("07:30");
  const [customEnd, setCustomEnd] = useState("09:00");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(blocks.map((b) => ({ ...b })));
    }
  }, [open, blocks, activeId]);

  const weekdays = useMemo(() => {
    const base = lectiveWeekdays && lectiveWeekdays.length > 0 ? lectiveWeekdays : [1, 2, 3, 4, 5];
    const extraDays = draft.map((b) => b.weekday).filter((d) => !base.includes(d));
    return [...new Set([...base, ...extraDays])].sort((a, b) => a - b);
  }, [lectiveWeekdays, draft]);

  const shiftWindows = useMemo(() => {
    return DEFAULT_SHIFT_WINDOWS.map((def) => {
      const bell = bells.find((b) => b.shift === def.key);
      const aulas = bell?.slots.filter((s) => s.kind === "aula") ?? [];
      if (aulas.length === 0) return def;
      return {
        ...def,
        start: aulas[0]!.start,
        end: aulas[aulas.length - 1]!.end,
      };
    });
  }, [bells]);

  const isShiftBlocked = (weekday: number, start: string, end: string) =>
    draft.some((b) => b.weekday === weekday && toMin(b.start) <= toMin(start) && toMin(b.end) >= toMin(end));

  const isShiftPartial = (weekday: number, start: string, end: string) =>
    !isShiftBlocked(weekday, start, end) && draft.some((b) => b.weekday === weekday && overlaps(b.start, b.end, start, end));

  const toggleShiftBlock = (weekday: number, start: string, end: string, label: string) => {
    if (isShiftBlocked(weekday, start, end) || isShiftPartial(weekday, start, end)) {
      setDraft((prev) =>
        prev.filter((b) => !(b.weekday === weekday && overlaps(b.start, b.end, start, end))),
      );
    } else {
      if (draft.length >= 60) {
        ErrorMessage("Limite máximo de 60 blocos de indisponibilidade atingido.");
        return;
      }
      setDraft((prev) => [
        ...prev,
        { weekday, start, end, reason: `Indisponível (${label})` },
      ]);
    }
  };

  const toggleFullDay = (weekday: number) => {
    const dayBlocked = draft.some((b) => b.weekday === weekday && toMin(b.start) <= 450 && toMin(b.end) >= 1200);
    if (dayBlocked) {
      setDraft((prev) => prev.filter((b) => b.weekday !== weekday));
    } else {
      if (draft.filter((b) => b.weekday !== weekday).length >= 60) {
        ErrorMessage("Limite máximo de 60 blocos de indisponibilidade atingido.");
        return;
      }
      setDraft((prev) => [
        ...prev.filter((b) => b.weekday !== weekday),
        { weekday, start: "07:00", end: "22:00", reason: "Dia inteiro indisponível" },
      ]);
    }
  };

  const addCustomBlock = () => {
    if (toMin(customEnd) <= toMin(customStart)) {
      ErrorMessage("A hora de fim deve ser posterior à hora de início.");
      return;
    }
    if (draft.length >= 60) {
      ErrorMessage("Limite máximo de 60 blocos de indisponibilidade atingido.");
      return;
    }
    setDraft((prev) => [
      ...prev,
      {
        weekday: Number(customDay),
        start: customStart,
        end: customEnd,
        ...(customReason.trim() ? { reason: customReason.trim() } : {}),
      },
    ]);
    setCustomReason("");
  };

  // Estimativa pedagógica de capacidade: quantos tempos da grelha escolar permanecem livres para o docente.
  const teacherWeeklyHours = useMemo(
    () =>
      assignments
        .filter((a) => a.teacherId === activeId)
        .reduce((acc, a) => acc + a.weeklyHours, 0),
    [assignments, activeId],
  );

  const estimatedFreePeriods = useMemo(() => {
    // Considera todas as aulas de grelhas activas (ou manha/tarde padrao) sem sobreposicao duplicada por horario.
    const slotMap = new Map<string, { start: string; end: string }>();
    if (bells.length > 0) {
      for (const b of bells) {
        for (const s of b.slots) {
          if (s.kind === "aula") slotMap.set(`${s.start}-${s.end}`, { start: s.start, end: s.end });
        }
      }
    } else {
      // Padrao 12 tempos/dia (6 manha + 6 tarde)
      for (const w of [
        "07:30-08:15", "08:15-09:00", "09:15-10:00", "10:00-10:45", "11:00-11:45", "11:45-12:30",
        "13:00-13:45", "13:45-14:30", "14:45-15:30", "15:30-16:15", "16:30-17:15", "17:15-18:00",
      ]) {
        const [start = "", end = ""] = w.split("-");
        slotMap.set(w, { start, end });
      }
    }
    let free = 0;
    for (const wd of weekdays) {
      for (const s of slotMap.values()) {
        const blocked = draft.some((b) => b.weekday === wd && overlaps(b.start, b.end, s.start, s.end));
        if (!blocked) free++;
      }
    }
    return free;
  }, [bells, weekdays, draft]);

  const capacityDeficit = teacherWeeklyHours > 0 && estimatedFreePeriods < teacherWeeklyHours;

  const handleSave = async () => {
    if (!activeId) return;
    try {
      await save.mutateAsync(draft);
      SucessMessage(`Disponibilidade de ${activeName} guardada.`);
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível guardar a disponibilidade do professor."));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-5 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="p-0">
          <SheetTitle>Disponibilidade semanal do professor</SheetTitle>
          <SheetDescription>
            Marque os períodos em que o professor está <strong>indisponível</strong>. Os períodos a verde ficam livres para o motor gerar aulas.
          </SheetDescription>
        </SheetHeader>

        {teachers && teachers.length > 0 && onSelectTeacher && (
          <FormSelect
            label="Professor"
            value={activeId ?? ""}
            onValueChange={onSelectTeacher}
            options={teachers.map((t) => ({ value: t.id, label: t.full_name }))}
          />
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xs border bg-muted/20 p-2.5">
            <p className="text-lg font-semibold tabular-nums">{teacherWeeklyHours}</p>
            <p className="text-[11px] text-muted-foreground">tempos atribuídos</p>
          </div>
          <div className={cn("rounded-xs border p-2.5", capacityDeficit ? "border-destructive/50 bg-destructive/5" : "bg-emerald-500/[0.04]")}>
            <p className={cn("text-lg font-semibold tabular-nums", capacityDeficit && "text-destructive")}>{estimatedFreePeriods}</p>
            <p className="text-[11px] text-muted-foreground">tempos disponíveis</p>
          </div>
          <div className="rounded-xs border bg-muted/20 p-2.5">
            <p className="text-lg font-semibold tabular-nums">{draft.length}</p>
            <p className="text-[11px] text-muted-foreground">bloqueios activos</p>
          </div>
        </div>

        {capacityDeficit && (
          <Alert className="border-destructive/40 bg-destructive/5">
            <Icon name="AlertTriangle" className="size-4 text-destructive" />
            <AlertTitle className="text-destructive">Disponibilidade insuficiente para a carga lectiva</AlertTitle>
            <AlertDescription className="text-xs text-destructive/90">
              {activeName} tem {teacherWeeklyHours} tempo(s) atribuídos esta semana, mas apenas {estimatedFreePeriods} tempo(s) livres com as restrições actuais.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">A carregar disponibilidade…</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Grelha rápida por turno
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setDraft([])}
                disabled={draft.length === 0}
              >
                Limpar bloqueios (100% disponível)
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xs border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="p-2 text-left font-medium text-muted-foreground">Turno</th>
                    {weekdays.map((wd) => (
                      <th key={wd} className="p-2 text-center font-medium">
                        <button
                          type="button"
                          onClick={() => toggleFullDay(wd)}
                          title={`Alternar dia inteiro (${WEEKDAY_FULL[wd] ?? wd})`}
                          className="rounded-xs px-1.5 py-0.5 hover:bg-muted"
                        >
                          {WEEKDAY_SHORT[wd] ?? wd}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shiftWindows.map((sw) => (
                    <tr key={sw.key} className="border-b last:border-b-0">
                      <td className="p-2">
                        <div className="font-medium">{sw.label}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {sw.start}–{sw.end}
                        </div>
                      </td>
                      {weekdays.map((wd) => {
                        const blocked = isShiftBlocked(wd, sw.start, sw.end);
                        const partial = isShiftPartial(wd, sw.start, sw.end);
                        return (
                          <td key={wd} className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleShiftBlock(wd, sw.start, sw.end, sw.label)}
                              className={cn(
                                "w-full rounded-xs border px-2 py-2 text-[11px] font-medium transition-colors",
                                blocked
                                  ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15"
                                  : partial
                                    ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                                    : "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400",
                              )}
                            >
                              {blocked ? "Indisponível" : partial ? "Parcial" : "Livre"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 rounded-xs border bg-muted/15 p-3">
              <Label className="text-xs font-semibold">Adicionar restrição horária específica</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <FormSelect
                  label="Dia"
                  value={customDay}
                  onValueChange={setCustomDay}
                  options={[1, 2, 3, 4, 5, 6].map((d) => ({ value: String(d), label: WEEKDAY_FULL[d]! }))}
                />
                <Input label="Início" type="time" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                <Input label="Fim" type="time" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                <Input label="Motivo (opcional)" placeholder="Ex.: Outra escola" value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="outline" onClick={addCustomBlock}>
                  <Icon name="Plus" className="mr-1 size-3.5" />
                  Bloquear intervalo
                </Button>
              </div>
            </div>

            {draft.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Intervalos indisponíveis ({draft.length})</Label>
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {draft.map((b, i) => (
                    <div key={`${b.weekday}-${b.start}-${b.end}-${i}`} className="flex items-center justify-between rounded-xs border px-2.5 py-1.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {WEEKDAY_FULL[b.weekday] ?? `Dia ${b.weekday}`}
                        </Badge>
                        <span className="font-mono">
                          {b.start}–{b.end}
                        </span>
                        {b.reason && <span className="text-muted-foreground">• {b.reason}</span>}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-destructive"
                        onClick={() => setDraft((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Icon name="X" className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={!activeId || save.isPending} onClick={handleSave}>
            {save.isPending ? (
              <>
                <Icon name="Loader2" className="mr-2 size-4 animate-spin" />
                A guardar...
              </>
            ) : (
              "Guardar disponibilidade"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

