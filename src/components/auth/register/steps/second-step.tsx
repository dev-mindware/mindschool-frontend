"use client"
import { cn } from "@/lib/utils";
import { Input, NifVerificationField } from "@/components";
import { RegisterFormData } from "@/schemas";
import { useFormContext } from "react-hook-form";
import { StepsHeader } from "./steps-header";
import { useNifFormVerification } from "@/hooks";

export function SecondStep() {
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<RegisterFormData>();
  const taxNumber = watch("step2.company.taxNumber") || "";
  const companyPhoneField = register("step2.company.phone");
  const { handleStatusChange, handleVerified } = useNifFormVerification({
    setValue,
    setError,
    clearErrors,
    taxNumberField: "step2.company.taxNumber",
    nameField: "step2.company.name",
  });

  return (
    <div className={cn("flex flex-col gap-6")}>
      <div className="flex flex-col items-center mt-4 gap-2 text-center">
        <StepsHeader title="Dados da actividade" />
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          O Mindgest pode ser usado por empresas e por pessoas singulares.
        </p>
      </div>
      <div className="grid gap-6">
        <NifVerificationField
          label="NIF do Contribuinte"
          placeholder="Introduza o NIF empresarial ou pessoal"
          value={taxNumber}
          onChange={(value) =>
            setValue("step2.company.taxNumber", value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          onVerified={handleVerified}
          onStatusChange={handleStatusChange}
          error={
            errors?.step2?.company?.taxNumber &&
            errors?.step2?.company?.taxNumber?.message
          }
        />
        <Input
          startIcon="User"
          label="Nome completo ou designação comercial"
          placeholder="Introduza o nome ou a designação comercial"
          {...register("step2.company.name")}
          error={
            errors?.step2?.company?.name &&
            errors?.step2?.company?.name?.message
          }
        />
        <Input
          type="email"
          label="Email de contacto"
          startIcon="Mail"
          placeholder="Introduza o endereço de email"
          {...register("step2.company.email")}
          error={
            errors?.step2?.company?.email &&
            errors?.step2?.company?.email?.message
          }
        />
        <Input
          label="Telefone"
          inputMode="numeric"
          startIcon="Phone"
          placeholder="Introduza o número de telefone"
          {...companyPhoneField}
          onChange={(e) => {
            // Bloqueia tudo o que não for dígito antes de chegar ao input/form
            e.target.value = e.target.value.replace(/\D/g, "");
            companyPhoneField.onChange(e);
          }}
          error={
            errors?.step2?.company?.phone &&
            errors?.step2?.company?.phone?.message
          }
        />
        <Input
          label="Endereço"
          startIcon="MapPin"
          placeholder="Introduza o endereço"
          {...register("step2.company.address")}
          error={
            errors?.step2?.company?.address &&
            errors?.step2?.company?.address?.message
          }
        />
      </div>     
    </div>
  );
}
