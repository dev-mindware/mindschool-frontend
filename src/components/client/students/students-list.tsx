"use client";

import React, { useState } from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Student } from "@/types";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StudentDetailsSheet } from "./student-details-sheet";
import { StudentModal } from "./student-modal";

interface StudentsListProps {
  students: Student[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  onDeleteStudent?: (id: string) => void;
}

export function StudentsList({
  students,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
  onDeleteStudent,
}: StudentsListProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setStudentToEdit(student);
    setIsEditOpen(true);
  };

  const columns: Column<Student>[] = [
    {
      key: "studentNumber",
      header: "N.º Processo",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
          {item.studentNumber}
        </span>
      ),
    },
    {
      key: "fullName",
      header: "Nome Completo",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground hover:underline cursor-pointer" onClick={() => handleOpenDetails(item)}>
            {item.fullName}
          </span>
          <span className="text-xs text-muted-foreground">
            {item.gender === "MALE" ? "Masc." : "Fem."} • {item.birthDate}
          </span>
        </div>
      ),
    },
    {
      key: "idDocumentNumber",
      header: "Bilhete de Identidade",
      render: (_, item) => (
        <span className="font-mono text-xs text-muted-foreground">
          {item.idDocumentNumber}
        </span>
      ),
    },
    {
      key: "currentSectionName",
      header: "Turma Actual",
      render: (_, item) => (
        <span className="text-sm font-medium text-foreground">
          {item.currentSectionName || "Sem Turma"}
        </span>
      ),
    },
    {
      key: "guardianName",
      header: "Encarregado",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{item.guardianName}</span>
          <span className="text-xs text-muted-foreground">{item.guardianPhone}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <SchoolStatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "Acções",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
              <Icon name="EllipsisVertical" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleOpenDetails(item)} className="gap-2 cursor-pointer">
              <Icon name="Eye" className="h-4 w-4 text-muted-foreground" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenEdit(item)} className="gap-2 cursor-pointer">
              <Icon name="Pencil" className="h-4 w-4 text-muted-foreground" />
              Editar
            </DropdownMenuItem>
            {onDeleteStudent && (
              <DropdownMenuItem
                onClick={() => onDeleteStudent(item.id)}
                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Icon name="Trash2" className="h-4 w-4" />
                Remover
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <GenericTable<Student>
        data={students}
        columns={columns}
        page={currentPage}
        total={total}
        totalPages={totalPages}
        setPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhum aluno encontrado com os filtros aplicados."
      />

      <StudentDetailsSheet
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        student={selectedStudent}
        onEdit={(stu) => handleOpenEdit(stu)}
      />

      <StudentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        studentToEdit={studentToEdit}
      />
    </>
  );
}
