
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
import { Matcher } from "react-day-picker"

interface DatePickerProps {
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
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  value,
  onChange,
  placeholder = "Escolha a data",
  disabledDates = { before: new Date() },
  className,
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
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
}
