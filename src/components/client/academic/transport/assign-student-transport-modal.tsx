"use client";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { FormCombobox, FormModal, FormSelect } from "@/components";
import { useTransport } from "@/hooks/school/use-transport";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

export function AssignStudentTransportModal() {
  const { routes, students, assignments, assign } = useTransport();
  const { open, modalData } = useModal();
  const [routeId, setRouteId] = useState("");
  const [stopId, setStopId] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (open["transport-assign"]) { setRouteId((modalData["transport-assign"] as { routeId?: string } | undefined)?.routeId ?? ""); setStopId(""); setStudentId(""); }
  }, [open, modalData]);

  const route = routes.find((r) => r.id === routeId);
  const taken = new Set(assignments.map((a) => a.student_id));

  return (
    <FormModal id="transport-assign" title="Alocar aluno ao transporte" description="Só aparecem alunos sem rota activa. O encarregado é notificado." submitLabel="Alocar" isLoading={assign.isPending} disabled={!routeId || !stopId || !studentId} onSubmit={() => assign.mutateAsync({ studentId, routeId, stopId }).then(() => SucessMessage("Aluno alocado ao transporte.")).catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível alocar o aluno.")); throw err; })}>
      <FormSelect label="Rota *" value={routeId} onValueChange={(v) => { setRouteId(v); setStopId(""); }} options={routes.filter((r) => r.is_active && r.seats_free > 0).map((r) => ({ value: r.id, label: `${r.name} (${r.seats_free} lugares livres)` }))} />
      <FormSelect label="Paragem *" value={stopId} onValueChange={setStopId} disabled={!route} options={(route?.stops ?? []).map((s) => ({ value: s.id, label: `${s.order_index}. ${s.name}${s.pickup_time ? ` (${s.pickup_time})` : ""}` }))} />
      <div className="sm:col-span-2"><FormCombobox label="Aluno *" value={studentId} onValueChange={setStudentId} searchPlaceholder="Pesquisar aluno..." options={students.filter((s) => !taken.has(s.id)).map((s) => ({ value: s.id, label: s.fullName }))} /></div>
    </FormModal>
  );
}
