"use client";
import { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { CreditNoteFormData } from "@/schemas";
import { RHFSelect, Textarea } from "@/components";
import {
  CREDIT_NOTE_CORRECTION_OPTIONS,
  CREDIT_NOTE_ANNULMENT_OPTION,
} from "@/utils";

interface ReasonNotesSectionProps {
  control: Control<CreditNoteFormData>;
  register: UseFormRegister<CreditNoteFormData>;
  errors: FieldErrors<CreditNoteFormData>;
  isInvoiceDoc: boolean;
}

export function ReasonNotesSection({
  control,
  register,
  errors,
  isInvoiceDoc,
}: ReasonNotesSectionProps) {
  return (
    <div className="space-y-4">
      <RHFSelect
        label="Motivo"
        name="reason"
        control={control}
        options={[
          ...(isInvoiceDoc ? CREDIT_NOTE_CORRECTION_OPTIONS : []),
          CREDIT_NOTE_ANNULMENT_OPTION,
        ]}
      />

      <Textarea
        label="Justificação do motivo"
        {...register("notes")}
        error={errors?.notes?.message}
        placeholder="Informe a justificação"
      />
    </div>
  );
}
