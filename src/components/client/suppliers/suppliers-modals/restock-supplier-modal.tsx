"use client";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useModal, useAuthStore, currentStoreStore } from "@/stores";
import { currentSupplierStore } from "@/stores/entities";
import { useAddSupplierStockEntry } from "@/hooks/entities/use-suppliers";
import { useProductsPaginatedSelect } from "@/hooks/items/use-products-select";
import { ErrorMessage } from "@/utils/messages";
import { RestockFormValues, restockSchema, restockDefaultValues } from "@/schemas";
import { Button, Input, GlobalModal, ButtonSubmit, } from "@/components";
import { RestockItemRow } from "./restock-item-row";



export function RestockSupplierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["restock-supplier"];
  const { currentSupplier } = currentSupplierStore();
  const { user } = useAuthStore();
  const { currentStore } = currentStoreStore();
  const { mutateAsync: restock, isPending } = useAddSupplierStockEntry();
  const [page, setPage] = useState(1);
  const { productOptions, isLoading: isLoadingProducts, paginationConfig } =
    useProductsPaginatedSelect(page, 10, isOpen);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RestockFormValues>({
    resolver: zodResolver(restockSchema),
    mode: "onChange",
    defaultValues: restockDefaultValues,
  });

  const { fields, append, remove } = useFieldArray({ name: "items", control });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setPage(1);
    }
  }, [isOpen, reset]);

  const handleCancel = () => {
    reset();
    closeModal("restock-supplier");
  };

  async function onSubmit(data: RestockFormValues) {
    if (!currentSupplier || !currentStore || !user?.company?.id) return;

    try {
      await restock({
        ...data,
        supplierId: currentSupplier.id,
        storeId: currentStore.id,
        companyId: String(user.company.id),
      });
      handleCancel();
    } catch (err: any) {
      ErrorMessage(
        err?.response?.data?.message ||
          "Ocorreu um erro ao registar o reabastecimento."
      );
    }
  }

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="restock-supplier"
      title="Reabastecer Stock"
      className="!max-w-4xl max-h-[90vh]"
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Registe a entrada de stock para o fornecedor{" "}
        <span className="font-medium text-foreground">{currentSupplier?.name}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nº do Documento (Opcional)"
            placeholder="Ex: FR-2026/001"
            {...register("number")}
            error={errors.number?.message}
          />
          <Input
            label="Notas (Opcional)"
            placeholder="Ex: Mercadoria recebida com sucesso"
            {...register("notes")}
            error={errors.notes?.message}
          />
        </div>

        <div className="space-y-4 pt-4 border-t overflow-y-auto max-h-[40vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Itens de Reabastecimento</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ itemId: "", quantity: 1, costAtEntry: 0 })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>

          {errors.items?.root && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">
              {errors.items.root.message}
            </p>
          )}

          {fields.map((field, index) => (
            <RestockItemRow
              key={field.id}
              index={index}
              control={control}
              errors={errors}
              productOptions={productOptions}
              isLoadingProducts={isLoadingProducts}
              paginationConfig={paginationConfig}
              onPageChange={setPage}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit className="w-max" isLoading={isSubmitting || isPending}>
            Reabastecer
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
