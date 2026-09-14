"use client";

import React, { useState } from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
import { AcademicSection } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassModal } from "./class-modal";
import { ClassDetailsModal } from "./class-details-modal";

interface ClassesListProps {
  sections: AcademicSection[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function ClassesList({
  sections,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
}: ClassesListProps) {
  const [selectedSection, setSelectedSection] =
    useState<AcademicSection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<AcademicSection | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleEdit = (section: AcademicSection) => {
    setSelectedSection(section);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (section: AcademicSection) => {
    setSelectedForDetails(section);
    setIsDetailsModalOpen(true);
  };

  const columns: Column<AcademicSection>[] = [
    {
      key: "name",
      header: "Turma",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground">
            Ano Lectivo: {item.academicYear}
          </span>
        </div>
      ),
    },
    {
      key: "classLevel",
      header: "Classe / Nível",
      render: (_, item) => (
        <span className="font-medium text-foreground text-sm">
          {item.classLevel}
        </span>
      ),
    },
    {
      key: "cycle",
      header: "Ciclo",
      render: (_, item) => {
        const cycleMap: Record<string, { label: string; variant: "info" | "default" | "warning" }> = {
          PRIMARY: { label: "Primário", variant: "info" },
          LOWER_SECONDARY: { label: "Iº Ciclo", variant: "default" },
          UPPER_SECONDARY: { label: "IIº Ciclo / Médio", variant: "warning" },
        };
        const conf = cycleMap[item.cycle] || cycleMap.PRIMARY;
        return (
          <Badge variant={conf.variant} className="text-xs">
            {conf.label}
          </Badge>
        );
      },
    },
    {
      key: "shift",
      header: "Turno",
      render: (_, item) => {
        const shiftMap = {
          MORNING: { label: "Manhã", icon: "Sun", color: "text-warning" },
          AFTERNOON: { label: "Tarde", icon: "Sunset", color: "text-warning" },
          EVENING: { label: "Noite", icon: "Moon", color: "text-info" },
        };
        const conf = shiftMap[item.shift] || shiftMap.MORNING;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Icon name={conf.icon as any} className={`w-3.5 h-3.5 ${conf.color}`} />
            {conf.label}
          </span>
        );
      },
    },
    {
      key: "roomNumber",
      header: "Sala",
      render: (_, item) => (
        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
          {item.roomNumber}
        </span>
      ),
    },
    {
      key: "capacity",
      header: "Ocupação / Vagas",
      render: (_, item) => {
        const percent = Math.min(
          Math.round((item.currentEnrollmentCount / item.capacity) * 100),
          100
        );
        const isFull = item.currentEnrollmentCount >= item.capacity;
        return (
          <div className="flex flex-col gap-1 w-36">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">
                {item.currentEnrollmentCount} / {item.capacity}
              </span>
              <span
                className={`font-mono text-[11px] ${
                  isFull ? "text-rose-600 font-medium" : "text-muted-foreground"
                }`}
              >
                {percent}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent >= 90
                    ? "bg-rose-500"
                    : percent >= 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
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
              onClick={() => handleViewDetails(item)}
            >
              <Icon name="Eye" className="h-4 w-4 text-muted-foreground" />
              Ver Detalhes da Turma
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Turma
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        data={sections}
        total={total}
        page={currentPage}
        totalPages={totalPages}
        setPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhuma turma encontrada."
      />

      <ClassModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSection(null);
        }}
        sectionToEdit={selectedSection}
      />

      <ClassDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedForDetails(null);
        }}
        section={selectedForDetails}
      />
    </>
  );
}
