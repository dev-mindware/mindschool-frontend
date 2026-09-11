"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  GlobalModal,
  Textarea,
  Input,
  RHFSelect,
  RequestError,
  ButtonSubmit,
  CategoryModal,
  ServiceModalSkeleton,
  InputCurrency,
} from "@/components";
import { PaginatedSelect } from "@/components/shared";
import { useModal } from "@/stores/modal/use-modal-store";
import { ItemFormData, itemSchema } from "@/schemas";
import {
  useAddItem,
  useCategoriesSelect,
  useTaxesSelect,
  useUpdateItem,
} from "@/hooks";
import { currentServiceStore, currentStoreStore } from "@/stores";
import { useAuth } from "@/hooks/auth";
import { ErrorMessage } from "@/utils/messages";
import { formatCurrency, parseCurrency } from "@/utils";
import { useMemo } from "react";

type ServiceModalProps = {
  action: "add" | "edit";
};

export function ServiceModal({ action }: ServiceModalProps) {
  const { user } = useAuth();
  const modalId = `${action}-service`;
  const { closeModal, open, openModal } = useModal();
  const { currentService } = currentServiceStore();
  const { currentStore } = currentStoreStore();
  const { mutateAsync: addItemMutate, isPending: isAdding } = useAddItem();
  const {
    mutateAsync: updateService,
    isPending: isUpdating,
    reset: resetMutate,
  } = useUpdateItem();
  const {
    categoryOptions,
    isLoading,
    isError,
    refetch,
    pagination: categoryPagination,
    setPage: setCategoryPage,
  } = useCategoriesSelect();
  const {
    taxOptions,
    isLoading: isTaxesLoading,
    pagination: taxPagination,
    setPage: setTaxPage,
    taxSearch,
    setTaxSearch,
  } = useTaxesSelect();
  const isOpen = open[modalId];

  const finalCategoryOptions = useMemo(() => {
    const currentId =
      currentService?.categoryId || (currentService as any)?.category_id;
    const currentName = (currentService as any)?.category;

    if (
      currentId &&
      currentName &&
      !categoryOptions.find((o) => o.value === currentId)
    ) {
      return [{ label: currentName, value: currentId }, ...categoryOptions];
    }
    return categoryOptions;
  }, [currentService, categoryOptions]);

  const finalTaxOptions = useMemo(() => {
    const currentId = currentService?.taxId || currentService?.tax?.id;
    const currentName = currentService?.tax?.name
      ? `${currentService.tax.name} (${currentService.tax.rate}%)`
      : null;

    if (
      currentId &&
      currentName &&
      !taxOptions.find((o) => o.value === currentId)
    ) {
      return [{ label: currentName, value: currentId }, ...taxOptions];
    }
    return taxOptions;
  }, [currentService, taxOptions]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (action === "edit" && currentService) {
        reset({
          type: "SERVICE",
          name: currentService.name,
          price: currentService.price,
          description: currentService.description || "",
          categoryId: currentService.categoryId,
          taxId: currentService.taxId || currentService.tax?.id || "",
          ...(user?.role === "OWNER" && {
            companyId: String(user?.company?.id),
          }),
        });
      } else {
        reset({
          type: "SERVICE",
          name: "",
          price: undefined,
          description: "",
          categoryId: "",
          taxId: "",
          ...(user?.role === "OWNER" && {
            companyId: String(user?.company?.id),
          }),
        });
      }
    }
  }, [isOpen, action, currentService, reset, user]);

  const cleanPayload = (data: ItemFormData) => {
    return {
      ...data,
      taxId: data.taxId,
      cost: data.cost ?? undefined,
      quantity: data.quantity ?? undefined,
      weight: data.weight ?? undefined,
      minStock: data.minStock ?? undefined,
      daysToExpiry: data.daysToExpiry ?? undefined,
    } as any;
  };

  const onSubmit = async (data: ItemFormData) => {
    try {
      const cleanedData = cleanPayload(data);

      if (action === "add") {
        await addItemMutate({
          ...cleanedData,
          ...(user?.role === "OWNER" &&
            currentStore?.id && { storeId: currentStore?.id }),
        });
      } else if (currentService) {
        const { type, companyId, ...rest } = cleanedData;
        await updateService({
          id: currentService.id,
          data: rest,
        });
      }
      handleCancel();
    } catch (err: unknown) {
      // O onError do hook já exibe a notificação
    }
  };

  const handleCancel = () => {
    reset();
    closeModal(modalId);
    resetMutate();
  };

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id={modalId}
      title={
        <div className="w-full flex items-center justify-between gap-2 mb-4">
          <span className="text-lg font-bold">
            {action === "add" ? "Adicionar Serviço" : "Editar Serviço"}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openModal("add-category")}
          >
            Adicionar Categoria
          </Button>
        </div>
      }
      className="!max-h-[85vh] !w-max"
    >
      {isLoading || isTaxesLoading ? (
        <ServiceModalSkeleton />
      ) : isError ? (
        <RequestError refetch={refetch} message="Erro ao carregar categorias" />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="sm:w-[35rem]">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nome do Serviço"
                startIcon="User"
                {...register("name")}
                placeholder="Ex: Consultoria Técnica"
                error={errors.name?.message}
              />
              <Controller
                control={control}
                name="taxId"
                render={({ field: { onChange, value } }) => (
                  <PaginatedSelect
                    label="Imposto"
                    value={value}
                    options={finalTaxOptions}
                    onChange={onChange}
                    isLoading={isTaxesLoading}
                    pagination={taxPagination}
                    onPageChange={setTaxPage}
                    searchValue={taxSearch}
                    onSearchChange={setTaxSearch}
                    searchPlaceholder="Pesquisar imposto..."
                    placeholder="Seleccione um imposto"
                    className="!w-full"
                    error={errors.taxId?.message}
                  />
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <InputCurrency
                    ref={field.ref}
                    label="Preço de Venda"
                    placeholder="100,00"
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    error={errors.price?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="categoryId"
                render={({ field: { onChange, value } }) => (
                  <PaginatedSelect
                    label="Categoria"
                    value={value}
                    options={finalCategoryOptions}
                    onChange={onChange}
                    isLoading={isLoading}
                    pagination={categoryPagination}
                    onPageChange={setCategoryPage}
                    placeholder="Seleccione uma categoria"
                    className="!w-full"
                  />
                )}
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Descrição"
                {...register("description")}
                placeholder="Breve descrição do serviço..."
                error={errors.description?.message}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <ButtonSubmit className="w-max" isLoading={isAdding || isUpdating}>
              {action === "add" ? "Criar serviço" : "Guardar"}
            </ButtonSubmit>
          </div>
        </form>
      )}
      {open["add-category"] && <CategoryModal action="add" />}
    </GlobalModal>
  );
}
