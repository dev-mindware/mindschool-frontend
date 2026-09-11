import { useMemo } from "react";

interface Params {
  items: any[];
  retention: number;
  discount: number;
}

export function useInvoiceTotals({ items, retention, discount }: Params) {
  return useMemo(() => {
    const validItems = Array.isArray(items) ? items : [];
    const validRetention = Number(retention) || 0;
    const validDiscount = Number(discount) || 0;

    // Calculate subtotal (sum of all items)
    const subtotal = validItems.reduce((acc, item) => {
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);

    // Calculate discount amount (applied to subtotal)
    const discountAmount = subtotal * (validDiscount / 100);
    const taxableBase = subtotal - discountAmount;

    // Calculate tax on ORIGINAL subtotal (before discount)
    const taxAmount = validItems.reduce((acc, item) => {
      const price = Number(item.unitPrice) || 0;
      const qty = Number(item.quantity) || 0;
      const itemSubtotal = price * qty;
      const taxRate = Number(item.tax) || 0;
      return acc + itemSubtotal * (taxRate / 100);
    }, 0);

    // Retention applies strictly to services
    const hasServiceItem = validItems.some((item) => item?.type === "SERVICE");
    const effectiveRetention = hasServiceItem ? validRetention : 0;

    // Calculate retention on taxable base (after discount)
    const retentionAmount = taxableBase * (effectiveRetention / 100);

    // Total = taxableBase + taxAmount - retentionAmount
    const total = taxableBase + taxAmount - retentionAmount;

    const result = {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      retentionAmount: Number(retentionAmount.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };

    return result;
  }, [items, retention, discount]);
}

/* import { useMemo } from "react";

interface Params {
  items: any[];
  tax: number;
  retention: number;
  discount: number;
}

export function useInvoiceTotals({ tax, items, retention, discount }: Params) {
  return useMemo(() => {
    console.log("Calculando para:", { items, tax, discount });
    const subtotal = items.reduce((acc, i) => {
      const price = Number(i.unitPrice) || 0;
      const qty = Number(i.quantity) || 0;
      return acc + (price * qty);
    }, 0);

    const discountAmount = subtotal * (Number(discount) / 100);
    const taxableBase = subtotal - discountAmount;

    const taxAmount = taxableBase * (Number(tax) / 100);
    const retentionAmount = taxableBase * (Number(retention) / 100);

    const total = taxableBase + taxAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      retentionAmount: Number(retentionAmount.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }, [items, tax, retention, discount]);
} */
