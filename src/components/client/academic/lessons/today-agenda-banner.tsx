"use client";

import React, { useMemo } from "react";
import { Icon } from "@/components/common/icon";
import { Badge } from "@/components/ui/badge";
import {
  getLessonKeepNote,
  KEEP_COLOR_MAP,
} from "./use-lesson-keep";
import type { ApiLesson } from "@/services/lessons-service";
import { cn } from "@/lib/utils";

interface TodayAgendaBannerProps {
  todayLessons: ApiLesson[];
  onOpenLesson: (lesson: ApiLesson) => void;
}

export function TodayAgendaBanner({
  todayLessons,
  onOpenLesson,
}: TodayAgendaBannerProps) {
  const lessonsWithNotes = useMemo(() => {
    return todayLessons.map((l) => ({
      lesson: l,
      note: getLessonKeepNote(l.id),
    }));
  }, [todayLessons]);

  const plannedCount = lessonsWithNotes.filter((x) => Boolean(x.note)).length;
  const missingCount = todayLessons.length - plannedCount;

  if (todayLessons.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xs border border-dashed border-border/80 bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xs bg-primary/10 text-primary">
            <Icon name="CalendarCheck" className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Agenda de Hoje</p>
            <p className="text-[11px] text-muted-foreground">
              Não tem aulas agendadas para o dia de hoje. Aproveite para preparar os planos dos próximos dias.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 rounded-xs border border-border/60 bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xs bg-primary/10 text-primary">
            <Icon name="BellRing" className="size-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                A Sua Agenda de Hoje ({todayLessons.length} aulas)
              </h4>
              <Badge variant="outline" className="border-primary/30 text-[10px] font-medium text-primary">
                {plannedCount}/{todayLessons.length} planeadas
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {missingCount > 0
                ? `Atenção: Tem ${missingCount} aula(s) hoje ainda sem notas de Keep ou plano pedagógico.`
                : "Excelente! Todas as aulas de hoje têm notas e roteiros planeados no Google Keep."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {lessonsWithNotes.map(({ lesson, note }) => {
          const theme = note ? KEEP_COLOR_MAP[note.color] : KEEP_COLOR_MAP.neutral;
          const completedChecklist =
            note?.checklist?.filter((c) => c.done).length ?? 0;
          const totalChecklist = note?.checklist?.length ?? 0;

          return (
            <div
              key={lesson.id}
              onClick={() => onOpenLesson(lesson)}
              className={cn(
                "group relative flex cursor-pointer flex-col justify-between space-y-2 rounded-xs border p-3.5 transition-all hover:shadow-md",
                theme.bg,
                theme.border
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {lesson.start}–{lesson.end}
                    </span>
                    <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[9px]">
                      {lesson.section.name}
                    </Badge>
                  </div>
                  {note?.isPinned && (
                    <Icon
                      name="Pin"
                      className="size-3.5 shrink-0 fill-current text-primary"
                    />
                  )}
                </div>

                <p className="line-clamp-1 text-xs font-semibold text-foreground">
                  {note?.title || lesson.subject.name}
                </p>

                {note?.content ? (
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {note.content}
                  </p>
                ) : (
                  <p className="text-[11px] italic text-amber-600 dark:text-amber-400">
                    Sem notas anotadas. Clique para abrir o editor Keep.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-2 text-[10px] text-muted-foreground">
                {totalChecklist > 0 ? (
                  <span className="flex items-center gap-1">
                    <Icon name="CheckSquare" className="size-3 text-primary" />
                    {completedChecklist}/{totalChecklist} concluídos
                  </span>
                ) : (
                  <span>Sem checklist</span>
                )}
                <span className="flex items-center gap-0.5 font-medium transition-colors group-hover:text-primary">
                  Editar no Keep
                  <Icon name="ChevronRight" className="size-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
