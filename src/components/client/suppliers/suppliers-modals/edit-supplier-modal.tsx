"use client";

import { useEffect, useState } from "react";
import { Button, GlobalModal, Input, NifVerificationField } from "@/components";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditSupplierFormData, editSupplierSchema } from "@/schemas";
import {
  useUpdateSupplier,
  useDeleteSupplierItemsBulk,
} from "@/hooks/entities/use-suppliers";
import { currentSupplierStore } from "@/stores/entities/current-supplier-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { MultiSelect, SelectOption, EmptyState } from "@/components/common";
import { ItemData } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFetch } from "@/hooks/common/use-fetch";
import { ErrorMessage, SucessMessage } from "@/utils";
import { useNifFormVerification } from "@/hooks";

export function EditSupplierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["edit-supplier"];
  const { currentSupplier } = currentSupplierStore();

  const { mutateAsync: updateSupplier, isPending: isUpdating } =
    useUpdateSupplier();
  const { mutateAsync: deleteItemsBulk, isPending: isDeleting } =
    useDeleteSupplierItemsBulk();

  const [selectedItems, setSelectedItems] = useState<SelectOption[]>([]);
  const [initialItems, setInitialItems] = useState<SelectOption[]>([]);

  const { data: itemsData, isLoading: isLoadingItems } = useFetch<{
    data: ItemData[];
  }>(
    `supplier-items-all-${currentSupplier?.id}`,
    `/suppliers/${currentSupplier?.id}/items`,
    { enabled: !!currentSupplier?.id && isOpen },
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditSupplierFormData>({
    resolver: zodResolver(editSupplierSchema),
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

  useEffect(() => {
    if (currentSupplier && isOpen) {
      reset({
        name: currentSupplier.name,
        email: currentSupplier.email,
        phone: currentSupplier.phone,
        address: currentSupplier.address,
        taxNumber: currentSupplier.taxNumber,
        isActive: currentSupplier.isActive ?? true,
      });
    }
  }, [currentSupplier, reset, isOpen]);

  useEffect(() => {
    const arr = Array.isArray(itemsData) ? itemsData : itemsData?.data;
    if (arr && isOpen) {
      const options = arr.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
      setSelectedItems(options);
      setInitialItems(options);
    }
  }, [itemsData, isOpen]);

  const isPending = isUpdating || isDeleting;

  async function onSubmit(data: EditSupplierFormData) {
    if (!currentSupplier) return;

    try {
      const removedIds = initialItems
        .filter(
          (init) => !selectedItems.find((sel) => sel.value === init.value),
        )
        .map((item) => item.value);

      const promises: Promise<any>[] = [
        updateSupplier({ id: currentSupplier.id, data }),
      ];

      if (removedIds.length > 0) {
        promises.push(
          deleteItemsBulk({
            supplierId: currentSupplier.id,
            itemIds: removedIds,
          }),
        );
      }

      await Promise.all(promises);

      SucessMessage("Fornecedor actualizado com sucesso!");

      closeModal("edit-supplier");
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Não foi possível actualizar o fornecedor",
      );
    }
  }

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="edit-supplier"
      title="Editar Fornecedor"
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Input
            label="Nome"
            type="text"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Telefone"
            className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <NifVerificationField
            label="NIF"
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
            label="Endereço"
            {...register("address")}
            error={errors.address?.message}
          />

          <div className="flex flex-col gap-2 justify-center mt-[2px]">
            <Label className="text-sm font-medium">Status da Conta</Label>
            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="is-active"
                  />
                )}
              />
              <Label htmlFor="is-active">Fornecedor Ativo</Label>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h4 className="text-sm font-semibold mb-4">
            Produtos Fornecidos (Remova clicando no X)
          </h4>

          {isLoadingItems ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : initialItems.length === 0 ? (
            <EmptyState
              icon="PackageOpen"
              title="Sem produtos"
              description="Este fornecedor não tem produtos associados."
              className="p-4 mt-0"
            />
          ) : (
            <>
              <MultiSelect
                label="Produtos Atuais"
                options={initialItems}
                value={selectedItems}
                onChange={setSelectedItems}
                isLoading={isLoadingItems}
                placeholder="Nenhum produto listado..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                Nota: ao guardar, os itens removidos deixarão de estar associados a este
                fornecedor.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal("edit-supplier")}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isPending} disabled={isPending}>
            Guardar alterações
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
