
"use client"
import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { ptBR } from "date-fns/locale"
import { AlertError } from "@/components/common/alert-error"
import type { Matcher } from "react-day-picker"

interface DatePickerProps {
  label?: string;
  error?: string;
  startYear?: number;
  endYear?: number;
  value?: Date;
  onChange: (date: Date | undefined, formatted?: string) => void;
  placeholder?: string;
  id?: string;
  disabledDates?: Matcher | Matcher[];
  className?: string;
}

export function DatePicker({
  label,
  error,
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  value,
  onChange,
  placeholder = "Escolha a data",
  disabledDates,
  className,
  id,
}: DatePickerProps) {
  // Se não existir um valor, utiliza a data actual apenas para montar os selectores.
  const date = value ?? new Date();

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthChange = (month: string) => {
    const newDate = setMonth(date, months.indexOf(month));
    onChange(newDate, format(newDate, "yyyy-MM-dd"));
  };

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, parseInt(year));
    onChange(newDate, format(newDate, "yyyy-MM-dd"));
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(selectedDate, format(selectedDate, "yyyy-MM-dd"));
    } else {
      onChange(undefined);
    }
  };

  const pickerContent = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-red-500 ring-1 ring-red-400",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex justify-between p-2 gap-2">
          <Select
            onValueChange={handleMonthChange}
            value={months[getMonth(date)]}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleYearChange}
            value={getYear(date).toString()}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          month={date}
          initialFocus
          locale={ptBR}
          onMonthChange={(newMonth) => onChange(newMonth, format(newMonth, "yyyy-MM-dd"))}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  );

  if (label || error) {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        {pickerContent}
        {error && <AlertError errorMessage={error} />}
      </div>
    );
  }

  return pickerContent;
}
