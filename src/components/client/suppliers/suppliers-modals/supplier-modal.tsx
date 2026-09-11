"use client";
import { useModal } from "@/stores";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@/utils/messages";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupplierFormData, supplierSchema } from "@/schemas";
import { Button, Input, GlobalModal, ButtonSubmit, NifVerificationField } from "@/components";
import { useAddSupplier } from "@/hooks/entities/use-suppliers";
import { useNifFormVerification } from "@/hooks";

export function SupplierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["add-supplier"];
  const { mutateAsync: addSupplier, isPending: isAdding } = useAddSupplier();

  const {
    reset,
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    mode: "onChange",
  });
  const taxNumber = watch("taxNumber") || "";
  const { handleStatusChange, handleVerified } = useNifFormVerification({
    setValue,
    setError,
    clearErrors,
    taxNumberField: "taxNumber",
    nameField: "name",
    blockNotFound: false,
  });

  async function onSubmit(data: SupplierFormData) {
    try {
      await addSupplier(data);

      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ||
          "Não foi possível guardar o fornecedor.",
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal("add-supplier");
  };

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="add-supplier"
      title="Adicionar Fornecedor"
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            startIcon="User"
            placeholder="Ex: Tech Solutions Ltd"
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
            {...register("email")}
            placeholder="Ex: contact@techsolutions.com"
            error={errors.email?.message}
          />

          <Input
            label="Endereço"
            startIcon="MapPin"
            {...register("address")}
            placeholder="Ex: Av. da Liberdade, 456"
            error={errors.address?.message}
          />
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit className="w-max" isLoading={isSubmitting || isAdding}>
            Adicionar
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
