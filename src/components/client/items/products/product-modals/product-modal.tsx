"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Button,
  Textarea,
  GlobalModal,
  RHFSelect,
  RequestError,
  ButtonSubmit,
  CategoryModal,
  ProductModalSkeleton,
  FeatureGate,
  InputCurrency,
} from "@/components";
import { PaginatedSelect } from "@/components/shared";
import { useModal, currentStoreStore } from "@/stores";
import { ItemFormData, itemSchema } from "@/schemas";
import {
  useAddItem,
  useCategoriesSelect,
  useTaxesSelect,
  useAuth,
} from "@/hooks";
import { ErrorMessage } from "@/utils/messages";
import { useGetSuppliersSelect } from "@/hooks/entities/use-suppliers";
import { PLAN_HIERARCHY, PlanType } from "@/types/subscription";
import { UNIT_OPTIONS } from "@/constants";


export function AddProductModal() {
  const { open, openModal } = useModal();
  const isOpen = open["add-product"];

  if (!isOpen) return null;

  return (
    <>
      <GlobalModal
        canClose
        id="add-product"
        title={
          <div className="w-full flex items-center justify-between gap-2 mb-4">
            <span>Adicionar Produto</span>
            <Button
              size="sm"
              className="sticky right-0"
              variant="outline"
              onClick={() => openModal("add-category")}
            >
              Adicionar Categoria
            </Button>
          </div>
        }
        className="!max-h-[85vh] !w-max"
      >
        <AddProductFormContent />
      </GlobalModal>
      {open["add-category"] && <CategoryModal action="add" />}
    </>
  );
}

function AddProductFormContent() {
  const { user } = useAuth();
  const { closeModal, modalData } = useModal();
  const { currentStore } = currentStoreStore();
  const { mutateAsync: addItemMutate, isPending: isAdding } = useAddItem();

  const {
    categoryOptions,
    isLoading: isLoadingCategories,
    isError,
    refetch,
    pagination,
    setPage,
  } = useCategoriesSelect();
  const {
    taxOptions,
    isLoading: isTaxesLoading,
    pagination: taxPagination,
    setPage: setTaxPage,
    taxSearch,
    setTaxSearch,
  } = useTaxesSelect();

  const currentPlan = (user?.company?.subscription?.plan.name as PlanType) || "Base";
  const planLevel = PLAN_HIERARCHY[currentPlan] || 0;
  const hasSuppliers =
    user?.company?.subscription?.plan?.features?.hasSuppliers ??
    (planLevel >= PLAN_HIERARCHY.Pro);

  const {
    supplierOptions,
    isLoading: isLoadingSuppliers,
    isError: isErrorSuppliers,
    refetch: refetchSuppliers,
    pagination: paginationSuppliers,
    setPage: setPageSuppliers,
  } = useGetSuppliersSelect(hasSuppliers);

  const initialBarcode = modalData["add-product"]?.barcode || "";

  const supplierOptionsWithNone = [
    { label: "Nenhum", value: "none" },
    ...supplierOptions,
  ];

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    mode: "onChange",
    defaultValues: {
      barcode: initialBarcode,
      price: undefined,
      cost: undefined,
      companyId: String(user?.company?.id),
      type: "PRODUCT",
      categoryId: "",
      supplierId: "none",
      unit: "",
      minStock: 0,
      taxId: "",
    },
  });

  const cleanPayload = (data: ItemFormData) => {
    return {
      ...data,
      taxId: data.taxId,
      cost: data.cost ?? undefined,
      quantity: data.quantity ?? undefined,
      weight: data.weight ?? undefined,
      minStock: data.minStock ?? undefined,
      supplierId:
        !data.supplierId || data.supplierId === "none" ? null : data.supplierId,
      unit: data.unit === "none" || !data.unit ? undefined : data.unit,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  };

  async function onSubmit(data: ItemFormData) {
    try {
      const cleanedData = cleanPayload(data);
      await addItemMutate({
        ...cleanedData,
        ...(user?.role === "OWNER" &&
          currentStore?.id && { storeId: currentStore?.id }),
      });
      handleCancel();
    } catch (error: unknown) {
      // O onError do hook já exibe a notificação — o catch aqui apenas evita
      // que o unhandled rejection quebre o formulário sem fechar o modal
    }
  }

  const handleCancel = () => {
    reset();
    closeModal("add-product");
  };

  if (isLoadingCategories || isTaxesLoading || (hasSuppliers && isLoadingSuppliers))
    return <ProductModalSkeleton />;
  if (isError || (hasSuppliers && isErrorSuppliers)) {
    return (
      <RequestError
        refetch={() => {
          refetch();
          if (hasSuppliers) refetchSuppliers();
        }}
        message="Ocorreu um erro ao carregar os dados"
      />
    );
  }

  return (
    <form
      data-tour="product-modal"
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-6 sm:grid-flow-col sm:auto-cols-fr"
    >
      <div className="">
        <div className="space-y-4 sm:w-[35rem]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div data-tour="product-form-name">
                <Input
                  label="Nome"
                  startIcon="Tag"
                  {...register("name")}
                  error={errors.name?.message}
                  placeholder="Ex: Teclado Logitech"
                />
              </div>
              <Controller
                control={control}
                name="taxId"
                render={({ field: { onChange, value } }) => (
                  <PaginatedSelect
                    label="Imposto"
                    value={value}
                    options={taxOptions}
                    onChange={onChange}
                    isLoading={isTaxesLoading}
                    pagination={taxPagination}
                    onPageChange={setTaxPage}
                    searchValue={taxSearch}
                    onSearchChange={setTaxSearch}
                    searchPlaceholder="Pesquisar imposto..."
                    placeholder="Seleccione um imposto"
                    error={errors.taxId?.message}
                    fullWidth
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <div data-tour="product-form-price">
                    <InputCurrency
                      ref={field.ref}
                      label="Preço Unitário"
                      placeholder="0,00"
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      error={errors.price?.message}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="cost"
                render={({ field }) => (
                  <div data-tour="product-form-cost">
                    <InputCurrency
                      ref={field.ref}
                      label="Custo de Compra"
                      placeholder="0,00"
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      error={errors.cost?.message}
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { onChange, value } }) => (
                  <div data-tour="product-form-category">
                    <PaginatedSelect
                      label="Categoria"
                      value={value}
                      options={categoryOptions}
                      onChange={onChange}
                      isLoading={isLoadingCategories}
                      pagination={pagination}
                      onPageChange={setPage}
                      placeholder="Seleccione uma opção"
                      fullWidth
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="quantity"
                render={({ field }) => (
                  <div data-tour="product-form-quantity">
                    <Input
                      type="quantity"
                      startIcon="Scale"
                      label="Quantidade"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      error={errors.quantity?.message}
                    />
                  </div>
                )}
              />
            </div>

            <FeatureGate minPlan="Smart" fallback="hidden">
              <div className="space-y-4" data-tour="product-stock-fields">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div data-tour="product-form-barcode">
                    <Input
                      label="Código de Barras (Opcional)"
                      placeholder="Ex: 7891234567890"
                      {...register("barcode")}
                      error={errors.barcode?.message}
                      startIcon="Barcode"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={control}
                    name="minStock"
                    render={({ field }) => (
                      <div data-tour="product-form-min-stock">
                        <Input
                          type="quantity"
                          startIcon="Scale"
                          label="Stock Mínimo"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          error={errors.minStock?.message}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
            </FeatureGate>

            <div className="grid grid-cols-2 gap-4">
              <FeatureGate minPlan="Pro" fallback="hidden">
                <RHFSelect
                  control={control}
                  name="unit"
                  label="Unidade de Medida (Opcional)"
                  options={UNIT_OPTIONS}
                  placeholder="Seleccione uma unidade"
                />
                <Controller
                  control={control}
                  name="expiryDate"
                  render={({ field }) => (
                    <Input
                      type="date"
                      label="Data de Validade (opcional)"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.expiryDate?.message}
                    />
                  )}
                />
              </FeatureGate>
            </div>
            <div className="grid grid-cols-1">
              <FeatureGate minPlan="Pro" fallback="hidden">
                <Controller
                  control={control}
                  name="supplierId"
                  render={({ field: { onChange, value } }) => (
                    <PaginatedSelect
                      label="Fornecedor (Opcional)"
                      value={value}
                      options={supplierOptionsWithNone}
                      onChange={onChange}
                      isLoading={isLoadingSuppliers}
                      pagination={paginationSuppliers}
                      onPageChange={setPageSuppliers}
                      placeholder="Seleccione uma opção"
                      fullWidth
                    />
                  )}
                />
              </FeatureGate>
            </div>

            <FeatureGate minPlan="Pro" fallback="hidden">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  inputMode="decimal"
                  startIcon="Weight"
                  label="Peso (Kg) (opcional)"
                  {...register("weight", {
                    setValueAs: (v) => {
                      if (v === "" || v === null || v === undefined)
                        return undefined;
                      const trimmed = String(v).trim();
                      if (trimmed === "") return undefined;
                      const normalized = trimmed.replace(",", ".");
                      const parsed = Number(normalized);
                      return isNaN(parsed) ? "invalid" : parsed;
                    },
                  })}
                  error={errors.weight?.message}
                  placeholder="Ex: 0.24"
                />
                <Input
                  label="Dimensões (opcional)"
                  placeholder="Ex: 10x20x30 cm"
                  {...register("dimensions")}
                  error={errors.dimensions?.message}
                />
              </div>
            </FeatureGate>

            <Textarea
              label="Descrição (opcional)"
              {...register("description")}
              className="mt-1 min-h-[100px]"
              placeholder="Escreva detalhes do item..."
              error={errors?.description?.message}
            />
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            data-tour="product-form-cancel"
          >
            Cancelar
          </Button>
          <span data-tour="product-form-submit">
          <ButtonSubmit className="w-max" isLoading={isAdding || isSubmitting}>
            Guardar
          </ButtonSubmit>
          </span>
        </div>
      </div>
    </form>
  );
}
