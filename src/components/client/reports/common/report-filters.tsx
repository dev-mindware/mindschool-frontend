"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos de filtros suportados
export interface SelectFilterConfig {
  type: "select";
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface DateFilterConfig {
  type: "date";
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
}

export type FilterConfig = SelectFilterConfig | DateFilterConfig;

interface ReportFiltersProps {
  filters: FilterConfig[];
  className?: string;
}

export function ReportFilters({ filters, className }: ReportFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn(className)}>
      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filters.map((filter, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {filter.label}
            </Label>

            {filter.type === "select" ? (
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="w-full h-10 bg-background/50 hover:bg-background transition-colors">
                  <SelectValue
                    placeholder={filter.placeholder || "Seleccione"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      {filter.placeholder || filter.label}
                    </SelectLabel>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal bg-background/50 hover:bg-background transition-colors",
                      !filter.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {filter.value
                        ? format(filter.value, "PPP", { locale: ptBR })
                        : "Seleccione a data"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filter.value}
                    onSelect={filter.onChange}
                    initialFocus
                    locale={ptBR}
                    disabled={filter.disabledDates}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
