"use client";

import { useState } from "react";
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
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { WEEKDAYS } from "@/services/extracurricular-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const MODAL_ID = "activity-new";
const EMPTY = { name: "", description: "", teacherId: "", weekday: "0", start: "", end: "", location: "", capacity: 20 };

export function NewActivityModal() {
  const { open, closeModal } = useModal();
  const { create, teachers, hasActiveYear } = useExtracurricular();
  const [f, setF] = useState(EMPTY);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create
      .mutateAsync({ name: f.name.trim(), description: f.description.trim() || undefined, teacherId: f.teacherId || undefined, weekday: Number(f.weekday) || undefined, startTime: f.start || undefined, endTime: f.end || undefined, location: f.location.trim() || undefined, capacity: f.capacity })
      .then(() => { SucessMessage("Atividade criada."); setF(EMPTY); closeModal(MODAL_ID); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível criar a atividade.")); });
  };

  return (
    <Sheet open={Boolean(open[MODAL_ID])} onOpenChange={(next) => !next && closeModal(MODAL_ID)}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader className="p-0">
          <SheetTitle>Nova atividade</SheetTitle>
          <SheetDescription>
            {hasActiveYear
              ? "Clubes, desporto ou outras atividades fora do currículo."
              : "Não há ano letivo ativo; crie-o primeiro."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Nome *" startIcon="Trophy" placeholder="Ex: Clube de Xadrez" value={f.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <FormTextarea label="Descrição" value={f.description} onChange={(v) => set("description", v)} rows={2} />
            <FormSelect label="Responsável" value={f.teacherId || "none"} onValueChange={(v) => set("teacherId", v === "none" ? "" : v)} options={[{ value: "none", label: "Sem responsável" }, ...teachers.map((t) => ({ value: t.id, label: t.full_name }))]} />
            <Input label="Lotação *" type="quantity" min={1} max={250} step={1} value={f.capacity} onChange={(e) => set("capacity", Math.max(1, Math.min(250, Number(e.target.value) || 1)))} />
            <FormSelect label="Dia da semana" value={f.weekday} onValueChange={(v) => set("weekday", v)} options={[{ value: "0", label: "Sem horário fixo" }, ...WEEKDAYS.slice(1).map((d, i) => ({ value: String(i + 1), label: d }))]} />
            <Input label="Início" type="time" value={f.start} onChange={(e) => set("start", e.target.value)} />
            <Input label="Fim" type="time" value={f.end} onChange={(e) => set("end", e.target.value)} />
            <div className="sm:col-span-2">
              <Input label="Local" startIcon="MapPin" value={f.location} onChange={(e) => set("location", e.target.value)} />
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => closeModal(MODAL_ID)}>
              Cancelar
            </Button>
            <ButtonSubmit isLoading={create.isPending} disabled={!hasActiveYear || f.name.trim().length < 2}>
              Criar atividade
            </ButtonSubmit>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
