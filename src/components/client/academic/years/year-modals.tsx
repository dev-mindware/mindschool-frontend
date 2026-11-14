"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { FormModal, Input } from "@/components";
import { useAcademicYears } from "@/hooks/school/use-academic";
import { suggestAcademicYear, type AcademicYearDraft } from "@/lib/academic-year";
import { academicYearSetupSchema, isoDateSchema } from "@/schemas";
import type { ApiAcademicYear } from "@/services/academic-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

export {
  CloseYearModal,
  RegimeModal,
  ReopenYearModal,
  ResumeYearModal,
  SuspendYearModal,
} from "./year-transition-modals";
export { TermFormModal } from "./term-modal";

const yearFormSchema = z
  .object({
    name: z
      .string({ error: "O nome do ano lectivo é obrigatório." })
      .trim()
      .regex(/^\d{4}\/\d{4}$/, "Use o formato AAAA/AAAA (ex.: 2026/2027).")
      .refine(
        (v) => Number(v.slice(5)) === Number(v.slice(0, 4)) + 1,
        "O segundo ano deve ser o seguinte ao primeiro.",
      ),
    start_date: isoDateSchema("A data de início"),
    end_date: isoDateSchema("A data de fim"),
    enrollment_open_date: isoDateSchema("A data de abertura das matrículas"),
    enrollment_close_date: isoDateSchema("A data de fecho das matrículas"),
  })
  .superRefine((data, ctx) => {
    const base = academicYearSetupSchema.safeParse({
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
    });
    if (!base.success) {
      const pathMap = { startDate: "start_date", endDate: "end_date", name: "name" } as const;
      for (const issue of base.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && key in pathMap) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [pathMap[key as keyof typeof pathMap]],
            message: issue.message,
          });
        }
      }
    }
    if (data.enrollment_open_date > data.enrollment_close_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enrollment_close_date"],
        message: "O fecho não pode ser antes da abertura das matrículas.",
      });
    }
    if (data.enrollment_close_date > data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enrollment_close_date"],
        message: "As matrículas têm de fechar até ao fim do ano lectivo.",
      });
    }
  });

const buildInitialDraft = (editing: ApiAcademicYear | null): AcademicYearDraft =>
  editing
    ? {
        name: editing.name,
        start_date: editing.start_date,
        end_date: editing.end_date,
        enrollment_open_date: editing.enrollment_open_date ?? editing.start_date,
        enrollment_close_date: editing.enrollment_close_date ?? editing.end_date,
      }
    : suggestAcademicYear();

export function YearFormModal({ editing }: { editing: ApiAcademicYear | null }) {
  const { open } = useModal();
  if (!open["academic-year-form"]) return null;
  return <YearFormBody key={editing ? `edit:${editing.id}` : "new"} editing={editing} />;
}

function YearFormBody({ editing }: { editing: ApiAcademicYear | null }) {
  const { createYear, updateYear } = useAcademicYears();
  const [form, setForm] = useState<AcademicYearDraft>(() => buildInitialDraft(editing));
  const [touched, setTouched] = useState<Partial<Record<keyof AcademicYearDraft, boolean>>>({});

  const setField = (k: keyof AcademicYearDraft, v: string) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const parsed = useMemo(() => yearFormSchema.safeParse(form), [form]);
  const fieldError = (k: keyof AcademicYearDraft) => {
    if (!touched[k] || parsed.success) return undefined;
    return parsed.error.issues.find((i) => i.path[0] === k)?.message;
  };

  const pending = createYear.isPending || updateYear.isPending;
  const fail = (e: unknown, fallback: string) => {
    ErrorMessage(getApiErrorMessage(e, fallback));
    throw e;
  };

  return (
    <FormModal
      id="academic-year-form"
      title={editing ? `Editar Ano Lectivo ${editing.name}` : "Novo Ano Lectivo"}
      description={
        editing
          ? "Ajuste as datas do ano lectivo ou do período de matrículas. Reduções de datas respeitam os períodos e eventos existentes."
          : "Ao criar o primeiro ano, ele é activado automaticamente com os 3 trimestres padrão. Se já existir um ano activo, o novo fica em planeamento."
      }
      submitLabel={editing ? "Guardar alterações" : "Criar ano lectivo"}
      isLoading={pending}
      disabled={!parsed.success || pending}
      onSubmit={() => {
        if (!parsed.success) return;
        const d = parsed.data;
        if (editing) {
          return updateYear
            .mutateAsync({ id: editing.id, data: d })
            .then((y) => SucessMessage(`Ano lectivo ${y.name} actualizado.`))
            .catch((e) => fail(e, "Não foi possível actualizar o ano lectivo."));
        }
        return createYear
          .mutateAsync(d)
          .then((y) =>
            SucessMessage(
              `Ano lectivo ${y.name} criado${y.status === "activo" ? " e activado" : " como planeado"}.`,
            ),
          )
          .catch((e) => fail(e, "Não foi possível criar o ano lectivo."));
      }}
    >
      <div className="sm:col-span-2">
        <Input
          label="Ano lectivo *"
          startIcon="CalendarRange"
          placeholder="Ex.: 2026/2027"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          error={fieldError("name")}
        />
      </div>
      <Input
        label="Início do ano *"
        type="date"
        value={form.start_date}
        onChange={(e) => setField("start_date", e.target.value)}
        error={fieldError("start_date")}
      />
      <Input
        label="Fim do ano *"
        type="date"
        value={form.end_date}
        onChange={(e) => setField("end_date", e.target.value)}
        error={fieldError("end_date")}
      />
      <Input
        label="Abertura das matrículas *"
        type="date"
        value={form.enrollment_open_date}
        onChange={(e) => setField("enrollment_open_date", e.target.value)}
        error={fieldError("enrollment_open_date")}
      />
      <Input
        label="Fecho das matrículas *"
        type="date"
        value={form.enrollment_close_date}
        onChange={(e) => setField("enrollment_close_date", e.target.value)}
        error={fieldError("enrollment_close_date")}
      />
    </FormModal>
  );
}
