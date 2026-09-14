"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Input, SelectField } from "@/components";
import { StudentFormValues } from "./student-identification-fields";

interface StudentGuardianFieldsProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  selectedRelationship: string;
  setValue: UseFormSetValue<StudentFormValues>;
}

export function StudentGuardianFields({
  register,
  errors,
  selectedRelationship,
  setValue,
}: StudentGuardianFieldsProps) {
  const relationshipOptions = [
    { value: "Pai", label: "Pai" },
    { value: "Mãe", label: "Mãe" },
    { value: "Tio/Tia", label: "Tio(a)" },
    { value: "Avô/Avó", label: "Avô(ó)" },
    { value: "Tutor Legal", label: "Tutor Legal" },
    { value: "Outro", label: "Outro" },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        3. Encarregado de Educação
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3">
          <Input
            label="Nome do Encarregado *"
            startIcon="User"
            placeholder="Ex: Domingos da Silva"
            {...register("guardianName")}
            error={errors.guardianName?.message}
          />
        </div>

        <Input
          label="Telefone Principal *"
          startIcon="Phone"
          placeholder="9xxxxxxxx"
          maxLength={9}
          {...register("guardianPhone")}
          error={errors.guardianPhone?.message}
        />

        <div className="sm:col-span-2">
          <SelectField
            label="Grau de Parentesco *"
            value={selectedRelationship}
            options={relationshipOptions}
            onValueChange={(val) => setValue("guardianRelationship", val)}
          />
        </div>
      </div>
    </div>
  );
}
