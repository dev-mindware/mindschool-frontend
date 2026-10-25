"use client";

import { useState } from "react";
import { Can, Button, ConfirmModal, DynamicMetricCard, Icon, TitleList } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import type { Student } from "@/types";
import { useStudents } from "@/hooks/school/use-students";
import { StudentModal } from "./student-modal";
import { StudentsList } from "./students-list";

export function StudentsPageContent() {
  const [addOpen, setAddOpen] = useState(false);
  const [toDeactivate, setToDeactivate] = useState<Student | null>(null);
  const { openModal } = useModal();
  const { allStudents, counts, isLoading, isError, updateStudent } = useStudents();

  return (
    <div className="space-y-6">
      <TitleList title="Alunos" suTitle="Consulte a lista, pesquise por processo/BI e gira os dados dos estudantes">
        <Can permission="student:write"><Button onClick={() => setAddOpen(true)} className="gap-2"><Icon name="UserPlus" className="size-4" />Cadastrar Aluno</Button></Can>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={counts.total} subtitle="Total de Estudantes" description="Alunos registados na base" icon="GraduationCap" />
        <DynamicMetricCard title={counts.enrolled} subtitle="Matriculados" description="Com matrícula ativa no ano" icon="CircleCheck" />
        <DynamicMetricCard title={counts.pending} subtitle="Pendentes" description="Aguardam confirmação" icon="Clock" />
        <DynamicMetricCard title={counts.cancelled} subtitle="Anulações" description="Processos cancelados" icon="UserX" />
      </div>

      <StudentsList
        students={allStudents}
        isLoading={isLoading}
        isError={isError}
        onDeleteStudent={(id) => { setToDeactivate(allStudents.find((s) => s.id === id) ?? null); openModal("student-deactivate"); }}
      />
      <StudentModal isOpen={addOpen} onClose={() => setAddOpen(false)} />
      <ConfirmModal
        id="student-deactivate"
        title="Desativar aluno"
        description={toDeactivate ? `Desativar ${toDeactivate.fullName} (processo ${toDeactivate.studentNumber})?` : ""}
        destructive
        confirmLabel="Desativar"
        effects={[
          "O aluno passa a «inactivo» e deixa de aparecer nas listas de alunos ativos.",
          "Não apaga a ficha, as notas, as faturas nem os documentos: tudo se mantém.",
          "Não anula a matrícula nem liberta a vaga: para isso use «Cancelar matrícula» em Matrículas.",
          "O estado «inactivo» não é definitivo: o aluno pode voltar a «activo».",
        ]}
        onConfirm={() => (toDeactivate ? updateStudent.mutateAsync({ id: toDeactivate.id, input: { status: "inactivo" } }) : Promise.resolve())}
      />
    </div>
  );
}
