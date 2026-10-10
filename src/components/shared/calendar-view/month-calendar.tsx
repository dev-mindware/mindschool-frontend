"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui";
import { Icon } from "@/components/common/icon";
import { cn } from "@/lib/utils";

export interface CalendarItem {
  id: string;
  title: string;
  /** AAAA-MM-DD */
  start: string;
  /** AAAA-MM-DD (inclusive). Por omissão, igual ao início. */
  end?: string;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  /** Texto curto (ex.: hora) mostrado antes do título. */
  hint?: string;
}

interface MonthCalendarProps {
  items: CalendarItem[];
  /** Mês visível (qualquer dia desse mês). */
  month: Date;
  onMonthChange: (d: Date) => void;
  onSelectItem?: (item: CalendarItem) => void;
  onSelectDay?: (date: string) => void;
  /** Datas (AAAA-MM-DD) marcadas como não lectivas: fundo destacado. */
  markedDays?: Set<string>;
  className?: string;
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const TONE: Record<NonNullable<CalendarItem["tone"]>, string> = {
  primary: "bg-primary/10 text-primary border-primary/30",
  success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  muted: "bg-muted text-muted-foreground border-border",
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Vista de mês (segunda-feira primeiro): eventos de vários dias repetem-se em cada dia; clique no dia ou no evento. */
export function MonthCalendar({ items, month, onMonthChange, onSelectItem, onSelectDay, markedDays, className }: MonthCalendarProps) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + i)), [first.getFullYear(), first.getMonth(), offset]);
  const today = iso(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const it of items) {
      const end = it.end && it.end >= it.start ? it.end : it.start;
      const cur = new Date(`${it.start}T00:00:00`);
      for (let guard = 0; guard < 62 && iso(cur) <= end; guard++) {
        const k = iso(cur);
        (map.get(k) ?? map.set(k, []).get(k)!).push(it);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [items]);

  const shift = (n: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{MONTHS[month.getMonth()]} {month.getFullYear()}</h3>
        <div className="flex items-center gap-1.5">
          <Button size="icon" variant="outline" className="size-9" onClick={() => shift(-1)} aria-label="Mês anterior"><Icon name="ChevronLeft" className="size-4" /></Button>
          <Button size="sm" variant="outline" className="h-9" onClick={() => onMonthChange(new Date())}>Hoje</Button>
          <Button size="icon" variant="outline" className="size-9" onClick={() => shift(1)} aria-label="Mês seguinte"><Icon name="ChevronRight" className="size-4" /></Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d, idx) => {
            const k = iso(d);
            const inMonth = d.getMonth() === month.getMonth();
            const list = byDay.get(k) ?? [];
            return (
              <div
                key={k}
                role={onSelectDay ? "button" : undefined}
                onClick={() => onSelectDay?.(k)}
                className={cn(
                  "min-h-24 border-b border-r p-1.5 text-left transition-colors sm:min-h-28",
                  idx % 7 === 6 && "border-r-0",
                  idx >= 35 && "border-b-0",
                  !inMonth && "bg-muted/20 text-muted-foreground/60",
                  markedDays?.has(k) && "bg-amber-500/5",
                  onSelectDay && "cursor-pointer hover:bg-muted/30",
                )}
              >
                <div className={cn("mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium", k === today && "bg-primary text-primary-foreground")}>{d.getDate()}</div>
                <div className="space-y-0.5">
                  {list.slice(0, 3).map((it) => (
                    <button
                      key={`${it.id}-${k}`}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSelectItem?.(it); }}
                      className={cn("block w-full truncate rounded border px-1 py-0.5 text-left text-[10px] font-medium leading-tight", TONE[it.tone ?? "primary"])}
                      title={it.title}
                    >
                      {it.hint ? `${it.hint} · ` : ""}{it.title}
                    </button>
                  ))}
                  {list.length > 3 && <p className="px-1 text-[10px] text-muted-foreground">+{list.length - 3} mais</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
