"use client";

import * as React from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";
import { icons } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon, AlertError } from "../common";


interface InputCurrencyProps
  extends Omit<NumericFormatProps, "onValueChange"> {
  label?: string;
  error?: string;
  startIcon?: keyof typeof icons;
  endIcon?: keyof typeof icons;
  containerClassName?: string;
  currency?: string | false;
  onValueChange?: (value: number) => void;
}

const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  (
    {
      label,
      error,
      startIcon,
      endIcon,
      containerClassName,
      className,
      id,
      name,
      currency = "Kz",
      onValueChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-1 text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex items-center rounded-md border text-sm transition-colors duration-200 w-full overflow-hidden",
            error
              ? "border-red-500 ring-1 ring-red-400"
              : "border-input focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-ring/50",
            disabled && "opacity-50 cursor-not-allowed bg-muted/30"
          )}
        >
          {currency && (
            <span className="flex items-center self-stretch px-3 bg-muted border-r border-border text-muted-foreground font-medium text-xs select-none shrink-0">
              {currency}
            </span>
          )}

          {!currency && startIcon && (
            <Icon
              name={startIcon}
              size={18}
              className="ml-3 text-muted-foreground shrink-0"
            />
          )}

          <NumericFormat
            getInputRef={ref}
            id={inputId}
            name={name}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            allowNegative={false}
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent placeholder:text-muted-foreground text-foreground outline-none px-3 py-2 min-w-0",
              "disabled:cursor-not-allowed",
              className
            )}
            onFocus={(e) => {
              const target = e.target;
              target.select();
              setTimeout(() => {
                try {
                  target.select();
                } catch (err) {}
              }, 50);
              props.onFocus?.(e);
            }}
            onValueChange={(values) => {
              onValueChange?.(values.floatValue ?? 0);
            }}
            {...props}
          />

          {endIcon && (
            <Icon
              name={endIcon}
              size={18}
              className="mr-3 text-muted-foreground shrink-0"
            />
          )}
        </div>

        {error && <AlertError errorMessage={error} />}
      </div>
    );
  }
);

InputCurrency.displayName = "InputCurrency";


type RHFInputCurrencyProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = Omit<InputCurrencyProps, "value" | "onValueChange" | "name" | "error"> & {
  control: Control<TFieldValues>;
  name: TName;
};

function RHFInputCurrency<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ control, name, ...rest }: RHFInputCurrencyProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });

  return (
    <InputCurrency
      {...rest}
      ref={field.ref}
      name={field.name}
      value={field.value ?? ""}
      onValueChange={field.onChange}
      disabled={field.disabled ?? rest.disabled}
      error={error?.message}
    />
  );
}

export { InputCurrency, RHFInputCurrency };
export type { InputCurrencyProps, RHFInputCurrencyProps };
