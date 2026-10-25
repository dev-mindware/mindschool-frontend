"use client";

import { WeekTimetable, type TimetableBlock } from "@/components";
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { useModal } from "@/stores/modal/use-modal-store";
import type { ApiActivity } from "@/services/extracurricular-service";

/** Horário semanal das atividades extracurriculares (só as que têm dia e hora definidos). */
export function ActivityWeekView() {
  const { activities, teacherName } = useExtracurricular();
  const { openModal } = useModal();

  const blocks: TimetableBlock<ApiActivity>[] = activities
    .filter((a) => a.weekday && a.start_time)
    .map((a) => ({ id: a.id, weekday: a.weekday!, start: a.start_time!.slice(0, 5), end: (a.end_time ?? a.start_time!).slice(0, 5) === a.start_time!.slice(0, 5) ? addHour(a.start_time!.slice(0, 5)) : a.end_time!.slice(0, 5), title: a.name, subtitle: a.teacher_id ? teacherName.get(a.teacher_id) : undefined, meta: a.location ?? `${a.enrolled}/${a.capacity}`, tone: a.status === "aberta" ? "primary" : "danger", data: a }));

  return (
    <div className="space-y-3">
      <WeekTimetable<ApiActivity> blocks={blocks} days={[1, 2, 3, 4, 5, 6]} onBlockClick={(b) => b.data && b.data.status === "aberta" && openModal("activity-enroll", { activityId: b.data.id })} />
      <p className="text-xs text-muted-foreground">Clique numa atividade aberta para inscrever um aluno. As atividades sem dia e hora fixos não aparecem aqui.</p>
    </div>
  );
}

const addHour = (t: string) => `${String(Math.min(23, Number(t.slice(0, 2)) + 1)).padStart(2, "0")}:${t.slice(3, 5)}`;
