"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { StockFormData, stockSchema } from "@/schemas/stock-schema";
import { useAddStock } from "@/hooks/stock";
import {
  Button,
  Input,
  GlobalModal,
  ButtonSubmit,
  PaginatedSelect,
  RequestError,
} from "@/components";
import { useGetStoresPaginated } from "@/hooks/entities";
import { useGetItemsPaginated } from "@/hooks/stock";
import { useState } from "react";

export function StockModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["add-stock"];

  const { mutateAsync: addStock, isPending: isAdding } = useAddStock();
  const [storePage, setStorePage] = useState(1);
  const [itemPage, setItemPage] = useState(1);

  const {
    data: storesData,
    isLoading: isLoadingStores,
    isError: storesError,
    totalPages: storeTotalPages,
    refetch: refetchStores,
  } = useGetStoresPaginated(storePage, 10, "OWNER");

  const {
    data: itemsData,
    isLoading: isLoadingItems,
    isError: itemsError,
    totalPages: itemTotalPages,
    refetch: refetchItems,
  } = useGetItemsPaginated(itemPage, 10, { type: "PRODUCT" });

  const {
    reset,
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    mode: "onChange",
  });

  async function onSubmit(data: StockFormData) {
    try {
      await addStock(data);
      handleCancel();
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message || "Não foi possível guardar o stock."
      );
    }
  }

  const handleCancel = () => {
    reset();
    closeModal("add-stock");
  };


  console.log("renderizou")
  if (!isOpen) return null;

  if (storesError || itemsError) {
    return (
      <GlobalModal
        id="add-stock-error"
        title="Adicionar Stock"
        canClose
        className="!w-max"
      >
        <div className="p-4">
          <RequestError
            refetch={storesError ? refetchStores : refetchItems}
            message={`Ocorreu um erro ao carregar os ${storesError ? "lojas" : "produtos"
              }`}
          />
        </div>
      </GlobalModal>
    );
  }

  return (
    <GlobalModal
      canClose
      id="add-stock"
      title="Adicionar Stock"
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-1">
            <Controller
              name="itemsId"
              control={control}
              render={({ field }) => (
                <PaginatedSelect
                  label="Produto"
                  placeholder="Seleccione o produto"
                  options={itemsData.map((i) => ({ label: i.name, value: i.id }))}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={isLoadingItems}
                  pagination={{ page: itemPage, totalPages: itemTotalPages }}
                  onPageChange={setItemPage}
                  className="w-full"
                  error={errors.itemsId?.message}
                />
              )}
            />
          </div>

          <div className="col-span-1">
            <Controller
              name="storeId"
              control={control}
              render={({ field }) => (
                <PaginatedSelect
                  label="Loja"
                  placeholder="Seleccione a loja"
                  options={storesData.map((s) => ({ label: s.name, value: s.id }))}
                  value={field.value}
                  onChange={field.onChange}
                  isLoading={isLoadingStores}
                  pagination={{ page: storePage, totalPages: storeTotalPages }}
                  onPageChange={setStorePage}
                  className="w-full"
                  error={errors.storeId?.message}
                />
              )}
            />
          </div>

          <Input
            type="number"
            label="Quantidade"
            placeholder="Ex: 100"
            {...register("quantity", { valueAsNumber: true })}
            error={errors.quantity?.message}
          />

          <Input
            type="number"
            label="Reservado"
            placeholder="Ex: 0"
            {...register("reserved", { valueAsNumber: true })}
            error={errors.reserved?.message}
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
