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
  /** N.º do tempo lectivo (só para kind = aula). */
  lessonNo?: number;
}

interface WeekTimetableProps<T> {
  blocks: TimetableBlock<T>[];
  /** Tempos da grelha: desenham as faixas e permitem clicar em tempos vazios. */
  slots?: TimetableSlot[];
  days?: number[];
  onBlockClick?: (b: TimetableBlock<T>) => void;
  /** Clique num tempo livre (só com `slots`). */
  onEmptyClick?: (weekday: number, slot: TimetableSlot) => void;
  className?: string;
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
export function WeekTimetable<T>({ blocks, slots = [], days = [1, 2, 3, 4, 5], onBlockClick, onEmptyClick, className }: WeekTimetableProps<T>) {
  const range = useMemo(() => {
    const all = [...blocks.map((b) => [mins(b.start), mins(b.end)] as const), ...slots.map((s) => [mins(s.start), mins(s.end)] as const)];
    if (all.length === 0) return { from: 7 * 60, to: 17 * 60 };
    return { from: Math.floor(Math.min(...all.map((a) => a[0])) / 60) * 60, to: Math.ceil(Math.max(...all.map((a) => a[1])) / 60) * 60 };
  }, [blocks, slots]);

  const height = (range.to - range.from) * PX_PER_MIN;
  const hours = Array.from({ length: (range.to - range.from) / 60 + 1 }, (_, i) => range.from + i * 60);
  const top = (t: string) => (mins(t) - range.from) * PX_PER_MIN;

  return (
    <div className={cn("w-full overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs", className)}>
      <div className="min-w-[720px]">
        <div className="grid border-b bg-muted/40 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="py-2" />
          {days.map((d) => <div key={d} className="py-2">{DAY_LABEL[d]}</div>)}
        </div>

        <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div className="relative" style={{ height }}>
            {hours.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground" style={{ top: (h - range.from) * PX_PER_MIN }}>
                {String(Math.floor(h / 60)).padStart(2, "0")}:00
              </span>
            ))}
          </div>

          {days.map((d) => {
            const dayBlocks = blocks.filter((b) => b.weekday === d);
            return (
              <div key={d} className="relative border-l" style={{ height }}>
                {hours.map((h) => <div key={h} className="absolute inset-x-0 border-t border-border/40" style={{ top: (h - range.from) * PX_PER_MIN }} />)}

                {slots.map((s) => {
                  const covered = dayBlocks.some((b) => mins(b.start) < mins(s.end) && mins(b.end) > mins(s.start));
                  const base = { top: top(s.start), height: (mins(s.end) - mins(s.start)) * PX_PER_MIN };
                  if (s.kind === "intervalo") return <div key={s.position} className="absolute inset-x-0 bg-muted/40 text-center text-[10px] leading-none text-muted-foreground" style={base}><span className="relative top-1">Intervalo</span></div>;
                  if (covered || !onEmptyClick) return null;
                  return (
                    <button
                      key={s.position}
                      type="button"
                      onClick={() => onEmptyClick(d, s)}
                      className="group absolute inset-x-0.5 rounded border border-dashed border-border/60 text-[10px] text-muted-foreground/50 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      style={base}
                    >
                      <span className="opacity-0 group-hover:opacity-100">+ {s.lessonNo}.º tempo</span>
                    </button>
                  );
                })}

                {dayBlocks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBlockClick?.(b)}
                    className={cn("absolute inset-x-0.5 overflow-hidden rounded-md border p-1.5 text-left shadow-xs transition-shadow hover:shadow-md", TONE[b.tone ?? "primary"])}
                    style={{ top: top(b.start) + 1, height: Math.max((mins(b.end) - mins(b.start)) * PX_PER_MIN - 2, 22) }}
                    title={`${b.title} · ${b.start}–${b.end}`}
                  >
                    <p className="line-clamp-1 text-xs font-semibold leading-tight">{b.title}</p>
                    {b.subtitle && <p className="line-clamp-1 text-[10px] leading-tight text-muted-foreground">{b.subtitle}</p>}
                    <p className="font-mono text-[10px] leading-tight text-muted-foreground">{b.start}–{b.end}{b.meta ? ` · ${b.meta}` : ""}</p>
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
