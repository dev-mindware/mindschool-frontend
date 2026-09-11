"use client";

import { cn } from "@/lib";
import { useState } from "react";
import { Button, Input, NifVerificationField } from "@/components";
import type { CompanyFormData } from "@/schemas/company";
import { useForm } from "react-hook-form";
import { User } from "@/types";
import { useUpdateCompany } from "@/hooks";
import { ErrorMessage, SucessMessage } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema } from "@/schemas/company";
import { useNifFormVerification } from "@/hooks";

export function CompanyForm({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutateAsync: updateCompany, isPending } =
    useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    mode: "onSubmit",
    defaultValues: {
      name: user?.company?.name || "",
      taxNumber: user?.company?.taxNumber || "",
      address: user?.company?.address || "",
      phone: user?.company?.phone || "",
      email: user?.company?.email || "",
      website: user?.company?.website || null,
    },
  });
  const taxNumber = watch("taxNumber") || "";
  const { handleStatusChange, handleVerified } = useNifFormVerification({
    setValue,
    setError,
    clearErrors,
    taxNumberField: "taxNumber",
    nameField: "name",
  });

  async function handleCompanySubmit(data: CompanyFormData) {
    if (!user?.company?.id) return;

    await updateCompany(
      { id: user.company.id, data },
      {
        onSuccess: () => {
          SucessMessage("Dados da actividade actualizados com sucesso!");
          setIsEditing(false);
        },
        onError: (error: any) => {
          ErrorMessage(
            error?.response?.data?.message || "Não foi possível actualizar os dados da actividade",
          );
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(handleCompanySubmit)}
      className="bg-card rounded-lg border p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h3 className="font-semibold text-lg">Dados da Actividade</h3>
        <div className="sm:ml-auto flex gap-2">
          <Button
            type="button"
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) reset();
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "Cancelar" : "Editar dados"}
          </Button>
        </div>
      </div>

      <div
        className={cn("grid grid-cols-1 gap-6 md:grid-cols-2", {
          "pointer-events-none": !isEditing,
        })}
      >
        <Input
          {...register("name")}
          label="Nome completo ou designação comercial"
          placeholder="Ex.: Manuel António ou Mindgest Soluções"
          className="bg-background shadow-none"
          readOnly={!isEditing}
          error={errors.name?.message}
        />

        <Input
          {...register("email")}
          label="Email de contacto"
          placeholder="Ex.: contacto@mindgest.com"
          className="bg-background shadow-none"
          readOnly={!isEditing}
          error={errors?.email?.message}
        />

        <Input
          {...register("phone")}
          label="Telefone de contacto"
          placeholder="Ex: +244 900 000 000"
          className="bg-background shadow-none"
          readOnly={!isEditing}
          error={errors?.phone?.message}
        />

        <Input
          {...register("address")}
          label="Endereço"
          placeholder="Ex: Rua Principal, 123, Luanda"
          className="bg-background shadow-none"
          readOnly={!isEditing}
          error={errors?.address?.message}
        />

        <NifVerificationField
          label="NIF"
          placeholder="NIF empresarial ou pessoal"
          value={taxNumber}
          onChange={(value) =>
            setValue("taxNumber", value, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          onVerified={handleVerified}
          onStatusChange={handleStatusChange}
          verificationEnabled={isEditing}
          className="bg-background shadow-none"
          disabled={!isEditing}
          error={errors?.taxNumber?.message}
        />

        <Input
          {...register("website")}
          label="Website"
          placeholder="Ex.: https://www.mindgest.com"
          className="bg-background shadow-none"
          readOnly={!isEditing}
          error={errors.website?.message}
        />
      </div>

      {isEditing && (
        <div className="mt-8 flex justify-end gap-3 border-t pt-6">
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? "A gravar..." : "Guardar Alterações"}
          </Button>
        </div>
      )}
    </form>
  );
}
