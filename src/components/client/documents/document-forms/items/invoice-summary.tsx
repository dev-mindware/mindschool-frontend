"use client";

import React from "react";
import { Input, InputCurrency, SelectField, Separator } from "@/components";
import { formatCurrency } from "@/utils";

interface InvoiceSummaryProps {
  totals: {
    subtotal: number;
    taxAmount: number;
    retentionAmount: number;
    discountAmount: number;
    total: number;
  };
  globalRetention: number;
  setGlobalRetention: (value: number) => void;
  globalDiscount: number;
  setGlobalDiscount: (value: number) => void;
  hasServiceItem?: boolean;
}

export const InvoiceSummary = React.memo<InvoiceSummaryProps>(
  ({
    totals,
    globalRetention,
    setGlobalRetention,
    globalDiscount,
    setGlobalDiscount,
    hasServiceItem = false,
  }) => {
    // Reset retention to 0 if there are no service items
    React.useEffect(() => {
      if (!hasServiceItem && globalRetention !== 0) {
        setGlobalRetention(0);
      }
    }, [hasServiceItem, globalRetention, setGlobalRetention]);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            {hasServiceItem && (
            <SelectField
              label="Retenção na Fonte"
              value={hasServiceItem ? globalRetention : 0}
              onValueChange={(v) => setGlobalRetention(Number(v))}
              options={[
                { value: 0, label: "Sem retenção (0%)" },
                { value: 6.5, label: "6.5%" },
                { value: 10, label: "10%" },
              ]}
            />
            )}
            {!hasServiceItem && (
              <h1 className="text-destructive">
                Retenção aplicável apenas a serviços.
              </h1>
            )}
          </div>

          <InputCurrency
            label="Desconto (%)"
            value={globalDiscount}
            onValueChange={(value) => setGlobalDiscount(value)}
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            currency={false}
            suffix=" %"
            isAllowed={(values) => (values.floatValue ?? 0) <= 100}
          />
        </div>


        <div className="flex justify-end">
          <InvoiceTotalsSummary
            subtotal={totals.subtotal}
            total={totals.total}
            taxAmount={totals.taxAmount}
            discountPercent={globalDiscount}
            discountAmount={totals.discountAmount}
            retentionPercent={globalRetention}
            retentionAmount={totals.retentionAmount}
          />

        </div>
      </div>
    );
  }
);

InvoiceSummary.displayName = "InvoiceSummary";

export interface InvoiceTotalsSummaryProps {
  subtotal: number;
  total: number;
  taxAmount?: number;
  discountPercent?: number;
  discountAmount?: number;
  retentionPercent?: number;
  retentionAmount?: number;
}

export function InvoiceTotalsSummary({
  subtotal,
  total,

  taxAmount = 0,

  discountPercent = 0,
  discountAmount = 0,

  retentionPercent = 0,
  retentionAmount = 0,
}: InvoiceTotalsSummaryProps) {
  return (
    <div className="w-full space-y-3 border border-dashed rounded-lg p-6 bg-card">
      {/* Subtotal */}
      <div className="flex justify-between items-center text-gray-600">
        <span className="text-sm">Subtotal</span>
        <span className="font-mono text-base">{formatCurrency(subtotal)}</span>
      </div>

      {/* IVA */}
      {taxAmount > 0 && (
        <div className="flex justify-between items-center text-green-600">
          <span className="text-sm">IVA Total</span>
          <span className="font-mono text-base">
            +{formatCurrency(taxAmount)}
          </span>
        </div>
      )}


      {/* Retenção */}
      {retentionPercent > 0 && (
        <div className="flex justify-between items-center text-red-600">
          <span className="text-sm">Retenção ({retentionPercent}%)</span>
          <span className="font-mono text-base">
            -{formatCurrency(retentionAmount)}
          </span>
        </div>
      )}

      {/* Desconto */}
      {discountPercent > 0 && (
        <div className="flex justify-between items-center text-red-600">
          <span className="text-sm">Desconto ({discountPercent}%)</span>
          <span className="font-mono text-base">
            -{formatCurrency(discountAmount)}
          </span>
        </div>
      )}

      <Separator className="my-3" />

      {/* Total */}
      <div className="flex justify-between items-center text-lg font-bold">
        <span className="text-foreground">Total a Pagar</span>
        <span className="font-mono text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
