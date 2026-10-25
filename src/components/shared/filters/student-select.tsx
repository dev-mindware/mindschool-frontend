"use client";

import { useMemo, useState } from "react";
import { PaginatedSelect } from "./paginated-select";

export interface StudentOption {
  id: string;
  fullName: string;
  studentNumber?: string;
  currentSectionName?: string;
  currentClassLevel?: string;
}

interface StudentSelectProps {
  students: StudentOption[];
  value?: string | null;
  onChange: (studentId: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  isLoading?: boolean;
  pageSize?: number;
  className?: string;
}

/**
 * Seleção de aluno padrão (MindGest `PaginatedSelect`): pesquisa por nome / n.º de processo e paginação,
 * mantendo sempre o aluno escolhido nas opções. Usar em todos os modais que pedem um aluno.
 */
export function StudentSelect({ students, value, onChange, label = "Aluno", placeholder = "Pesquisar aluno...", error, disabled, isLoading, pageSize = 6, className }: StudentSelectProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter((s) => `${s.fullName} ${s.studentNumber ?? ""}`.toLowerCase().includes(q)) : students;
  }, [students, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);

  const options = useMemo(() => {
    const toOption = (s: StudentOption) => ({
      value: s.id,
      label: s.fullName,
      description: [s.studentNumber, s.currentSectionName || s.currentClassLevel || "Sem turma"].filter(Boolean).join(" • "),
    });
    const slice = filtered.slice((current - 1) * pageSize, current * pageSize).map(toOption);
    const picked = value ? students.find((s) => s.id === value) : undefined;
    if (picked && !slice.some((o) => o.value === picked.id)) slice.unshift(toOption(picked));
    return slice;
  }, [filtered, students, value, current, pageSize]);

  return (
    <PaginatedSelect
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Pesquisar por nome ou n.º de processo"
      searchValue={search}
      onSearchChange={(v) => { setSearch(v); setPage(1); }}
      pagination={{ page: current, totalPages }}
      onPageChange={setPage}
      error={error}
      disabled={disabled}
      isLoading={isLoading}
      fullWidth
      className={className}
    />
  );
}
