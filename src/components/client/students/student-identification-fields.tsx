"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { NifVerifyField } from "@/components/client/finance/nif-verify-field";
import { Input, SelectField } from "@/components";
import { StudentGender, IdDocumentType } from "@/types";

export interface StudentFormValues {
  fullName: string;
  gender: "MALE" | "FEMALE";
  birthDate: string;
  idDocumentType: "IDENTITY_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT";
  idDocumentNumber: string;
  /** NIF opcional (factura-recibo em nome do aluno quando o encarregado não tem NIF). */
  nif?: string;
  address: string;
  city: string;
  province: string;
  sectionId?: string;
  guardianMode: "existing" | "new";
  guardianId?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship: string;
  /** Numero do documento do encarregado (a API identifica-o por este numero). */
  guardianDocument?: string;
}

interface StudentIdentificationFieldsProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  selectedGender: StudentGender;
  selectedDocType: IdDocumentType;
  setValue: UseFormSetValue<StudentFormValues>;
  watch: UseFormWatch<StudentFormValues>;
}

export function StudentIdentificationFields({
  register,
  errors,
  selectedGender,
  selectedDocType,
  setValue,
  watch,
}: StudentIdentificationFieldsProps) {
  const genderOptions = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
  ];

  const docTypeOptions = [
    { value: "IDENTITY_CARD", label: "Bilhete de Identidade (BI)" },
    { value: "BIRTH_CERTIFICATE", label: "Cédula / Assento de Nascimento" },
    { value: "PASSPORT", label: "Passaporte" },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        1. Identificação do Aluno
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Nome Completo do Estudante *"
            startIcon="User"
            placeholder="Ex: Manuel António da Silva"
            {...register("fullName")}
            error={errors.fullName?.message}
          />
        </div>

        <SelectField
          label="Género *"
          value={selectedGender}
          options={genderOptions}
          onValueChange={(val) => setValue("gender", val as StudentGender)}
        />

        <Input
          type="date"
          label="Data de Nascimento *"
          startIcon="Calendar"
          {...register("birthDate")}
          error={errors.birthDate?.message}
        />

        <SelectField
          label="Tipo de Documento *"
          value={selectedDocType}
          options={docTypeOptions}
          onValueChange={(val) => setValue("idDocumentType", val as IdDocumentType)}
        />

        <Input
          label="Número do Documento *"
          startIcon="CreditCard"
          placeholder="Ex: 007849302LA042"
          {...register("idDocumentNumber")}
          error={errors.idDocumentNumber?.message}
        />
        <div className="sm:col-span-2">
          <NifVerifyField register={register as never} errors={errors as never} watch={watch as never} />
        </div>
      </div>
    </div>
  );
}
