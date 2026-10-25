"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface TimetableBlock<T = unknown> {
  id: string;
  /** 1 = segunda … 7 = domingo */
  weekday: number;
  start: string; // HH:MM
  end: string; // HH:MM
  title: string;
  subtitle?: string;
  meta?: string;
  tone?: "primary" | "success" | "warning" | "danger";
  data?: T;
}

export interface TimetableSlot {
  position: number;
  start: string;
  end: string;
  kind: "aula" | "intervalo";
  /** N.º do tempo letivo (só para kind = aula). */
  lessonNo?: number;
}

export interface WeekTimetableProps<T> {
  blocks: TimetableBlock<T>[];
  /** Tempos da grelha: desenham as faixas e permitem clicar em tempos vazios. */
  slots?: TimetableSlot[];
  days?: number[];
  onBlockClick?: (b: TimetableBlock<T>) => void;
  /** Clique num tempo livre (só com `slots`). */
  onEmptyClick?: (weekday: number, slot: TimetableSlot) => void;
  className?: string;
  /** Hora de início pretendida para o turno (ex: 7 para manhã/diurno, 13 para tarde, 17 para noite). */
  startHour?: number;
  /** Hora de fim pretendida para o turno (ex: 13 para manhã, 18 para tarde/diurno, 21 para noite). */
  endHour?: number;
}

const DAY_LABEL: Record<number, string> = { 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado", 7: "Domingo" };
const TONE = {
  primary: "border-primary/40 bg-primary/10 text-foreground",
  success: "border-emerald-500/40 bg-emerald-500/10 text-foreground",
  warning: "border-amber-500/40 bg-amber-500/10 text-foreground",
  danger: "border-destructive/40 bg-destructive/10 text-foreground",
} as const;
const PX_PER_MIN = 1.25;

const mins = (t: string) => { const [h, m] = t.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); };

/** Vista semanal (estilo calendário): eixo de horas à esquerda, um dia por coluna, aulas posicionadas pelo horário real. */
export function WeekTimetable<T>({
  blocks,
  slots = [],
  days = [1, 2, 3, 4, 5],
  onBlockClick,
  onEmptyClick,
  className,
  startHour,
  endHour,
}: WeekTimetableProps<T>) {
  const range = useMemo(() => {
    const targetFrom = (startHour !== undefined ? startHour : 7) * 60;
    const targetTo = (endHour !== undefined ? endHour : 18) * 60;

    const all = [
      ...blocks.map((b) => [mins(b.start), mins(b.end)] as const),
      ...slots.map((s) => [mins(s.start), mins(s.end)] as const),
    ];

    if (all.length === 0) {
      return { from: targetFrom, to: targetTo };
    }

    const minAll = Math.floor(Math.min(...all.map((a) => a[0])) / 60) * 60;
    const maxAll = Math.ceil(Math.max(...all.map((a) => a[1])) / 60) * 60;

    return {
      from: Math.min(targetFrom, minAll),
      to: Math.max(targetTo, maxAll),
    };
  }, [blocks, slots, startHour, endHour]);

  const height = (range.to - range.from) * PX_PER_MIN;
  const hours = Array.from({ length: (range.to - range.from) / 60 + 1 }, (_, i) => range.from + i * 60);
  const top = (t: string) => (mins(t) - range.from) * PX_PER_MIN;

  return (
    <div className={cn("w-full overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs", className)}>
      <div className="min-w-[760px]">
        <div className="grid border-b bg-muted/40 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="py-2.5 font-mono text-[10px]">Hora</div>
          {days.map((d) => <div key={d} className="py-2.5">{DAY_LABEL[d]}</div>)}
        </div>

        <div className="grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="relative border-r border-border/40 select-none" style={{ height }}>
            {hours.map((h, idx) => (
              <span
                key={h}
                className={cn(
                  "absolute right-2 font-mono text-[11px] font-medium text-muted-foreground/75",
                  idx === 0 ? "top-1" : idx === hours.length - 1 ? "-translate-y-full bottom-1" : "-translate-y-1/2"
                )}
                style={idx === 0 || idx === hours.length - 1 ? undefined : { top: (h - range.from) * PX_PER_MIN }}
              >
                {String(Math.floor(h / 60)).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((d) => {
            const dayBlocks = blocks.filter((b) => b.weekday === d);
            return (
              <div key={d} className="relative border-l border-border/40" style={{ height }}>
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-border/30 pointer-events-none"
                    style={{ top: (h - range.from) * PX_PER_MIN }}
                  />
                ))}

                {slots.map((s) => {
                  const covered = dayBlocks.some((b) => mins(b.start) < mins(s.end) && mins(b.end) > mins(s.start));
                  const base = { top: top(s.start), height: (mins(s.end) - mins(s.start)) * PX_PER_MIN };
                  if (s.kind === "intervalo") {
                    return (
                      <div
                        key={s.position}
                        className="absolute inset-x-1 flex items-center justify-center rounded-sm border border-dashed border-border/60 bg-muted/40 text-center text-[10px] font-medium text-muted-foreground/80 select-none overflow-hidden"
                        style={base}
                        title={`Intervalo (${s.start} – ${s.end})`}
                      >
                        <span className="truncate px-1 tracking-wide">
                          Intervalo · {s.start} – {s.end}
                        </span>
                      </div>
                    );
                  }
                  if (covered || !onEmptyClick) return null;
                  return (
                    <button
                      key={s.position}
                      type="button"
                      onClick={() => onEmptyClick(d, s)}
                      className="group absolute inset-x-1 flex flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-card/60 p-1 text-center transition-all hover:border-primary hover:bg-primary/[0.06] hover:shadow-xs cursor-pointer select-none"
                      style={base}
                      title={`Clique para agendar aula no ${s.lessonNo ?? s.position}.º tempo (${s.start} – ${s.end})`}
                    >
                      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/85 group-hover:text-primary transition-colors">
                        <span className="text-primary/70 group-hover:text-primary font-bold">+</span>
                        <span>{s.lessonNo ? `${s.lessonNo}.º Tempo` : `${s.start}`}</span>
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
                        {s.start} – {s.end}
                      </span>
                    </button>
                  );
                })}

                {slots.length === 0 && onEmptyClick && hours.slice(0, -1).map((h, i) => {
                  const startStr = `${String(Math.floor(h / 60)).padStart(2, "0")}:00`;
                  const nextH = h + 60;
                  const endStr = `${String(Math.floor(nextH / 60)).padStart(2, "0")}:00`;
                  const covered = dayBlocks.some((b) => mins(b.start) < nextH && mins(b.end) > h);
                  if (covered) return null;
                  const base = { top: (h - range.from) * PX_PER_MIN, height: 60 * PX_PER_MIN };
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onEmptyClick(d, { position: i + 1, start: startStr, end: endStr, kind: "aula", lessonNo: i + 1 })}
                      className="group absolute inset-x-1 flex flex-col items-center justify-center rounded-md border border-dashed border-border/60 bg-card/40 p-1 text-center transition-all hover:border-primary hover:bg-primary/[0.06] cursor-pointer select-none"
                      style={base}
                    >
                      <span className="text-[11px] font-medium text-muted-foreground/80 group-hover:text-primary transition-colors">
                        + {startStr} – {endStr}
                      </span>
                    </button>
                  );
                })}

                {dayBlocks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBlockClick?.(b)}
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-md border p-2 text-left shadow-xs transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer z-10",
                      TONE[b.tone ?? "primary"]
                    )}
                    style={{
                      top: top(b.start) + 1,
                      height: Math.max((mins(b.end) - mins(b.start)) * PX_PER_MIN - 2, 26),
                    }}
                    title={`${b.title} · ${b.start}–${b.end}`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="line-clamp-1 text-xs font-semibold leading-tight">{b.title}</p>
                      {b.meta && (
                        <span className="shrink-0 rounded bg-background/80 px-1 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground border border-border/50">
                          {b.meta}
                        </span>
                      )}
                    </div>
                    {b.subtitle && (
                      <p className="line-clamp-1 text-[11px] leading-tight text-foreground/80 mt-0.5">
                        {b.subtitle}
                      </p>
                    )}
                    <p className="font-mono text-[10px] leading-tight text-muted-foreground mt-0.5">
                      {b.start} – {b.end}
                    </p>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
