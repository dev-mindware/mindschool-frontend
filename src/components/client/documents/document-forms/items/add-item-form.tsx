"use client";

import { Plus } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, InputCurrency, RHFSelect } from "@/components";
import { AsyncCreatableSelectField } from "@/components/common/input-fetch/async-select";
import { PaginatedSelect } from "@/components/shared";
import { useGetTaxes } from "@/hooks/taxes/use-taxes";

export interface ProductOption {
  value: string | number;
  label: string;
  data?: {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    type: "PRODUCT" | "SERVICE";
    description?: string;
    taxId?: string | number;
    tax?: {
      id?: string | number;
      rate: number;
    };
  };
  __isNew__?: boolean;
}

interface AddItemFormProps {
  onAdd: (item: any) => void;
  globalDiscount: number;
  /** IDs of items already added to the invoice — prevents duplicates */
  existingItemIds?: Set<string | number>;
}

export const AddItemForm = React.memo<AddItemFormProps>(
  ({ onAdd, globalDiscount, existingItemIds = new Set() }) => {
    const {
      taxOptions,
      pagination: taxPagination,
      setPage: setTaxPage,
      taxSearch,
      setTaxSearch,
    } = useGetTaxes();
    const [selectedProduct, setSelectedProduct] =
      useState<ProductOption | null>(null);

    const {
      control,
      handleSubmit,
      setValue,
      getValues,
      resetField,
      watch,
      reset,
      formState: { errors },
    } = useForm({
      defaultValues: {
        quantity: 1,
        price: 0,
        type: "PRODUCT" as "PRODUCT" | "SERVICE",
        taxId: "",
      },
    });

    const watchedPrice = watch("price");
    const watchedQuantity = watch("quantity");
    const watchedType = watch("type");
    const watchedTaxId = watch("taxId");

    const handleProductChange = useCallback(
      (option: ProductOption | null) => {
        setSelectedProduct(option);

        if (!option) {
          setValue("price", 0);
          setValue("type", "PRODUCT");
          setValue("taxId", "");
          return;
        }

        if (option.__isNew__) {
          setValue("price", 0);
          setValue("type", "PRODUCT");
          setValue("taxId", "");
        } else if (option.data) {
          setValue("price", Number(option.data.price));
          setValue("type", option.data.type);
          // For products, cap initial quantity by available stock
          if (option.data.type === "PRODUCT") {
            const available = option.data.quantity ?? 0;
            setValue("quantity", available > 0 ? 1 : 0);
          } else {
            setValue("quantity", 1);
          }
          setValue(
            "taxId",
            String(option.data.taxId ?? option.data.tax?.id ?? ""),
          );
        }
      },
      [setValue],
    );

    const handleAddClick = useCallback(() => {
      const values = getValues();
      if (
        !selectedProduct ||
        values.quantity <= 0 ||
        values.price <= 0 ||
        !values.taxId
      ) {
        return;
      }

      // Final stock check for products
      if (
        !selectedProduct.__isNew__ &&
        selectedProduct.data?.type === "PRODUCT"
      ) {
        const available = selectedProduct.data.quantity ?? 0;
        if (values.quantity > available) {
          return;
        }
      }

      const selectedTax = taxOptions.find((t) => t.value === values.taxId);
      const taxRate = selectedTax
        ? Number(selectedTax.label.match(/\((\d+)%\)/)?.[1] || 0)
        : 0;

      const newItem = {
        description: selectedProduct.label,
        unitPrice: values.price,
        quantity: values.quantity,
        tax: selectedProduct.data?.tax?.rate || taxRate,
        taxId: values.taxId,
        discount: globalDiscount,
        total: values.price * values.quantity,
        type: values.type,
        availableQuantity:
          selectedProduct.data?.type === "PRODUCT"
            ? selectedProduct.data.quantity
            : undefined,
        isFromAPI: !selectedProduct.__isNew__,
        apiId: selectedProduct.__isNew__
          ? undefined
          : selectedProduct.value.toString(),
      };

      onAdd(newItem);

      setSelectedProduct(null);
      reset({
        quantity: 1,
        price: 0,
        type: "PRODUCT",
        taxId: "",
      });
    }, [selectedProduct, getValues, taxOptions, globalDiscount, onAdd, reset]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleAddClick();
        }
      },
      [handleAddClick],
    );

    const isNewProduct = selectedProduct?.__isNew__ ?? false;
    const requiresTaxSelection =
      isNewProduct ||
      Boolean(
        selectedProduct &&
          !selectedProduct.data?.taxId &&
          !selectedProduct.data?.tax?.id,
      );

    // Stock validation
    const availableStock =
      !isNewProduct && selectedProduct?.data?.type === "PRODUCT"
        ? (selectedProduct.data.quantity ?? 0)
        : Infinity;

    const isOverStock =
      watchedType === "PRODUCT" && watchedQuantity > availableStock;
    const isAlreadyAdded =
      !isNewProduct && selectedProduct
        ? existingItemIds.has(selectedProduct.value)
        : false;
    // Price is always editable — users can override catalogue price per-document
    const isPriceLocked = false;
    const canAdd =
      selectedProduct &&
      watchedQuantity > 0 &&
      watchedPrice > 0 &&
      Boolean(watchedTaxId) &&
      !isOverStock &&
      !isAlreadyAdded;

    // Lock quantity to available stock for products only
    const isService = watchedType === "SERVICE";

    return (
      <div
        className="space-y-4"
        onKeyDown={handleKeyDown}
        data-tour="normal-invoice-item-form"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2" data-tour="normal-invoice-item-select">
            <AsyncCreatableSelectField
              endpoint="/items"
              label="Produto/Serviço"
              placeholder="Digite o nome do item..."
              value={selectedProduct}
              onChange={handleProductChange}
              displayFields={["name", "description"]}
              minChars={3}
              formatCreateLabel={(input: string) => `➕ Adicionar "${input}"`}
            />
          </div>

          <Controller
            control={control}
            name="quantity"
            render={({ field }) => (
              <div className="space-y-1" data-tour="normal-invoice-item-quantity">
                <Input
                  {...field}
                  min={1}
                  max={availableStock !== Infinity ? availableStock : undefined}
                  type="quantity"
                  label="Quantidade"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const cappedVal =
                      watchedType === "PRODUCT" && availableStock !== Infinity
                        ? Math.min(val, availableStock)
                        : val;
                    field.onChange(
                      Math.max(1, cappedVal),
                    );
                  }}
                  error={isOverStock ? `Máximo: ${availableStock}` : undefined}
                  placeholder="1"
                />
                {!isNewProduct && selectedProduct?.data?.type === "PRODUCT" && (
                  <p className="text-[10px] text-muted-foreground font-medium px-1">
                    Disponível:{" "}
                    <span
                      className={
                        availableStock <= 0
                          ? "text-destructive"
                          : "text-primary"
                      }
                    >
                      {availableStock}
                    </span>
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <div data-tour="normal-invoice-item-price">
                <InputCurrency
                  ref={field.ref}
                  label="Preço Unitário"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  decimalScale={2}
                  fixedDecimalScale
                  allowNegative={false}
                  disabled={false}
                />
              </div>
            )}
          /> 
        </div>

        {requiresTaxSelection && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-tour="normal-invoice-new-item-fields"
          >
            {isNewProduct && (
              <RHFSelect
                name="type"
                label="Tipo de Item"
                control={control}
                options={[
                  { value: "PRODUCT", label: "Produto" },
                  { value: "SERVICE", label: "Serviço" },
                ]}
              />
            )}
            <Controller
              control={control}
              name="taxId"
              render={({ field: { onChange, value } }) => (
                <PaginatedSelect
                  label="Imposto"
                  value={value}
                  options={taxOptions}
                  onChange={onChange}
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
        )}

        <div className="flex items-center justify-between pt-2">
          {isAlreadyAdded && (
            <p className="text-sm text-destructive font-medium">
              Este item já foi adicionado à factura.
            </p>
          )}
          {isOverStock && !isAlreadyAdded && (
            <p className="text-sm text-destructive font-medium">
              Quantidade superior ao stock disponível ({availableStock})
            </p>
          )}
          <Button
            type="button"
            onClick={handleAddClick}
            disabled={!canAdd}
            className="ml-auto flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar à factura
          </Button>
        </div>
      </div>
    );
  },
);

AddItemForm.displayName = "AddItemForm";
