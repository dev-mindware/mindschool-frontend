"use client";

import React, { useState, useMemo } from "react";
import { useSections } from "@/hooks/school/use-sections";
import { useStudents } from "@/hooks/school/use-students";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Icon,
  PaginatedSelect,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollmentModal({ isOpen, onClose }: EnrollmentModalProps) {
  const { allStudents: students, createStudent } = useStudents();
  const { data: sections = [] } = useSections();
  const { enroll } = useEnrollments();

  const [studentMode, setStudentMode] = useState<"existing" | "new">("existing");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [academicYear, setAcademicYear] = useState("2025/2026");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paginated search for student
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 5;

  // New student fields
  const [newFullName, setNewFullName] = useState("");
  const [newGender, setNewGender] = useState<"MALE" | "FEMALE">("MALE");
  const [newBirthDate, setNewBirthDate] = useState("2010-01-01");
  const [newIdNumber, setNewIdNumber] = useState("");
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [newGuardianRel, setNewGuardianRel] = useState("Pai");

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionId) {
      ErrorMessage("Por favor, selecione uma turma.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (studentMode === "existing") {
        if (!selectedStudentId) {
          ErrorMessage("Por favor, selecione o estudante.");
          setIsSubmitting(false);
          return;
        }
        await enroll.mutateAsync({ studentId: selectedStudentId, sectionId: selectedSectionId });
      } else {
        if (!newFullName.trim()) {
          ErrorMessage("Por favor, preencha o nome do novo aluno.");
          setIsSubmitting(false);
          return;
        }
        if (!newIdNumber.trim()) {
          ErrorMessage("Indique o número do documento do aluno.");
          setIsSubmitting(false);
          return;
        }
        // O encarregado liga-se depois, na ficha do aluno ou em Encarregados (a API exige o seu n.º de documento).
        await createStudent.mutateAsync({
          fullName: newFullName,
          gender: newGender,
          birthDate: newBirthDate,
          idDocumentType: "IDENTITY_CARD",
          idDocumentNumber: newIdNumber.trim(),
          sectionId: selectedSectionId,
        });
      }

      SucessMessage("Matrícula processada e registada com sucesso!");
      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao processar a matrícula."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  const pagedStudents = useMemo(() => {
    const start = (studentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, studentPage]);

  const studentOptions = useMemo(() => {
    const opts = pagedStudents.map((s) => ({
      value: s.id,
      label: s.fullName,
      description: `${s.studentNumber} • ${s.currentClassLevel || "Sem Turma"}`,
    }));

    if (
      selectedStudentId &&
      !opts.some((o) => o.value === selectedStudentId)
    ) {
      const activeStudent = students.find((s) => s.id === selectedStudentId);
      if (activeStudent) {
        opts.unshift({
          value: activeStudent.id,
          label: activeStudent.fullName,
          description: `${activeStudent.studentNumber} • ${
            activeStudent.currentClassLevel || "Sem Turma"
          }`,
        });
      }
    }

    return opts;
  }, [pagedStudents, selectedStudentId, students]);

  const handleStudentSearch = (val: string) => {
    setStudentSearch(val);
    setStudentPage(1);
  };

  const sectionOptions = sections.map((sec) => {
    const available = sec.capacity - sec.currentEnrollmentCount;
    return {
      value: sec.id,
      label: `${sec.name} • ${sec.roomNumber} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"}) — ${
        available > 0 ? `${available} vagas livres` : "Esgotada"
      }`,
    };
  });

  const genderOptions = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
  ];

  const relationshipOptions = [
    { value: "Pai", label: "Pai" },
    { value: "Mãe", label: "Mãe" },
    { value: "Tio/Tia", label: "Tio(a)" },
    { value: "Tutor Legal", label: "Tutor Legal" },
  ];

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title="Boletim de Matrícula Digital (UC-01)"
      description="Efectue a inscrição de novos ingressos ou confirmação anual de alunos existentes"
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Toggle de Aluno Existente vs Novo Ingresso */}
        <div className="flex gap-2 p-1 bg-muted/60 rounded-lg">
          <Button
            type="button"
            variant={studentMode === "existing" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStudentMode("existing")}
            className="flex-1 text-xs"
          >
            Aluno Existente na Base
          </Button>
          <Button
            type="button"
            variant={studentMode === "new" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStudentMode("new")}
            className="flex-1 text-xs"
          >
            Novo Ingresso (Sem Registo Prévio)
          </Button>
        </div>

        {studentMode === "existing" ? (
          <div className="space-y-4">
            <PaginatedSelect
              label="Seleccionar Estudante (com pesquisa e paginação) *"
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="Pesquise por nome do aluno ou nº de processo..."
              searchPlaceholder="Digite o nome ou número..."
              searchValue={studentSearch}
              onSearchChange={handleStudentSearch}
              pagination={{ page: studentPage, totalPages }}
              onPageChange={setStudentPage}
              options={studentOptions}
              fullWidth
            />
          </div>
        ) : (
          <div className="space-y-3 p-3 bg-muted/30 rounded-xl border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Dados do Novo Ingresso
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Nome Completo *"
                  startIcon="User"
                  placeholder="Ex: Ana Sofia de Carvalho"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
              </div>

              <SelectField
                label="Género"
                value={newGender}
                options={genderOptions}
                onValueChange={(val) => setNewGender(val as "MALE" | "FEMALE")}
              />

              <Input
                type="date"
                label="Data de Nascimento"
                startIcon="Calendar"
                value={newBirthDate}
                onChange={(e) => setNewBirthDate(e.target.value)}
              />

              <Input
                label="Número de BI / Cédula"
                startIcon="CreditCard"
                placeholder="Ex: 004928172LA041"
                value={newIdNumber}
                onChange={(e) => setNewIdNumber(e.target.value)}
              />

              <Input
                label="Nome do Encarregado"
                startIcon="User"
                placeholder="Ex: Manuel de Carvalho"
                value={newGuardianName}
                onChange={(e) => setNewGuardianName(e.target.value)}
              />

              <Input
                label="Telefone do Encarregado"
                startIcon="Phone"
                placeholder="9xxxxxxxx"
                maxLength={9}
                value={newGuardianPhone}
                onChange={(e) => setNewGuardianPhone(e.target.value)}
              />

              <SelectField
                label="Grau de Parentesco"
                value={newGuardianRel}
                options={relationshipOptions}
                onValueChange={setNewGuardianRel}
              />
            </div>
          </div>
        )}

        {/* Destino Lectivo */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Alocação Lectiva & Turma
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <SelectField
                label="Turma de Destino *"
                value={selectedSectionId}
                options={sectionOptions}
                placeholder="Selecione a turma..."
                onValueChange={setSelectedSectionId}
              />
            </div>

            <Input
              label="Ano Lectivo"
              startIcon="Calendar"
              value={academicYear}
              disabled
            />

            <Input
              label="Observações / Descontos Especiais"
              startIcon="FileText"
              placeholder="Ex: Transferência de outra província"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Botões de Acção no Padrão MindGest */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            Confirmar Matrícula
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
