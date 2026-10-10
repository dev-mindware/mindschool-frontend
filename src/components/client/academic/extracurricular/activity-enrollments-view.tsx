"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { ButtonOnlyAction, DataList, type Column } from "@/components";
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import type { CertificateTarget } from "./extracurricular-page-content";
import { ActivityCertificatePrintModal } from "./activity-certificate-print-modal";

export function ActivityEnrollmentsView() {
  const { enrollments, activities, cancelEnrollment } = useExtracurricular();
  const { openModal } = useModal();
  const [target, setTarget] = useState<CertificateTarget | null>(null);
  type Row = (typeof enrollments)[number];

  const columns: Column<Row>[] = [
    { key: "student_name", header: "Aluno", render: (_, e) => <span className="font-medium">{e.student_name}</span> },
    { key: "activityName", header: "Actividade" },
    { key: "enrolled_at", header: "Inscrito em", render: (_, e) => <span className="font-mono text-xs">{e.enrolled_at.slice(0, 10)}</span> },
    {
      key: "action", header: "Acção",
      render: (_, e) => (
        <ButtonOnlyAction data={e} actions={[
          { permission: "activity:write", label: "Certificado", icon: "Award", onClick: (x) => { setTarget({ studentName: x.student_name, activityName: x.activityName, enrolledAt: x.enrolled_at }); openModal("activity-certificate"); } },
          { permission: "activity:write", label: "Cancelar inscrição", icon: "X", variant: "destructive", onClick: (x) => void cancelEnrollment.mutateAsync({ activityId: x.activityId, enrollmentId: x.id }).then(() => SucessMessage("Inscrição cancelada.")).catch((err) => ErrorMessage(getApiErrorMessage(err, "Não foi possível cancelar."))) },
        ]} />
      ),
    },
  ];

  return (
    <>
      <DataList<Row>
        prefix="inscricoes"
        rows={enrollments}
        columns={columns}
        searchPlaceholder="Pesquisar por aluno ou actividade"
        searchText={(e) => `${e.student_name} ${e.activityName}`}
        filters={[{ key: "actividade", label: "Actividade", icon: "Trophy", options: activities.map((a) => ({ value: a.id, label: a.name })), match: (e, v) => e.activityId === v }]}
        dateFilters={[{ key: "inscrito", label: "Inscrição", getDate: (e) => e.enrolled_at }]}
        sorts={[{ value: "aluno", label: "Aluno", compare: (a, b) => a.student_name.localeCompare(b.student_name) }, { value: "data", label: "Data", compare: (a, b) => a.enrolled_at.localeCompare(b.enrolled_at) }]}
        emptyTitle="Nenhuma inscrição activa"
        emptyIcon="Users"
      />
      <ActivityCertificatePrintModal target={target} />
    </>
  );
}
