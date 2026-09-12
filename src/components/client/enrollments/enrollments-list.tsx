"use client";

import React, { useState } from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
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
import { CancelEnrollmentModal } from "./cancel-enrollment-modal";
import { EnrollmentDetailsModal } from "./enrollment-details-modal";

interface EnrollmentsListProps {
  enrollments: Enrollment[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function EnrollmentsList({
  enrollments,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
}: EnrollmentsListProps) {
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
            Ano Lectivo: {item.academicYear}
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
              onClick={() => {
                alert(`Comprovativo emitido para matrícula ${item.enrollmentNumber} (${item.studentName})`);
              }}
            >
              <Icon name="FileText" className="h-4 w-4 text-blue-600" />
              Comprovativo (PDF)
            </DropdownMenuItem>
            {item.status !== "CANCELLED" && (
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                onClick={() => handleOpenCancel(item)}
              >
                <Icon name="UserX" className="h-4 w-4 text-destructive" />
                Cancelar Matrícula
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        data={enrollments}
        total={total}
        page={currentPage}
        totalPages={totalPages}
        setPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhuma matrícula encontrada com os filtros selecionados."
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
