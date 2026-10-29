"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { AlertError } from "@/components/common/alert-error";
import { cn } from "@/lib/utils";
import { Percent } from "lucide-react";

export interface PercInputProps {
  label?: string;
  error?: string;
  value?: number | string;
  onChange?: (value: number) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  showSlider?: boolean;
  placeholder?: string;
}

export function PercInput({
  label,
  error,
  value,
  onChange,
  onBlur,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  id,
  name,
  showSlider = true,
  placeholder = "0",
}: PercInputProps) {
  const generatedId = React.useId();
  const inputId = id || name || generatedId;

  const numValue = React.useMemo(() => {
    if (value === undefined || value === null || value === "") return min;
    const n = Number(value);
    return isNaN(n) ? min : Math.min(max, Math.max(min, n));
  }, [value, min, max]);

  const [rawText, setRawText] = React.useState<string>(String(numValue));

  React.useEffect(() => {
    setRawText(String(numValue));
  }, [numValue]);

  const propagate = (val: number) => {
    const clamped = Math.min(max, Math.max(min, val));
    onChange?.(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawText(raw);

    if (raw === "") {
      onChange?.(min);
      return;
    }

    const parsed = Number(raw);
    if (!isNaN(parsed)) {
      propagate(parsed);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let parsed = Number(rawText);
    if (isNaN(parsed) || rawText === "") parsed = min;
    const clamped = Math.min(max, Math.max(min, parsed));
    setRawText(String(clamped));
    propagate(clamped);
    onBlur?.(e);
  };

  const handleSliderChange = (newVal: number[]) => {
    if (newVal && newVal.length > 0) {
      const val = newVal[0]!;
      setRawText(String(val));
      propagate(val);
    }
  };

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

      <div className="flex items-center gap-3">
        {showSlider && (
          <div className="flex-1">
            <Slider
              value={[numValue]}
              onValueChange={handleSliderChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className="py-1"
              aria-label={label || "Percentagem"}
            />
          </div>
        )}

        <div
          className={cn(
            "relative flex items-center rounded-xs border text-sm transition-colors duration-200 overflow-hidden bg-background",
            showSlider ? "w-28 shrink-0" : "w-full",
            error
              ? "border-red-500 ring-1 ring-red-400"
              : "border-input focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/50",
            disabled && "opacity-50 cursor-not-allowed bg-muted/30"
          )}
        >
          <input
            id={inputId}
            name={name}
            type="number"
            inputMode="decimal"
            role="spinbutton"
            aria-valuenow={numValue}
            aria-valuemin={min}
            aria-valuemax={max}
            min={min}
            max={max}
            step={step}
            value={rawText}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent placeholder:text-muted-foreground text-foreground outline-none px-3 py-2 text-right pe-7",
              "disabled:cursor-not-allowed",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
          <span className="absolute inset-y-0 end-0 flex items-center pe-2.5 text-xs font-semibold text-muted-foreground pointer-events-none select-none">
            %
          </span>
        </div>
      </div>

      {error && <AlertError errorMessage={error} />}
    </div>
  );
}

export default PercInput;
