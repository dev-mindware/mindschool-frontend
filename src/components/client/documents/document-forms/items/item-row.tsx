"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components";
import { Minus, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { formatCurrency } from "@/utils";

interface ItemRowProps {
  item: any;
  index: number;
  onRemove: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onPriceChange: (index: number, price: number) => void;
}

export const ItemRow = React.memo<ItemRowProps>(
  ({ item, index, onRemove, onQuantityChange, onPriceChange }) => {
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [draftPrice, setDraftPrice] = useState<string>("");
    const priceInputRef = useRef<HTMLInputElement>(null);

    const subtotal = item.unitPrice * item.quantity;
    const isService = item.type === "SERVICE";
    const maximumQuantity = Number(item.availableQuantity);
    const hasMaximumQuantity =
      Number.isFinite(maximumQuantity) && maximumQuantity > 0;
    const canIncrement =
      !hasMaximumQuantity || Number(item.quantity) < maximumQuantity;

    const startEditingPrice = useCallback(() => {
      setDraftPrice(String(item.unitPrice));
      setIsEditingPrice(true);
      setTimeout(() => priceInputRef.current?.select(), 0);
    }, [item.unitPrice]);

    const commitPrice = useCallback(() => {
      const parsed = parseFloat(draftPrice.replace(",", "."));
      if (!isNaN(parsed) && parsed > 0) {
        onPriceChange(index, parsed);
      }
      setIsEditingPrice(false);
    }, [draftPrice, index, onPriceChange]);

    const cancelPrice = useCallback(() => {
      setIsEditingPrice(false);
      setDraftPrice("");
    }, []);

    const handlePriceKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") commitPrice();
        if (e.key === "Escape") cancelPrice();
      },
      [commitPrice, cancelPrice],
    );

    return (
      <tr className="group">
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">
              {item.description}
            </span>
            {item.isFromAPI && (
              <span className="inline-flex items-center gap-1 text-xs text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                Do catálogo
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex px-2 py-1 text-xs rounded-full ${
              item.type === "PRODUCT"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {item.type === "PRODUCT" ? "Produto" : "Serviço"}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="ml-auto flex w-[116px] items-center overflow-hidden rounded-md border border-input bg-background">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onQuantityChange(index, Number(item.quantity) - 1)}
              disabled={Number(item.quantity) <= 1}
              aria-label={`Diminuir quantidade de ${item.description}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={hasMaximumQuantity ? maximumQuantity : undefined}
              step={1}
              value={item.quantity}
              onChange={(event) =>
                onQuantityChange(index, Number(event.target.value) || 1)
              }
              aria-label={`Quantidade de ${item.description}`}
              className="h-8 min-w-0 flex-1 border-x border-input bg-transparent px-1 text-center font-mono text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onQuantityChange(index, Number(item.quantity) + 1)}
              disabled={!canIncrement}
              aria-label={`Aumentar quantidade de ${item.description}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>

        {/* ── Editable unit price ── */}
        <td className="px-4 py-3 text-right">
          {isEditingPrice ? (
            <div className="inline-flex items-center gap-1 justify-end">
              <input
                ref={priceInputRef}
                type="number"
                min={0.01}
                step={0.01}
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value)}
                onKeyDown={handlePriceKeyDown}
                onBlur={commitPrice}
                className="w-24 rounded border border-primary bg-background px-2 py-0.5 text-right font-mono text-sm text-foreground outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label={`Preço unitário de ${item.description}`}
                autoFocus
              />
              <button
                type="button"
                onClick={commitPrice}
                className="flex h-6 w-6 items-center justify-center rounded text-green-600 hover:bg-green-50"
                aria-label="Confirmar preço"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={cancelPrice}
                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                aria-label="Cancelar edição"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditingPrice}
              title="Clique para editar o preço"
              className="group/price inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-foreground transition-colors hover:bg-muted hover:text-primary"
              aria-label={`Editar preço unitário de ${item.description}`}
            >
              <span>{formatCurrency(item.unitPrice)}</span>
              <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover/price:opacity-60" />
            </button>
          )}
        </td>

        <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
          {formatCurrency(subtotal)}
        </td>
        <td className="px-4 py-3 text-right font-mono text-foreground">
          {item.tax ? `${item.tax}%` : "Isento"}
        </td>
        <td className="px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </td>
      </tr>
    );
  },
);

ItemRow.displayName = "ItemRow";
