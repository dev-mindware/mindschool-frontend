"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useStudents } from "@/hooks/school/use-students";
import { StudentsList } from "./students-list";
import { StudentModal } from "./student-modal";
import { StudentStatus } from "@/types";

export function StudentsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "ALL">("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    students,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
    deleteStudent,
  } = useStudents(searchQuery, statusFilter, classFilter);

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Alunos"
          suTitle="Consulte a lista, pesquise por processo/BI e gira os dados dos estudantes"
        />
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shrink-0">
          <Icon name="UserPlus" className="w-4 h-4" />
          Cadastrar Aluno
        </Button>
      </div>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total de Estudantes"
          description="Alunos registados na base"
          icon="GraduationCap"
        />
        <DynamicMetricCard
          title={counts.enrolled}
          subtitle="Matriculados"
          description="Com matrícula activa no ano"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={counts.pending}
          subtitle="Pendentes"
          description="Aguardam confirmação"
          icon="Clock"
        />
        <DynamicMetricCard
          title={counts.cancelled}
          subtitle="Anulações"
          description="Processos cancelados"
          icon="UserX"
        />
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border">
        <div className="relative w-full md:w-80">
          <Icon
            name="Search"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Pesquisar por nome, processo ou BI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <div className="w-36">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as StudentStatus | "ALL")}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos Estados</SelectItem>
                <SelectItem value="ENROLLED">Matriculados</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
                <SelectItem value="TRANSFERRED">Transferidos</SelectItem>
                <SelectItem value="CANCELLED">Anulados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-36">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas Classes</SelectItem>
                <SelectItem value="7ª Classe">7ª Classe</SelectItem>
                <SelectItem value="10ª Classe">10ª Classe</SelectItem>
                <SelectItem value="11ª Classe">11ª Classe</SelectItem>
                <SelectItem value="12ª Classe">12ª Classe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <StudentsList
        students={students}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        onDeleteStudent={deleteStudent}
      />

      {/* Modal de Cadastro */}
      <StudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
