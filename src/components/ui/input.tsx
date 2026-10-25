"use client";
import * as React from "react";
import { Eye, EyeOff, icons, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon, AlertError } from "../common";

type InputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "quantity"
  | "date"
  | "time"
  | "datetime-local"
  | "search";

type InputProps = {
  label?: string;
  error?: string;
  startIcon?: keyof typeof icons;
  endIcon?: keyof typeof icons;
  className?: string;
  type?: InputType;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, startIcon, endIcon, className, type = "text", onChange, value, name, disabled, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const isQuantidade = type === "quantity";
    const isDate = type === "date";

    const inputType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : isQuantidade
        ? "number"
        : isDate
          ? "date"
          : type;

    const minVal = props.min !== undefined ? Number(props.min) : 0;
    const maxVal = props.max !== undefined ? Number(props.max) : 999999;
    const stepVal = props.step !== undefined ? Number(props.step) : 1;

    const propagateChange = (newValue: number) => {
      if (onChange) {
        const event = {
          target: { name: name || "", value: String(newValue), type: "number", valueAsNumber: newValue },
          currentTarget: { name: name || "", value: String(newValue), type: "number", valueAsNumber: newValue },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const numericValue = React.useMemo(() => {
      if (value !== undefined && value !== null && value !== "") {
        const n = Number(value);
        return isNaN(n) ? minVal : n;
      }
      if (props.defaultValue !== undefined && props.defaultValue !== null && props.defaultValue !== "") {
        const n = Number(props.defaultValue);
        return isNaN(n) ? minVal : n;
      }
      return minVal;
    }, [value, props.defaultValue, minVal]);

    const isAtMin = numericValue <= minVal;
    const isAtMax = numericValue >= maxVal;

    const handleDecrement = (e: React.MouseEvent) => {
      e.preventDefault();
      if (disabled || isAtMin) return;
      const next = Math.max(minVal, numericValue - stepVal);
      propagateChange(next);
    };

    const handleIncrement = (e: React.MouseEvent) => {
      e.preventDefault();
      if (disabled || isAtMax) return;
      const next = Math.min(maxVal, numericValue + stepVal);
      propagateChange(next);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;
      if (rawValue.length > 1 && rawValue.startsWith("0") && !rawValue.startsWith("0.")) {
        rawValue = rawValue.replace(/^0+/, "");
        if (rawValue === "") rawValue = "0";
      }
      e.target.value = rawValue;

      if (rawValue === "") {
        if (onChange) {
          const event = {
            target: { name: name || "", value: "", type: "number", valueAsNumber: NaN },
            currentTarget: { name: name || "", value: "", type: "number", valueAsNumber: NaN },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
        return;
      }

      const newValue = Number(rawValue);
      if (!isNaN(newValue)) {
        propagateChange(newValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      let clamped = numericValue;
      if (isNaN(clamped) || clamped < minVal) clamped = minVal;
      else if (clamped > maxVal) clamped = maxVal;
      if (clamped !== numericValue) {
        propagateChange(clamped);
      }
      props.onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-1 text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        {isQuantidade ? (
          <div className="flex items-center w-full gap-2">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || isAtMin}
              aria-label="Diminuir quantidade"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-10 sm:min-h-10 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-5 h-5 text-foreground" />
            </button>

            <div
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm transition-colors duration-200",
                error
                  ? "border-red-500 ring-1 ring-red-400"
                  : "border-input focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-ring/50",
                className
              )}
            >
              <input
                ref={ref}
                name={name}
                type="number"
                inputMode="numeric"
                role="spinbutton"
                aria-valuenow={numericValue}
                aria-valuemin={minVal}
                aria-valuemax={maxVal}
                min={minVal}
                max={maxVal}
                step={stepVal}
                value={numericValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn(
                  "w-full bg-transparent placeholder:text-muted-foreground text-foreground outline-none text-center",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                {...props}
                disabled={disabled}
              />
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || isAtMax}
              aria-label="Aumentar quantidade"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-10 sm:min-h-10 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-5 h-5 text-foreground" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center rounded-md border px-3 py-2 text-sm transition-colors duration-200 w-full",
              error
                ? "border-red-500 ring-1 ring-red-400"
                : "border-input focus-within:border-primary-500 focus-within:ring-[3px] focus-within:ring-ring/50",
              className
            )}
          >
            {startIcon && (
              <Icon
                name={startIcon}
                size={18}
                className="mr-2 text-muted-foreground"
              />
            )}
            <input
              ref={ref}
              type={inputType}
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              className={cn(
                "min-w-0 flex-1 bg-transparent placeholder:text-muted-foreground text-foreground outline-none text-left",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              {...props}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-muted-foreground focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
            {!isPassword && endIcon && (
              <Icon
                name={endIcon}
                size={18}
                className="ml-2 text-muted-foreground"
              />
            )}
          </div>
        )}

        {error && <AlertError errorMessage={error} />}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
