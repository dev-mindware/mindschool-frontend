"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Input, SelectField } from "@/components";
import { AcademicSection } from "@/types";
import { StudentFormValues } from "./student-identification-fields";

interface StudentAcademicFieldsProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  selectedSectionId: string;
  sections: AcademicSection[];
  setValue: UseFormSetValue<StudentFormValues>;
}

export function StudentAcademicFields({
  register,
  errors,
  selectedSectionId,
  sections,
  setValue,
}: StudentAcademicFieldsProps) {
  const sectionOptions = sections.map((sec) => ({
    value: sec.id,
    label: `${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
  }));

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        2. Localização & Matrícula
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Endereço de Residência *"
            startIcon="MapPin"
            placeholder="Ex: Bairro Maculusso, Rua 3, Casa 45"
            {...register("address")}
            error={errors.address?.message}
          />
        </div>

        <Input
          label="Município / Cidade"
          startIcon="Building2"
          placeholder="Luanda"
          {...register("city")}
          error={errors.city?.message}
        />

        <SelectField
          label="Turma de Ingresso *"
          value={selectedSectionId}
          options={sectionOptions}
          placeholder="Selecione a turma..."
          onValueChange={(val) => setValue("sectionId", val)}
        />
      </div>
    </div>
  );
}
