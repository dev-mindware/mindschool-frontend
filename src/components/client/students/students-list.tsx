"use client";

import { useMemo, useState } from "react";
import { ButtonOnlyAction, DataList, type Column } from "@/components";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { Student } from "@/types";
import { StudentDetailsSheet } from "./student-details-sheet";
import { StudentModal } from "./student-modal";
import { StudentIdCardModal } from "./student-id-card-modal";
import { InviteCredentialsModal } from "@/components/client/shared/invite-credentials-modal";
import { useStudents } from "@/hooks/school/use-students";

const STATUS_OPTIONS = [
  { value: "ENROLLED", label: "Matriculados" },
  { value: "PENDING", label: "Pendentes" },
  { value: "TRANSFERRED", label: "Transferidos" },
  { value: "CANCELLED", label: "Anulados" },
];

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

interface StudentsListProps {
  students: Student[];
  isLoading?: boolean;
  isError?: boolean;
  onDeleteStudent?: (id: string) => void;
}

/** Lista de alunos (padrão MindGest): filtros na URL, pesquisa, datas, ordenação e paginação. */
export function StudentsList({ students, isLoading, isError, onDeleteStudent }: StudentsListProps) {
  const { inviteStudent } = useStudents();
  const [selected, setSelected] = useState<Student | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cardStudent, setCardStudent] = useState<Student | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [invitingStudent, setInvitingStudent] = useState<Student | null>(null);

  const levels = useMemo(() => uniq(students.map((s) => s.currentClassLevel)), [students]);
  const sections = useMemo(() => uniq(students.map((s) => s.currentSectionName)), [students]);
  const provinces = useMemo(() => uniq(students.map((s) => s.province)), [students]);
  const years = useMemo(() => uniq(students.map((s) => s.academicYear)), [students]);

  const columns: Column<Student>[] = [
    { key: "studentNumber", header: "N.º Processo", render: (_, s) => <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">{s.studentNumber}</span> },
    {
      key: "fullName", header: "Nome Completo",
      render: (_, s) => (
        <div className="flex flex-col">
          <button type="button" className="text-left font-medium hover:underline" onClick={() => { setSelected(s); setDetailsOpen(true); }}>{s.fullName}</button>
          <span className="text-xs text-muted-foreground">{s.gender === "MALE" ? "Masc." : "Fem."} • {s.birthDate}</span>
        </div>
      ),
    },
    { key: "idDocumentNumber", header: "Bilhete de Identidade", render: (_, s) => <span className="font-mono text-xs text-muted-foreground">{s.idDocumentNumber}</span> },
    { key: "currentSectionName", header: "Turma Actual", render: (_, s) => <span className="text-sm font-medium">{s.currentSectionName || "Sem Turma"}</span> },
    { key: "guardianName", header: "Encarregado", render: (_, s) => (<div className="flex flex-col"><span className="text-sm">{s.guardianName}</span><span className="text-xs text-muted-foreground">{s.guardianPhone}</span></div>) },
    { key: "status", header: "Estado", render: (_, s) => <SchoolStatusBadge status={s.status} /> },
    {
      key: "actions", header: "Acções",
      render: (_, s) => (
        <ButtonOnlyAction data={s} actions={[
          { label: "Ver ficha", icon: "Eye", onClick: (x) => { setSelected(x); setDetailsOpen(true); } },
          { label: "Cartão de Estudante", icon: "CreditCard", onClick: (x) => { setCardStudent(x); setCardOpen(true); } },
          { permission: "student:write", label: "Convidar (Acesso)", icon: "Mail", onClick: (x) => setInvitingStudent(x) },
          { permission: "student:write", label: "Editar", icon: "Pencil", onClick: (x) => { setEditing(x); setEditOpen(true); } },
          ...(onDeleteStudent ? [{ permission: "student:write", label: "Desactivar aluno", icon: "UserX" as const, variant: "destructive" as const, onClick: (x: Student) => onDeleteStudent(x.id) }] : []),
        ]} />
      ),
    },
  ];

  return (
    <>
      <DataList<Student>
        prefix="alunos"
        rows={students}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        pageSize={10}
        searchPlaceholder="Pesquisar por nome, processo, BI ou encarregado"
        searchText={(s) => `${s.fullName} ${s.studentNumber} ${s.idDocumentNumber} ${s.guardianName} ${s.guardianPhone}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: STATUS_OPTIONS, match: (s, v) => s.status === v },
          { key: "classe", label: "Classe", icon: "GraduationCap", options: levels.map((l) => ({ value: l, label: l })), match: (s, v) => s.currentClassLevel === v },
          { key: "turma", label: "Turma", icon: "Users", options: [{ value: "__none", label: "Sem turma" }, ...sections.map((l) => ({ value: l, label: l }))], match: (s, v) => (v === "__none" ? !s.currentSectionName : s.currentSectionName === v) },
          { key: "genero", label: "Género", icon: "User", options: [{ value: "MALE", label: "Masculino" }, { value: "FEMALE", label: "Feminino" }], match: (s, v) => s.gender === v },
          { key: "provincia", label: "Província", icon: "MapPin", options: provinces.map((l) => ({ value: l, label: l })), match: (s, v) => s.province === v },
          { key: "ano", label: "Ano lectivo", icon: "CalendarRange", options: years.map((l) => ({ value: l, label: l })), match: (s, v) => s.academicYear === v },
        ]}
        dateFilters={[{ key: "registo", label: "Registo", getDate: (s) => s.createdAt }]}
        sorts={[
          { value: "nome", label: "Nome", compare: (a, b) => a.fullName.localeCompare(b.fullName, "pt") },
          { value: "processo", label: "N.º de processo", compare: (a, b) => a.studentNumber.localeCompare(b.studentNumber) },
          { value: "registo", label: "Data de registo", compare: (a, b) => a.createdAt.localeCompare(b.createdAt) },
        ]}
        emptyTitle="Nenhum aluno encontrado"
        emptyDescription="Ajuste os filtros ou cadastre um novo aluno."
        emptyIcon="GraduationCap"
      />
      <StudentDetailsSheet
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        student={selected}
        onEdit={(s) => { setEditing(s); setEditOpen(true); }}
        onOpenCard={(s) => { setCardStudent(s); setCardOpen(true); }}
      />
      <StudentModal isOpen={editOpen} onClose={() => setEditOpen(false)} studentToEdit={editing} />
      <StudentIdCardModal
        isOpen={cardOpen}
        onClose={() => setCardOpen(false)}
        studentId={cardStudent?.id ?? ""}
        studentName={cardStudent?.fullName ?? ""}
      />
      {invitingStudent && (
        <InviteCredentialsModal
          isOpen={Boolean(invitingStudent)}
          onClose={() => setInvitingStudent(null)}
          targetName={invitingStudent.fullName}
          targetRole="Aluno"
          currentEmail={invitingStudent.email}
          onSend={async (email) => {
            await inviteStudent.mutateAsync({ id: invitingStudent.id, email });
          }}
        />
      )}
    </>
  );
}
