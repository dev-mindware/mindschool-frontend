"use client";
import Select from "react-select";

export interface SelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  options: SelectOption[];
  value: SelectOption[];
  onChange: (options: SelectOption[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  className?: string;
  error?: string;
  inputId?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isMulti = true,
  className,
  error,
  inputId,
  isLoading,
  isDisabled,
}: MultiSelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>

      <Select<SelectOption, boolean>
        inputId={inputId}
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={(val) => onChange((val as SelectOption[]) ?? [])}
        placeholder={placeholder}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable
        classNamePrefix="react-select"
        styles={selectStyles(error)}
      />

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function selectStyles(error?: string) {
  return {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "37px",
      borderRadius: "6.5px",
      borderColor: error
        ? "var(--destructive)"
        : state.isFocused
        ? "var(--ring)"
        : "var(--border)",
      backgroundColor: "var(--background)",
      boxShadow: state.isFocused
        ? error
          ? "0 0 0 1px var(--destructive)"
          : "0 0 0 1px var(--ring)"
        : "none",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: error ? "var(--destructive)" : "var(--ring)",
      },
    }),

    valueContainer: (base: any) => ({
      ...base,
      padding: "2px 8px",
    }),

    input: (base: any) => ({
      ...base,
      color: "var(--foreground)",
    }),

    placeholder: (base: any) => ({
      ...base,
      color: "var(--muted-foreground)",
    }),

    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "var(--accent)",
      borderRadius: "var(--radius-sm)",
    }),

    multiValueLabel: (base: any) => ({
      ...base,
      color: "var(--foreground)",
    }),

    multiValueRemove: (base: any) => ({
      ...base,
      color: "var(--muted-foreground)",
      ":hover": {
        backgroundColor: "var(--destructive)",
        color: "var(--destructive-foreground)",
      },
    }),

    menu: (base: any) => ({
      ...base,
      borderRadius: "var(--radius)",
      backgroundColor: "var(--card)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
      zIndex: 9999,
    }),

    menuList: (base: any) => ({
      ...base,
      padding: "4px",
    }),

    option: (base: any, state: any) => ({
      ...base,
      borderRadius: "var(--radius-sm)",
      backgroundColor: state.isSelected
        ? "var(--primary)"
        : state.isFocused
        ? "var(--accent)"
        : "transparent",
      color: state.isSelected
        ? "var(--primary-foreground)"
        : "var(--foreground)",
      cursor: "pointer",
      padding: "10px 12px",
      ":active": {
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      },
    }),
  };
}
