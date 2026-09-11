import { Checkbox } from "@/components/ui";
import { Button, Icon } from "@/components";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";
import { icons } from "lucide-react";

type Option = { value: string; label: string };

interface FilterPopoverProps {
  label: string;
  icon: keyof typeof icons;
  options: Option[];
  value?: string | null;
  onChange: (value?: string | null) => void;
}

export function FilterPopover({
  label,
  icon,
  options,
  value,
  onChange,
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant={value ? "default" : "outline"}
          className="w-full h-10 gap-2 sm:w-auto"
        >
          <Icon name={icon} className="w-4 h-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-2">
        <p className="p-1 text-sm font-medium">
          Seleccionar {label.toLowerCase()}
        </p>
        {options.map((opt) => (
          <div
            key={opt.value}
            className="flex items-center gap-2 p-1 rounded hover:bg-muted"
          >
            <Checkbox
              id={`${label}-${opt.value}`}
              checked={value === opt.value}
              onCheckedChange={(checked) =>
                onChange(checked ? opt.value : null)
              }
            />
            <label
              htmlFor={`${label}-${opt.value}`}
              className="text-sm cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
