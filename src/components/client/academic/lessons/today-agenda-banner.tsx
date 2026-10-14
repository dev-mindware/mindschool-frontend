"use client";

import React, { useMemo } from "react";
import { Icon } from "@/components/common/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getLessonKeepNote,
  KEEP_COLOR_MAP,
  LessonKeepNote,
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
  // Para cada aula de hoje, recupera a nota de Keep correspondente
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
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="CalendarCheck" className="w-5 h-5" />
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
    <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-4 sm:p-5 shadow-xs space-y-3.5">
      {/* Cabeçalho da Agenda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="BellRing" className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                A Sua Agenda de Hoje ({todayLessons.length} aulas)
              </h4>
              <Badge variant="outline" className="text-[10px] font-medium border-primary/30 text-primary">
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

      {/* Grid de Cards Estilo Google Keep das Aulas de Hoje */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                "group cursor-pointer rounded-lg border p-3.5 transition-all hover:shadow-md relative space-y-2 flex flex-col justify-between",
                theme.bg,
                theme.border
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {lesson.start}–{lesson.end}
                    </span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                      {lesson.section.name}
                    </Badge>
                  </div>
                  {note?.isPinned && (
                    <Icon
                      name="Pin"
                      className="w-3.5 h-3.5 text-primary fill-current shrink-0"
                    />
                  )}
                </div>

                <p className="text-xs font-semibold text-foreground line-clamp-1">
                  {note?.title || lesson.subject.name}
                </p>

                {note?.content ? (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                    Sem notas anotadas. Clique para abrir o editor Keep.
                  </p>
                )}
              </div>

              {/* Roteiro e TPC */}
              <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                {totalChecklist > 0 ? (
                  <span className="flex items-center gap-1">
                    <Icon name="CheckSquare" className="w-3 h-3 text-primary" />
                    {completedChecklist}/{totalChecklist} concluídos
                  </span>
                ) : (
                  <span>Sem checklist</span>
                )}
                <span className="group-hover:text-primary font-medium flex items-center gap-0.5 transition-colors">
                  Editar no Keep
                  <Icon name="ChevronRight" className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
