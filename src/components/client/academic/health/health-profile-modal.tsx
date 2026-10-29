"use client";
import { formatDate } from "@/utils";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Button,
  ButtonSubmit,
  FormSelect,
  FormTextarea,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { useStudentHealth } from "@/hooks/school/use-health";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const MODAL_ID = "health-profile";
const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMPTY = { blood_type: "", allergies: "", chronic_conditions: "", medications: "", emergency_contact_name: "", emergency_contact_phone: "", notes: "" };

/** Ficha clínica do aluno (grupo sanguíneo, alergias, doenças crónicas, medicação, contacto de emergência). */
export function HealthProfileModal({ studentId }: { studentId: string | null }) {
  const { open, closeModal } = useModal();
  const { data, isLoading, forbidden, save } = useStudentHealth(studentId ?? undefined);
  const [form, setForm] = useState(EMPTY);
  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const r = data?.record;
    setForm({
      blood_type: r?.blood_type ?? "", allergies: r?.allergies ?? "", chronic_conditions: r?.chronic_conditions ?? "", medications: r?.medications ?? "",
      emergency_contact_name: r?.emergency_contact_name ?? "", emergency_contact_phone: r?.emergency_contact_phone ?? "", notes: r?.notes ?? "",
    });
  }, [data, studentId]);

  const nul = (v: string) => (v.trim() === "" ? null : v.trim());
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save
      .mutateAsync({ blood_type: nul(form.blood_type), allergies: nul(form.allergies), chronic_conditions: nul(form.chronic_conditions), medications: nul(form.medications), emergency_contact_name: nul(form.emergency_contact_name), emergency_contact_phone: nul(form.emergency_contact_phone), notes: nul(form.notes) })
      .then(() => SucessMessage("Ficha clínica guardada."))
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível guardar a ficha.")); });
  };

  return (
    <Sheet open={Boolean(open[MODAL_ID])} onOpenChange={(next) => !next && closeModal(MODAL_ID)}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader className="p-0">
          <SheetTitle>Ficha clínica</SheetTitle>
          <SheetDescription>
            {forbidden
              ? "O seu perfil não tem acesso às fichas clínicas."
              : isLoading
              ? "A carregar…"
              : "Confidencial: acesso restrito e auditado."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-col gap-6">
          {data && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect label="Grupo sanguíneo" value={form.blood_type} onValueChange={(v) => set("blood_type", v)} options={BLOOD.map((b) => ({ value: b, label: b }))} placeholder="—" />
              <Input label="Medicação habitual" value={form.medications} onChange={(e) => set("medications", e.target.value)} />
              <FormTextarea label="Alergias" value={form.allergies} onChange={(v) => set("allergies", v)} rows={2} />
              <FormTextarea label="Doenças crónicas" value={form.chronic_conditions} onChange={(v) => set("chronic_conditions", v)} rows={2} />
              <Input label="Contacto de emergência" startIcon="User" value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} />
              <Input label="Telefone de emergência" startIcon="Phone" value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} />
              <FormTextarea label="Observações" value={form.notes} onChange={(v) => set("notes", v)} rows={2} />
              {data.recent_visits.length > 0 && (
                <div className="space-y-1 border-t pt-3 text-sm sm:col-span-2">
                  <p className="font-semibold">Últimos atendimentos</p>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {data.recent_visits.map((v) => (
                      <li key={v.id}>{formatDate(v.visited_at)} — {v.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => closeModal(MODAL_ID)}>
              {forbidden ? "Fechar" : "Cancelar"}
            </Button>
            {!forbidden && (
              <ButtonSubmit isLoading={save.isPending}>
                Guardar
              </ButtonSubmit>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
