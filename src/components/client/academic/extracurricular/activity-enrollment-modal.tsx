"use client";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { FormModal, FormSelect } from "@/components";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

export function ActivityEnrollmentModal() {
  const { activities, students, enrollments, enroll } = useExtracurricular();
  const { open, modalData } = useModal();
  const [activityId, setActivityId] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (open["activity-enroll"]) { setActivityId((modalData["activity-enroll"] as { activityId?: string } | undefined)?.activityId ?? ""); setStudentId(""); }
  }, [open, modalData]);

  const already = new Set(enrollments.filter((e) => e.activityId === activityId).map((e) => e.student_id));

  return (
    <FormModal id="activity-enroll" title="Inscrever aluno" description="O aluno precisa de matrícula ativa no ano letivo. O encarregado é notificado." submitLabel="Inscrever" isLoading={enroll.isPending} disabled={!activityId || !studentId} onSubmit={() => enroll.mutateAsync({ activityId, studentId }).then(() => SucessMessage("Aluno inscrito.")).catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível inscrever o aluno.")); throw err; })}>
      <div className="sm:col-span-2"><FormSelect label="Atividade *" value={activityId} onValueChange={setActivityId} options={activities.filter((a) => a.status === "aberta" && a.seats_free > 0).map((a) => ({ value: a.id, label: `${a.name} (${a.seats_free} vagas)` }))} /></div>
      <div className="sm:col-span-2"><StudentSelect label="Aluno *" students={students.filter((s) => !already.has(s.id))} value={studentId} onChange={setStudentId} /></div>
    </FormModal>
  );
}
