"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import type { ApiAcademicYear } from "@/services/academic-service";

interface AcademicYearSelectProps {
  years: ApiAcademicYear[];
  selectedYearId?: string;
  month: Date;
  onSelectYear: (yearId: string) => void;
  onMonthChange: (nextMonth: Date) => void;
}

/**
 * Selector de ano lectivo para as vistas de calendário; ajusta o mês visível automaticamente
 * quando o mês actual fica fora do intervalo do ano seleccionado.
 */
export function AcademicYearSelect({
  years,
  selectedYearId,
  month,
  onSelectYear,
  onMonthChange,
}: AcademicYearSelectProps) {
  if (years.length === 0) return null;

  return (
    <Select
      value={selectedYearId ?? ""}
      onValueChange={(v) => {
        onSelectYear(v);
        const chosen = years.find((y) => y.id === v);
        if (!chosen) return;
        const mIso = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
        if (mIso < chosen.start_date || mIso > chosen.end_date) {
          onMonthChange(new Date(`${chosen.start_date}T00:00:00`));
        }
      }}
    >
      <SelectTrigger className="h-8 w-44">
        <SelectValue placeholder="Ano lectivo" />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y.id} value={y.id}>
            {y.name} ({y.status})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

