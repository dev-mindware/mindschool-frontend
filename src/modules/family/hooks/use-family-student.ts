"use client";

import { useQueryState } from "nuqs";
import { usePortal } from "./use-portal";

/** Educando ativo da área da família: guardado na URL (`?aluno=`) para sobreviver a recargas e ser partilhável entre páginas. */
export function useFamilyStudent() {
  const [alunoParam, setAluno] = useQueryState("aluno", { defaultValue: "", clearOnDefault: true });
  const { wards, wardsLoading } = usePortal(undefined, ["wards"]);
  const ward = wards.find((w) => w.student.id === alunoParam) ?? wards[0];
  return { wards, wardsLoading, ward, studentId: ward?.student.id ?? "", setStudentId: (id: string) => void setAluno(id) };
}
