"use client";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Label,
} from "@/components/ui/";
import { AlertError } from "../common";

type Option = {
  label: string;
  value: string | number;
};

interface RHFSelectProps<T extends FieldValues> {
  label?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  name: Path<T>;
  control?: Control<T>;
}

export function RHFSelect<T extends FieldValues>({
  name,
  label,
  control,
  options,
  placeholder = "Escolhe uma opção",
  disabled = false,
}: RHFSelectProps<T>) {
  return (
    <div className="">
      {label && <Label className="text-sm font-medium mb-1">{label}</Label>}

      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <Select
              value={field.value || ""}
              onValueChange={(value) => field.onChange(value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options
                  .filter(
                    (opt) =>
                      opt.value !== null &&
                      opt.value !== undefined &&
                      opt.value !== ""
                  )
                  .map((opt) => (
                    <SelectItem key={opt.value.toString()} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {fieldState.error && (
              <AlertError errorMessage={fieldState.error.message} />
            )}
          </>
        )}
      />
    </div>
  );
}
