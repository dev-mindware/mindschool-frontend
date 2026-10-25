"use client";

import * as React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { AlertError } from "@/components/common/alert-error";
import { cn } from "@/lib/utils";

export interface PriceInputProps
  extends Omit<NumericFormatProps, "onValueChange" | "value"> {
  label?: string;
  error?: string;
  value?: number | string;
  onValueChange?: (value: number) => void;
  currencyPrefix?: string;
  currencySuffix?: string;
  disabled?: boolean;
  className?: string;
}

export function PriceInput({
  label,
  error,
  value,
  onValueChange,
  currencyPrefix = "Kz",
  currencySuffix = "AOA",
  disabled = false,
  className,
  id,
  name,
  placeholder = "0,00",
  decimalScale = 2,
  fixedDecimalScale = true,
  allowNegative = false,
  ...rest
}: PriceInputProps) {
  const generatedId = React.useId();
  const inputId = id || name || generatedId;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative flex items-center rounded-md border text-sm transition-colors duration-200 overflow-hidden bg-background",
          error
            ? "border-red-500 ring-1 ring-red-400"
            : "border-input focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-ring/50",
          disabled && "opacity-50 cursor-not-allowed bg-muted/30"
        )}
      >
        {currencyPrefix && (
          <span className="flex items-center self-stretch px-3 bg-muted border-r border-border text-muted-foreground font-medium text-xs select-none shrink-0">
            {currencyPrefix}
          </span>
        )}

        <NumericFormat
          id={inputId}
          name={name}
          // 0 mostra-se vazio (placeholder «0,00»): com «0,00» escrito, o que se digita entra antes do zero e o valor vem multiplicado por 10
          value={value === 0 || value === "0" ? "" : (value ?? "")}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={allowNegative}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent placeholder:text-muted-foreground text-foreground outline-none px-3 py-2 min-w-0",
            "disabled:cursor-not-allowed"
          )}
          onFocus={(e) => {
            const target = e.target;
            target.select();
            setTimeout(() => {
              try {
                target.select();
              } catch (err) {}
            }, 50);
          }}
          onValueChange={(values) => {
            onValueChange?.(values.floatValue ?? 0);
          }}
          {...rest}
        />

        {currencySuffix && (
          <span className="inline-flex items-center self-stretch px-3 text-xs font-semibold border-l border-border bg-muted/50 text-muted-foreground select-none shrink-0">
            {currencySuffix}
          </span>
        )}
      </div>

      {error && <AlertError errorMessage={error} />}
    </div>
  );
}

export default PriceInput;
