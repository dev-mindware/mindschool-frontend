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

    const propagateChange = (newValue: number) => {
      if (onChange) {
        const event = {
          target: { name: name || "", value: String(newValue), type: "number", valueAsNumber: newValue },
          currentTarget: { name: name || "", value: String(newValue), type: "number", valueAsNumber: newValue },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const currentValue = Number(value ?? props.defaultValue ?? 0);

    const handleDecrement = () => {
      propagateChange(Math.max(0, currentValue - 1));
    };

    const handleIncrement = () => {
      propagateChange(currentValue + 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value;
      if (rawValue.length > 1 && rawValue.startsWith("0")) {
        rawValue = rawValue.replace(/^0+/, "");
        if (rawValue === "") rawValue = "0";
      }
      e.target.value = rawValue;

      const newValue = Number(rawValue);
      propagateChange(isNaN(newValue) ? 0 : newValue);
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
              disabled={disabled}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
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
                min={0}
                max={999999}
                step={1}
                value={currentValue}
                onChange={handleChange}
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
              disabled={disabled}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
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
                "flex-1 bg-transparent placeholder:text-muted-foreground text-foreground outline-none text-left",
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
