"use client";

import { useState } from "react";
import { Can, Button, DynamicMetricCard, Icon, TitleList } from "@/components";
import { useStudents } from "@/hooks/school/use-students";
import { StudentModal } from "./student-modal";
import { StudentsList } from "./students-list";

export function StudentsPageContent() {
  const [addOpen, setAddOpen] = useState(false);
  const { allStudents, counts, isLoading, isError, updateStudent } = useStudents();

  return (
    <div className="space-y-6">
      <TitleList title="Alunos" suTitle="Consulte a lista, pesquise por processo/BI e gira os dados dos estudantes">
        <Can permission="student:write"><Button onClick={() => setAddOpen(true)} className="gap-2"><Icon name="UserPlus" className="size-4" />Cadastrar Aluno</Button></Can>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={counts.total} subtitle="Total de Estudantes" description="Alunos registados na base" icon="GraduationCap" />
        <DynamicMetricCard title={counts.enrolled} subtitle="Matriculados" description="Com matrícula activa no ano" icon="CircleCheck" />
        <DynamicMetricCard title={counts.pending} subtitle="Pendentes" description="Aguardam confirmação" icon="Clock" />
        <DynamicMetricCard title={counts.cancelled} subtitle="Anulações" description="Processos cancelados" icon="UserX" />
      </div>

      <StudentsList students={allStudents} isLoading={isLoading} isError={isError} onDeleteStudent={(id) => updateStudent.mutate({ id, input: { status: "inactivo" } })} />
      <StudentModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
