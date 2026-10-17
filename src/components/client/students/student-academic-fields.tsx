"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components";
import { StudentFormValues } from "./student-identification-fields";

interface StudentAcademicFieldsProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
}

export function StudentAcademicFields({
  register,
  errors,
}: StudentAcademicFieldsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        2. Localização & Residência
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
          label="Município / Cidade *"
          startIcon="Building2"
          placeholder="Luanda"
          {...register("city")}
          error={errors.city?.message}
        />

        <Input
          label="Província *"
          startIcon="Map"
          placeholder="Luanda"
          {...register("province")}
          error={errors.province?.message}
        />
      </div>
    </div>
  );
}
