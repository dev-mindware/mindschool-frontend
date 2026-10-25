"use client";

import React, { useState } from "react";
import { Can, DataList, type Column } from "@/components";
import { Enrollment } from "@/types";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnrollmentProof } from "./use-enrollment-proof";
import { CancelEnrollmentModal } from "./cancel-enrollment-modal";
import { EnrollmentDetailsModal } from "./enrollment-details-modal";

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

interface EnrollmentsListProps {
  enrollments: Enrollment[];
  isLoading?: boolean;
  isError?: boolean;
}

export function EnrollmentsList({ enrollments, isLoading, isError }: EnrollmentsListProps) {
  const proof = useEnrollmentProof();
  const [selectedForCancel, setSelectedForCancel] = useState<Enrollment | null>(
    null
  );
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<Enrollment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleOpenCancel = (item: Enrollment) => {
    setSelectedForCancel(item);
    setIsCancelModalOpen(true);
  };

  const handleOpenDetails = (item: Enrollment) => {
    setSelectedForDetails(item);
    setIsDetailsModalOpen(true);
  };

  const columns: Column<Enrollment>[] = [
    {
      key: "enrollmentNumber",
      header: "Nº Matrícula",
      render: (_, item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
          {item.enrollmentNumber}
        </span>
      ),
    },
    {
      key: "studentName",
      header: "Aluno",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.studentName}</span>
          <span className="text-xs text-muted-foreground">
            Ano Letivo: {item.academicYear}
          </span>
        </div>
      ),
    },
    {
      key: "sectionName",
      header: "Turma / Nível",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.sectionName}
          </span>
          <span className="text-xs text-muted-foreground">
            {item.classLevelId}
          </span>
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Data de Inscrição",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground font-mono">
          {item.enrollmentDate}
        </span>
      ),
    },
    {
      key: "tuitionPlanId",
      header: "Plano Financeiro",
      render: (_, item) => (
        <span className="text-xs px-2 py-0.5 rounded-full border border-border bg-card text-foreground font-medium">
          {item.tuitionPlanId === "plan-discount-50"
            ? "Bolsa Parcial (50%)"
            : item.tuitionPlanId === "plan-merit-full"
            ? "Bolsa de Mérito (100%)"
            : "Plano Regular Padrão"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => <SchoolStatusBadge status={item.status} />,
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="EllipsisVertical" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleOpenDetails(item)}
            >
              <Icon name="Eye" className="h-4 w-4 text-muted-foreground" />
              Ver Ficha de Matrícula
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => void proof.emit(item)}
            >
              <Icon name="FileText" className="h-4 w-4 text-blue-600" />
              Comprovativo (PDF)
            </DropdownMenuItem>
            {item.status !== "CANCELLED" && (
<Can permission="enrollment:cancel">
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenCancel(item)}
              >
                <Icon name="UserX" className="h-4 w-4 text-destructive" />
                Cancelar Matrícula
              </DropdownMenuItem>
</Can>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataList<Enrollment>
        prefix="matriculas"
        rows={enrollments}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        pageSize={10}
        searchPlaceholder="Pesquisar por n.º de matrícula, aluno, processo ou turma"
        searchText={(e) => `${e.enrollmentNumber} ${e.studentName} ${e.studentNumber} ${e.sectionName}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "ACTIVE", label: "Ativas" }, { value: "PENDING", label: "Pendentes" }, { value: "TRANSFERRED", label: "Transferidas" }, { value: "CANCELLED", label: "Canceladas" }], match: (e, v) => e.status === v },
          { key: "turma", label: "Turma", icon: "Users", options: uniq(enrollments.map((e) => e.sectionName)).map((v) => ({ value: v, label: v })), match: (e, v) => e.sectionName === v },
          { key: "classe", label: "Classe", icon: "GraduationCap", options: uniq(enrollments.map((e) => e.classLevelName)).map((v) => ({ value: v, label: v })), match: (e, v) => e.classLevelName === v },
          { key: "turno", label: "Turno", icon: "Sun", options: uniq(enrollments.map((e) => e.shift)).map((v) => ({ value: v, label: v })), match: (e, v) => e.shift === v },
          { key: "ano", label: "Ano letivo", icon: "CalendarRange", options: uniq(enrollments.map((e) => e.academicYear)).map((v) => ({ value: v, label: v })), match: (e, v) => e.academicYear === v },
          { key: "plano", label: "Plano financeiro", icon: "Wallet", options: uniq(enrollments.map((e) => e.tuitionPlanName)).map((v) => ({ value: v, label: v })), match: (e, v) => e.tuitionPlanName === v },
          { key: "bolsa", label: "Bolsa", icon: "Award", options: [{ value: "sim", label: "Com bolsa" }, { value: "nao", label: "Sem bolsa" }], match: (e, v) => (v === "sim" ? Boolean(e.hasScholarship) : !e.hasScholarship) },
        ]}
        dateFilters={[{ key: "inscricao", label: "Inscrição", getDate: (e) => e.enrollmentDate }]}
        sorts={[
          { value: "data", label: "Data de inscrição", compare: (a, b) => a.enrollmentDate.localeCompare(b.enrollmentDate) },
          { value: "aluno", label: "Aluno", compare: (a, b) => a.studentName.localeCompare(b.studentName, "pt") },
          { value: "numero", label: "N.º de matrícula", compare: (a, b) => a.enrollmentNumber.localeCompare(b.enrollmentNumber) },
        ]}
        emptyTitle="Nenhuma matrícula encontrada"
        emptyDescription="Ajuste os filtros ou registe uma nova matrícula."
        emptyIcon="ClipboardList"
      />

      <CancelEnrollmentModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        enrollment={selectedForCancel}
      />

      <EnrollmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedForDetails(null);
        }}
        enrollment={selectedForDetails}
      />
    </>
  );
}
