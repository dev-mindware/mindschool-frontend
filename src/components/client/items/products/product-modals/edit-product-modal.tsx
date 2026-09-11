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
import { useModal } from "@/stores";
import { ItemFormData, itemSchema } from "@/schemas";
import {
  useUpdateItem,
  useCategoriesSelect,
  useTaxesSelect,
  useAuth,
} from "@/hooks";
import { ErrorMessage } from "@/utils/messages";
import { useMemo } from "react";
import { ItemResponse } from "@/types";
import { useGetSuppliersSelect } from "@/hooks/entities/use-suppliers";
import { PLAN_HIERARCHY, PlanType } from "@/types/subscription";

const UNIT_OPTIONS = [
  { label: "Nenhuma (Sem Unidade)", value: "none" },
  { label: "Unidade (un)", value: "un" },
  { label: "Quilograma (kg)", value: "kg" },
  { label: "Grama (g)", value: "g" },
  { label: "Litro (l)", value: "l" },
  { label: "Mililitro (ml)", value: "ml" },
  { label: "Metro (m)", value: "m" },
  { label: "Metro Quadrado (m²)", value: "m2" },
  { label: "Caixa (cx)", value: "cx" },
  { label: "Pacote (pct)", value: "pct" },
  { label: "Par (par)", value: "par" },
  { label: "Dúzia (dz)", value: "dz" },
];

/** Normaliza qualquer data vinda da API para o formato yyyy-MM-dd usado pelo <input type="date">. */
function toDateInputValue(value?: string | null): string {
  if (!value) return "";
  const datePart = value.includes("T") ? value.split("T")[0] : value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? "" : parsed.toISOString().split("T")[0];
}

interface EditProductModalProps {
  product: ItemResponse;
}

export function EditProductModal({ product }: EditProductModalProps) {
  const { open, openModal, closeModal } = useModal();
  const isOpen = open["edit-product"];

  if (!isOpen) return null;

  return (
    <>
      <GlobalModal
        canClose
        id="edit-product"
        title={
          <div className="w-full flex items-center justify-between gap-2 mb-4">
            <span>Editar Produto</span>
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
        <EditProductFormContent product={product} />
      </GlobalModal>
      {open["add-category"] && <CategoryModal action="add" />}
    </>
  );
}

function EditProductFormContent({ product }: EditProductModalProps) {
  const { user } = useAuth();
  const { closeModal } = useModal();
  const { mutateAsync: updateItemMutate, isPending: isUpdating } =
    useUpdateItem();

  const {
    categoryOptions,
    isLoading: isLoadingCategories,
    isError,
    refetch,
    pagination,
    setPage,
  } = useCategoriesSelect();
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
  const {
    taxOptions,
    isLoading: isTaxesLoading,
    pagination: taxPagination,
    setPage: setTaxPage,
    taxSearch,
    setTaxSearch,
  } = useTaxesSelect();

  const finalCategoryOptions = useMemo(() => {
    const currentId = product.categoryId || (product as any).category_id;
    const currentName = product.category;

    if (
      currentId &&
      currentName &&
      !categoryOptions.find((o) => o.value === currentId)
    ) {
      return [{ label: currentName, value: currentId }, ...categoryOptions];
    }
    return categoryOptions;
  }, [product, categoryOptions]);

  const finalTaxOptions = useMemo(() => {
    const currentId = product.taxId || product.tax?.id;
    const currentName = product.tax?.name
      ? `${product.tax.name} (${product.tax.rate}%)`
      : null;

    if (
      currentId &&
      currentName &&
      !taxOptions.find((o) => o.value === currentId)
    ) {
      return [{ label: currentName, value: currentId }, ...taxOptions];
    }
    return taxOptions;
  }, [product, taxOptions]);

  const finalSupplierOptions = useMemo(() => {
    const noneOption = { label: "Nenhum", value: "none" };
    if (!hasSuppliers) return [noneOption];
    const currentId = product.supplierId || (product as any).supplier_id;
    const currentName = product.supplierName;

    if (
      currentId &&
      currentName &&
      !supplierOptions.find((o) => o.value === currentId)
    ) {
      return [
        noneOption,
        { label: currentName, value: currentId },
        ...supplierOptions,
      ];
    }
    return [noneOption, ...supplierOptions];
  }, [product, supplierOptions, hasSuppliers]);

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
      name: product.name || "",
      description: product.description || "",
      barcode: product.barcode || "",
      price: Number(product.price) || 0,
      cost: product.cost != null ? Number(product.cost) : 0,
      quantity: product.quantity != null ? Number(product.quantity) : 0,
      minStock: product.minStock != null ? Number(product.minStock) : 0,
      unit: product.unit || "",
      weight: product.weight != null ? Number(product.weight) : undefined,
      dimensions: product.dimensions || "",
      supplierId: product.supplierId || "none",
      type: "PRODUCT",
      companyId: String(user?.company?.id),
      categoryId: product.categoryId || (product as any).category_id || "",
      taxId: product.taxId || product.tax?.id || "",
      expiryDate: toDateInputValue(product.expiryDate),
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
    } as any;
  };

  async function onSubmit(data: ItemFormData) {
    try {
      const cleanedData = cleanPayload(data);
      const { type, companyId, ...rest } = cleanedData;

      await updateItemMutate({
        id: product.id,
        data: rest,
      });
      handleCancel();
    } catch (error: unknown) {
      // O onError do hook já exibe a notificação
    }
  }

  const handleCancel = () => {
    reset();
    closeModal("edit-product");
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
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-6 sm:grid-flow-col sm:auto-cols-fr"
    >
      <div className="">
        <div className="space-y-4 sm:w-[35rem]">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              startIcon="Tag"
              {...register("name")}
              error={errors.name?.message}
              placeholder="Ex: Teclado Logitech"
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
                  className="w-full"
                  error={errors.taxId?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <InputCurrency
                  ref={field.ref}
                  label="Preço Unitário"
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
              name="cost"
              render={({ field }) => (
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
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <PaginatedSelect
                  label="Categoria"
                  value={value}
                  options={finalCategoryOptions}
                  onChange={onChange}
                  isLoading={isLoadingCategories}
                  pagination={pagination}
                  onPageChange={setPage}
                  placeholder="Seleccione uma opção"
                  className="w-full"
                />
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <Input
                  type="quantity"
                  startIcon="Scale"
                  label="Quantidade"
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={errors.quantity?.message}
                />
              )}
            />
          </div>

          <FeatureGate minPlan="Smart" fallback="hidden">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Código de Barras (Opcional)"
                  placeholder="Ex: 7891234567890"
                  {...register("barcode")}
                  error={errors.barcode?.message}
                  startIcon="Barcode"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="minStock"
                  render={({ field }) => (
                    <Input
                      type="quantity"
                      startIcon="Scale"
                      label="Stock Mínimo"
                      value={field.value ?? 0}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      error={errors.minStock?.message}
                    />
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
                      onChange={onChange}
                      options={finalSupplierOptions}
                      isLoading={isLoadingSuppliers}
                      pagination={paginationSuppliers}
                      onPageChange={setPageSuppliers}
                      className="w-full"
                      placeholder="Seleccione uma opção"
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
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9.,]/g, "");
                    },
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
                  placeholder="Ex: 10x20x30"
                  {...register("dimensions", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9xX\s.,]/g, "");
                    }
                  })}
                  error={errors.dimensions?.message}
                />
              </div>
            </FeatureGate>

            <Textarea
              label="Descrição (opcional)"
              {...register("description")}
              className="mt-1 min-h-[100px]"
              placeholder="Escreva detalhes do item..."
              error={errors.description?.message}
            />
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <ButtonSubmit
            className="w-max"
            isLoading={isUpdating || isSubmitting}
          >
            Actualizar
          </ButtonSubmit>
        </div>
      </div>
    </form>
  );
}
