"use client";

import { useState } from "react";
import { ButtonOnlyAction, DataList, type Column } from "@/components";
import { useHealth } from "@/hooks/school/use-health";
import { useModal } from "@/stores/modal/use-modal-store";
import { HealthProfileModal } from "./health-profile-modal";

/** Diretório de alunos: a ficha clínica abre-se por aluno (os dados só são lidos quando se abre a ficha). */
export function StudentHealthDirectoryView() {
  const { students } = useHealth();
  const { openModal } = useModal();
  const [studentId, setStudentId] = useState<string | null>(null);
  type Row = (typeof students)[number];

  const columns: Column<Row>[] = [
    { key: "fullName", header: "Aluno", render: (_, s) => <span className="font-medium">{s.fullName}</span> },
    { key: "currentClassLevel", header: "Classe", render: (_, s) => s.currentClassLevel ?? "—" },
    { key: "action", header: "Ficha", render: (_, s) => <ButtonOnlyAction data={s} actions={[{ label: "Abrir ficha clínica", icon: "FileHeart", onClick: (x) => { setStudentId(x.id); openModal("health-profile"); } }]} /> },
  ];
  const levels = [...new Set(students.map((s) => s.currentClassLevel).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b, "pt", { numeric: true }));

  return (
    <>
      <DataList<Row>
        prefix="fichas"
        rows={students}
        columns={columns}
        searchPlaceholder="Pesquisar aluno por nome"
        searchText={(s) => s.fullName}
        filters={[{ key: "classe", label: "Classe", icon: "GraduationCap", options: levels.map((l) => ({ value: l, label: l })), match: (s, v) => s.currentClassLevel === v }]}
        sorts={[{ value: "nome", label: "Nome", compare: (a, b) => a.fullName.localeCompare(b.fullName) }, { value: "classe", label: "Classe", compare: (a, b) => (a.currentClassLevel ?? "").localeCompare(b.currentClassLevel ?? "", "pt", { numeric: true }) }]}
        emptyTitle="Nenhum aluno encontrado"
        emptyIcon="Users"
      />
      <HealthProfileModal studentId={studentId} />
    </>
  );
}
