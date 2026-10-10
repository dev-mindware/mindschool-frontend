"use client";

import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, ButtonOnlyAction, DataList, type Column } from "@/components";
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { WEEKDAYS, type ApiActivity } from "@/services/extracurricular-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

export function ActivityCatalogView() {
  const { activities, teacherName, teachers, isLoading, close } = useExtracurricular();
  const { openModal } = useModal();

  const columns: Column<ApiActivity>[] = [
    { key: "name", header: "Actividade", render: (_, a) => (<div className="flex flex-col"><span className="font-medium">{a.name}</span>{a.description && <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{a.description}</span>}</div>) },
    { key: "teacher_id", header: "Responsável", render: (_, a) => (a.teacher_id ? (teacherName.get(a.teacher_id) ?? "Responsável") : "—") },
    { key: "weekday", header: "Horário", render: (_, a) => (a.weekday ? <span className="text-xs">{WEEKDAYS[a.weekday]}{a.start_time ? `, ${a.start_time}${a.end_time ? `–${a.end_time}` : ""}` : ""}</span> : "—") },
    { key: "location", header: "Local", render: (_, a) => a.location ?? "—" },
    { key: "enrolled", header: "Inscritos", render: (_, a) => <span className="font-mono text-xs">{a.enrolled} / {a.capacity}</span> },
    { key: "status", header: "Estado", render: (_, a) => <Badge variant={a.status === "aberta" ? "outline" : "secondary"}>{a.status === "aberta" ? "Aberta" : "Encerrada"}</Badge> },
    {
      key: "action", header: "Acção",
      render: (_, a) => a.status === "aberta" ? (
        <ButtonOnlyAction data={a} actions={[
          { permission: "activity:write", label: "Inscrever aluno", icon: "UserPlus", onClick: (x) => openModal("activity-enroll", { activityId: x.id }), className: a.seats_free === 0 ? "pointer-events-none opacity-40" : "" },
          { permission: "activity:write", label: "Encerrar actividade", icon: "CircleX", variant: "destructive", onClick: (x) => void close.mutateAsync(x.id).then(() => SucessMessage("Actividade encerrada.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível encerrar."))) },
        ]} />
      ) : null,
    },
  ];

  return (
    <DataList<ApiActivity>
      prefix="actividades"
      rows={activities}
      columns={columns}
      isLoading={isLoading}
      searchPlaceholder="Pesquisar por nome, local ou responsável"
      searchText={(a) => `${a.name} ${a.location ?? ""} ${a.teacher_id ? (teacherName.get(a.teacher_id) ?? "") : ""}`}
      filters={[
        { key: "estado", label: "Estado", icon: "Tag", options: [{ value: "aberta", label: "Aberta" }, { value: "encerrada", label: "Encerrada" }], match: (a, v) => a.status === v },
        { key: "dia", label: "Dia da semana", icon: "CalendarDays", options: WEEKDAYS.slice(1).map((d, i) => ({ value: String(i + 1), label: d })), match: (a, v) => String(a.weekday ?? "") === v },
        { key: "responsavel", label: "Responsável", icon: "User", options: teachers.map((t) => ({ value: t.id, label: t.full_name })), match: (a, v) => a.teacher_id === v },
        { key: "vagas", label: "Vagas", icon: "Armchair", options: [{ value: "livres", label: "Com vagas" }, { value: "cheia", label: "Lotada" }], match: (a, v) => (v === "livres" ? a.seats_free > 0 : a.seats_free === 0) },
      ]}
      sorts={[{ value: "nome", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name) }, { value: "inscritos", label: "Inscritos", compare: (a, b) => a.enrolled - b.enrolled }, { value: "dia", label: "Dia da semana", compare: (a, b) => (a.weekday ?? 9) - (b.weekday ?? 9) }]}
      emptyTitle="Ainda não há actividades"
      emptyDescription="Crie a primeira actividade extracurricular."
      emptyIcon="Trophy"
    />
  );
}
