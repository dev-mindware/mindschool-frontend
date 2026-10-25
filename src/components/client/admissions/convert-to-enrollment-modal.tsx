"use client";

import React, { useState, useMemo } from "react";
import { AdmissionApplication } from "@/types/admission";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { useSections } from "@/hooks/school/use-sections";
import {
  Button,
  ButtonSubmit,
  Icon,
  Input,
  PaginatedSelect,
  Progress,
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

interface ConvertToEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplication | null;
}

export function ConvertToEnrollmentModal({
  isOpen,
  onClose,
  application,
}: ConvertToEnrollmentModalProps) {
  const { convertCandidateToEnrollment } = useAdmissions();
  const { data: sections = [] } = useSections();

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paginated Section Search
  const [sectionSearch, setSectionSearch] = useState("");
  const [sectionPage, setSectionPage] = useState(1);
  const PAGE_SIZE = 5;

  const filteredSections = useMemo(() => {
    return sections.filter(
      (sec) =>
        sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        sec.classLevel.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        sec.roomNumber.toLowerCase().includes(sectionSearch.toLowerCase())
    );
  }, [sections, sectionSearch]);

  const totalPages = Math.ceil(filteredSections.length / PAGE_SIZE) || 1;

  const paginatedSections = useMemo(() => {
    const start = (sectionPage - 1) * PAGE_SIZE;
    return filteredSections.slice(start, start + PAGE_SIZE);
  }, [filteredSections, sectionPage]);

  const sectionOptions = useMemo(() => {
    const opts = paginatedSections.map((sec) => ({
      value: sec.id,
      label: `${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
      description: `${sec.roomNumber} • ${sec.currentEnrollmentCount}/${sec.capacity} alunos`,
    }));

    if (
      selectedSectionId &&
      !opts.some((opt) => opt.value === selectedSectionId)
    ) {
      const selected = sections.find((s) => s.id === selectedSectionId);
      if (selected) {
        opts.unshift({
          value: selected.id,
          label: `${selected.name} (${selected.shift === "MORNING" ? "Manhã" : "Tarde"})`,
          description: `${selected.roomNumber} • ${selected.currentEnrollmentCount}/${selected.capacity} alunos`,
        });
      }
    }
    return opts;
  }, [paginatedSections, selectedSectionId, sections]);

  if (!application || !isOpen) return null;

  const currentSection = sections.find((s) => s.id === selectedSectionId);
  const isFull = currentSection
    ? currentSection.currentEnrollmentCount >= currentSection.capacity
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSectionId) {
      ErrorMessage("Por favor, selecione a turma de destino para o novo aluno.");
      return;
    }

    if (isFull) {
      ErrorMessage("Atenção: Esta turma já atingiu a capacidade máxima de lotação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await convertCandidateToEnrollment(application.id, selectedSectionId);

      SucessMessage(
        `Matrícula efectivada com sucesso! Aluno cadastrado no sistema.`
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao efetivar matrícula";
      ErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0">
              <Icon name="UserCheck" className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg font-bold">
                Matricular candidato aprovado
              </SheetTitle>
              <SheetDescription className="text-xs">
                Cria o aluno e a matrícula a partir da candidatura. Só candidaturas aprovadas se podem converter e não se desfaz: para reverter, anula-se a matrícula.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

      <form id="convert-enrollment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Banner Informativo */}
        <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs space-y-1 text-emerald-950 dark:text-emerald-200">
          <div className="font-semibold flex items-center gap-1.5 text-sm text-emerald-800 dark:text-emerald-300">
            <Icon name="CircleCheck" className="h-4 w-4" />
            Candidatura Aprovada pronta para conversão
          </div>
          <p>
            Ao confirmar, os dados validados de <strong>{application.candidateName}</strong> (BI: {application.candidateDocumentNumber}) e do seu encarregado ({application.guardianName}) serão automaticamente importados para a ficha oficial do aluno.
          </p>
        </div>

        {/* Resumo da Pretensão do Candidato */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-card text-xs">
          <div>
            <span className="text-muted-foreground">Classe Pretendida:</span>
            <p className="font-medium text-foreground text-sm">
              {application.desiredClassLevelName}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Turno Preferencial:</span>
            <p className="font-medium text-foreground text-sm">
              {application.desiredShift === "MORNING"
                ? "Manhã"
                : application.desiredShift === "AFTERNOON"
                ? "Tarde"
                : "Noite"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Resultado do Exame:</span>
            <p className="font-medium text-foreground text-sm">
              {application.examScore !== undefined
                ? `${application.examScore.toFixed(1)} valores`
                : "Isento / Documentos"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">N.º da Candidatura:</span>
            <p className="font-medium text-foreground text-sm font-mono">
              {application.applicationNumber}
            </p>
          </div>
        </div>

        {/* Seleção de Turma com PaginatedSelect */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Turma de destino
            </label>
            <PaginatedSelect
              options={sectionOptions}
              value={selectedSectionId}
              onChange={setSelectedSectionId}
              placeholder="Pesquise por nome da turma, sala ou nível..."
              searchValue={sectionSearch}
              onSearchChange={(val) => {
                setSectionSearch(val);
                setSectionPage(1);
              }}
              pagination={{
                page: sectionPage,
                totalPages,
              }}
              onPageChange={setSectionPage}
              fullWidth
            />
          </div>

          {/* Indicador de Lotação em Tempo Real */}
          {currentSection && (
            <div className="p-3.5 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-foreground">
                  Lotação da {currentSection.name} ({currentSection.roomNumber}):
                </span>
                <span
                  className={`font-bold ${
                    isFull
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {currentSection.currentEnrollmentCount} / {currentSection.capacity} Alunos
                  {isFull && " (Lotação Esgotada)"}
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  (currentSection.currentEnrollmentCount / currentSection.capacity) * 100
                )}
                indicatorClassName={
                  isFull
                    ? "bg-red-500"
                    : currentSection.currentEnrollmentCount / currentSection.capacity > 0.85
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }
              />
            </div>
          )}

          <Input label="Ano Letivo (o da turma)" value={currentSection?.academicYear ?? "Escolha a turma"} disabled />

          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">O que é criado</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>A ficha do aluno (com o n.º de processo) e a matrícula na turma escolhida.</li>
              <li>As propinas do ano, segundo o plano da escola.</li>
              <li>A conversão não cria o encarregado (a candidatura só guarda o nome e o telefone dele): ligue-o depois na ficha do aluno.</li>
            </ul>
          </div>
        </div>
      </form>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit
            form="convert-enrollment-form"
            isLoading={isSubmitting}
            disabled={isFull}
          >
            <Icon name="UserPlus" className="h-4 w-4" />
            Confirmar Matrícula do Aluno
          </ButtonSubmit>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
