"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal, currentClientStore } from "@/stores";
import { ClientFormData, clientSchema } from "@/schemas";
import { useAddClient, useUpdateClient } from "@/hooks/entities";
import { Button, Input, GlobalModal, ButtonSubmit, NifVerificationField } from "@/components";
import { useNifFormVerification } from "@/hooks";

type ClientModalProps = {
  action: "add" | "edit";
};

export function ClientModal({ action }: ClientModalProps) {
  const { closeModal, open } = useModal();
  const isOpen = open["add-client"] || open["edit-client"];
  const { currentClient } = currentClientStore();
  const { mutateAsync: addClient, isPending: isAdding } = useAddClient();
  const { mutateAsync: editClient, isPending: isEditing } = useUpdateClient();
  const {
    reset,
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onChange",
  });
  const taxNumber = watch("taxNumber") || "";
  const { handleStatusChange, handleVerified } = useNifFormVerification({
    setValue,
    setError,
    clearErrors,
    taxNumberField: "taxNumber",
    nameField: "name",
  });

  useEffect(() => {
    if (action === "edit" && currentClient) {
      reset({
        name: currentClient.name,
        email: currentClient.email,
        phone: currentClient.phone,
        address: currentClient.address,
        taxNumber: currentClient.taxNumber,
      });
    }
  }, [action, currentClient, reset]);

  async function onSubmit(data: ClientFormData) {
    try {
      const finalData = {
        ...data,
        email: data.email || undefined,
        address: data.address || undefined,
      };

      if (action === "add") {
        await addClient(finalData as any);
      } else if (action === "edit" && currentClient) {
        await editClient({ id: currentClient.id, data: finalData as any });
      }

      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
        "Não foi possível guardar o cliente."
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal(action === "add" ? "add-client" : "edit-client");
  };

  if ((action === "edit" && !currentClient) || !isOpen) return null;

  return (
    <GlobalModal
      canClose
      id={action === "add" ? "add-client" : "edit-client"}
      title={action === "add" ? "Adicionar Cliente" : "Editar Cliente"}
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            startIcon="User"
            placeholder="Ex: John Doe"
            {...register("name")}
            error={errors.name?.message}
          />

          <NifVerificationField
            label="NIF"
            placeholder="Ex: 546829403"
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
            error={errors.taxNumber?.message}
          />

          <Input
            label="Telefone"
            startIcon="Phone"
            maxLength={9}
            placeholder="9xxxxxxxx"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Input
            type="email"
            label="Email"
            startIcon="Mail"
            placeholder="Ex: cea.co@gmail.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Endereço"
            placeholder="Ex: Av. Pedro Castro"
            startIcon="MapPin"
            {...register("address")}
            error={errors.address?.message}

          />
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit
            className="w-max"
            isLoading={isSubmitting || isAdding || isEditing}
          >
            {action === "add" ? "Adicionar" : "Guardar alterações"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
