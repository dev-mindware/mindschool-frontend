"use client";

import React, { useState, useMemo } from "react";
import { useSections } from "@/hooks/school/use-sections";
import { useStudents } from "@/hooks/school/use-students";
import { useEnrollments } from "@/hooks/school/use-enrollments";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  PaginatedSelect,
} from "@/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paginated search for student
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 5;

  // New student fields
  const [newFullName, setNewFullName] = useState("");
  const [newGender, setNewGender] = useState<"MALE" | "FEMALE">("MALE");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newIdNumber, setNewIdNumber] = useState("");

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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-lg font-bold">Boletim de Matrícula Digital</SheetTitle>
          <SheetDescription className="text-xs">
            Efetue a inscrição de novos ingressos ou confirmação anual de alunos existentes
          </SheetDescription>
        </SheetHeader>

      <form id="enrollment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
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
            <p className="text-xs text-muted-foreground" role="note">
              Este atalho não pede encarregado. Associe-o depois em Secretaria › Encarregados; para registar o aluno já com encarregado, use «Cadastrar Aluno».
            </p>
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

              <p className="sm:col-span-2 text-xs text-muted-foreground">
                O encarregado não se regista aqui: depois de matricular, ligue-o na ficha do aluno ou em Secretaria › Encarregados.
                Sem encarregado, o aluno não tem quem receba avisos nem veja as propinas no portal.
              </p>
            </div>
          </div>
        )}

        {/* Destino Letivo */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Alocação Letiva & Turma
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <SelectField
                label="Turma de Destino *"
                value={selectedSectionId}
                options={sectionOptions}
                placeholder={sectionOptions.length === 0 ? "Ainda não há turmas" : "Selecione a turma..."}
                onValueChange={setSelectedSectionId}
                disabled={sectionOptions.length === 0}
              />
              {sectionOptions.length === 0 && (
                <p className="mt-1.5 text-xs text-muted-foreground" role="status">
                  Ainda não há turmas para matricular. Crie primeiro uma turma em <a className="font-medium text-primary underline" href="/academic/classes">Académico › Turmas</a>.
                </p>
              )}
            </div>

            <Input
              label="Ano Letivo (o da turma)"
              startIcon="Calendar"
              value={selectedSection?.academicYear ?? "Escolha a turma"}
              disabled
            />
            <p className="text-xs text-muted-foreground sm:self-end">
              Ao matricular, o sistema gera a matrícula e as propinas do ano segundo o plano da escola.
            </p>
          </div>
        </div>

      </form>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit form="enrollment-form" isLoading={isSubmitting}>
            Confirmar Matrícula
          </ButtonSubmit>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
