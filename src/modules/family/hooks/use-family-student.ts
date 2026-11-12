"use client";

import { useQueryState } from "nuqs";
import { usePortal } from "./use-portal";

/** Educando ativo da área da família: guardado na URL (`?student=`) para sobreviver a recargas e ser partilhável entre páginas. */
export function useFamilyStudent() {
  const [studentParam, setStudent] = useQueryState("student", { defaultValue: "", clearOnDefault: true });
  const { wards, wardsLoading } = usePortal(undefined, ["wards"]);
  const ward = wards.find((w) => w.student.id === studentParam) ?? wards[0];
  return { wards, wardsLoading, ward, studentId: ward?.student.id ?? "", setStudentId: (id: string) => void setStudent(id) };
}
