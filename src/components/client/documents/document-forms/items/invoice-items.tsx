"use client";
import { useCallback, useMemo } from "react";
import { Separator } from "@/components";
import { UseFieldArrayReturn } from "react-hook-form";
import { ProformaFormData } from "@/schemas";
import { Package } from "lucide-react";
import { AddItemForm } from "./add-item-form";
import { ItemList } from "./item-list";
import { InvoiceSummary } from "./invoice-summary";
import { DefaultBankCard } from "./default-bank-card";

interface InvoiceItemsProps {
  fieldArray: UseFieldArrayReturn<any, "items">;
  globalRetention: number;
  setGlobalRetention: (value: number) => void;
  globalDiscount: number;
  setGlobalDiscount: (value: number) => void;
  totals: {
    subtotal: number;
    taxAmount: number;
    retentionAmount: number;
    discountAmount: number;
    total: number;
  };
}

export function InvoiceItems({
  fieldArray,
  globalRetention,
  setGlobalRetention,
  globalDiscount,
  setGlobalDiscount,
  totals,
}: InvoiceItemsProps) {

  const { fields, append, remove, update } = fieldArray;

  // Stable set of IDs already in the invoice — used to prevent duplicates
  const existingItemIds = useMemo(
    () => new Set(fields.map((f: any) => f.apiId).filter(Boolean)),
    [fields]
  );

  const handleAddItem = useCallback(
    (item: any) => {
      append(item);
    },
    [append]
  );

  const handleRemoveItem = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      const item = fields[index] as any;
      if (!item) return;
      const { id: _fieldId, ...itemValue } = item;

      const maximum = Number(item.availableQuantity);
      const normalizedQuantity = Number.isFinite(quantity)
        ? Math.floor(quantity)
        : 1;
      const nextQuantity = Math.max(
        1,
        Number.isFinite(maximum) && maximum > 0
          ? Math.min(normalizedQuantity, maximum)
          : normalizedQuantity,
      );

      update(index, {
        ...itemValue,
        quantity: nextQuantity,
        total: Number(item.unitPrice) * nextQuantity,
      });
    },
    [fields, update],
  );

  const handlePriceChange = useCallback(
    (index: number, price: number) => {
      const item = fields[index] as any;
      if (!item) return;
      const { id: _fieldId, ...itemValue } = item;

      update(index, {
        ...itemValue,
        unitPrice: price,
        total: price * Number(item.quantity),
      });
    },
    [fields, update],
  );

  const hasServiceItem = useMemo(
    () => fields.some((item: any) => item?.type === "SERVICE"),
    [fields]
  );

  return (
    <div className="space-y-6" data-tour="normal-invoice-items">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Itens da factura
        </h3>
        {fields.length > 0 && (
          <span className="text-sm text-foreground bg-card px-3 py-1 rounded-full">
            {fields.length} {fields.length === 1 ? "item" : "itens"}
          </span>
        )}
      </div>

      <Separator />

      <AddItemForm
        onAdd={handleAddItem}
        globalDiscount={globalDiscount}
        existingItemIds={existingItemIds}
      />


      {fields.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-6 bg-card rounded-lg border-2 border-dashed"
          data-tour="normal-invoice-summary"
        >
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-foreground mb-1">
            Nenhum item adicionado
          </p>
          <p className="text-xs text-foreground">
            Use o formulário acima para adicionar itens à factura.
          </p>
        </div>
      ) : (
        <>
          <ItemList
            items={fields}
            onRemove={handleRemoveItem}
            onQuantityChange={handleQuantityChange}
            onPriceChange={handlePriceChange}
          />
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            data-tour="normal-invoice-summary"
          >
            <DefaultBankCard />
            <div className="w-full">
              <InvoiceSummary
                totals={totals}
                globalRetention={globalRetention}
                setGlobalRetention={setGlobalRetention}
                globalDiscount={globalDiscount}
                setGlobalDiscount={setGlobalDiscount}
                hasServiceItem={hasServiceItem}
              />
            </div>
          </div>

        </>
      )}
    </div>
  );
}
