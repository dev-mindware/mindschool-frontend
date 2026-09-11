import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value?: string | number;
  placeholder?: string;
  options: Option[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function SelectField({
  label,
  value,
  placeholder = "Seleccione",
  options,
  onValueChange,
  className,
}: SelectFieldProps) {
  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <label className="text-sm font-medium mb-1">{label}</label>
      <Select value={value !== undefined && value !== null ? String(value) : ""} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
