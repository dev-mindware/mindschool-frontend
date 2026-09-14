'use client';

import React, { useState, useMemo } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { SearchHandlerWrapper } from '@/components/common';
import { FilterPopover } from '@/components/shared';
import { useOnlineExamStore } from '@/stores/school/online-exam-store';
import { useSchoolDataStore } from '@/stores/school/school-data-store';
import { OnlineExam, ExamStatus, ExamQuestion, StudentExamSubmission } from '@/types/online-exam';
import { OnlineExamsMetrics } from './online-exams-metrics';
import { OnlineExamsTable } from './online-exams-table';
import { CreateExamModal } from './create-exam-modal';
import { AddQuestionModal } from './add-question-modal';
import { ExamSimulatorModal } from './exam-simulator-modal';
import { ExamGradingModal } from './exam-grading-modal';

export function OnlineExamsPageContent() {
  const {
    exams,
    submissions,
    filterStatus,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    createExam,
    addQuestion,
    submitStudentExam,
    gradeEssayQuestion,
    pushScoreToGradebook,
    getMetrics,
  } = useOnlineExamStore();

  const { sections } = useSchoolDataStore();
  const metrics = getMetrics();

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isStudentSimulatorOpen, setIsStudentSimulatorOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  // Estados de Seleção
  const [activeExam, setActiveExam] = useState<OnlineExam | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<StudentExamSubmission | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Filtros
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesStatus = filterStatus === 'ALL' || exam.status === filterStatus;
      const matchesQuery =
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.className.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [exams, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredExams.length / PAGE_SIZE) || 1;
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredExams.slice(start, start + PAGE_SIZE);
  }, [filteredExams, currentPage]);

  const handleSaveExam = (examData: Omit<OnlineExam, 'id' | 'createdAt' | 'questions'>) => {
    const created = createExam(examData);
    setActiveExam(created);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenAddQuestion = (exam: OnlineExam) => {
    setActiveExam(exam);
    setIsAddQuestionModalOpen(true);
  };

  const handleSaveQuestion = (examId: string, questionData: Omit<ExamQuestion, 'id'>) => {
    addQuestion(examId, questionData);
  };

  const handleOpenSimulator = (exam: OnlineExam) => {
    setActiveExam(exam);
    setIsStudentSimulatorOpen(true);
  };

  const handleSubmitSimulation = (examId: string, answers: Record<string, string>) => {
    const sub = submitStudentExam(examId, 'std-simulated-01', answers);
    setIsStudentSimulatorOpen(false);
    setActiveSubmission(sub);
    setIsGradingModalOpen(true);
  };

  const handleOpenGrading = (exam: OnlineExam) => {
    setActiveExam(exam);
    const sub = submissions.find((s) => s.examId === exam.id) || submissions[0];
    if (sub) {
      setActiveSubmission(sub);
      setIsGradingModalOpen(true);
    }
  };

  const handleSaveEssayGrade = (
    questionId: string,
    maxPoints: number,
    score: number,
    feedback: string
  ) => {
    if (!activeSubmission) return;
    gradeEssayQuestion(activeSubmission.id, questionId, score, feedback);
    const updated = useOnlineExamStore.getState().submissions.find((s) => s.id === activeSubmission.id);
    if (updated) setActiveSubmission(updated);
  };

  const handlePushToPauta = () => {
    if (!activeSubmission) return;
    pushScoreToGradebook(activeSubmission.id);
    const updated = useOnlineExamStore.getState().submissions.find((s) => s.id === activeSubmission.id);
    if (updated) setActiveSubmission(updated);
  };

  const hasFilter = Boolean(searchQuery.trim() || filterStatus !== 'ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Avaliações & Provas Online"
        suTitle="Elabore avaliações digitais com perguntas de escolha múltipla, V/F e dissertativas com lançamento automático na mini-pauta."
      >
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shadow-xs text-xs font-semibold"
        >
          <Icon name="Plus" className="size-4" />
          Criar Nova Prova
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <OnlineExamsMetrics metrics={metrics} />

      {/* MindGest Standard Filters Toolbar */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por título, disciplina ou turma..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={[
              { label: 'Todos os Estados', value: 'ALL' },
              { label: 'Publicadas', value: 'PUBLISHED' },
              { label: 'Em Curso', value: 'IN_PROGRESS' },
              { label: 'Corrigidas / Finalizadas', value: 'GRADED' },
              { label: 'Rascunhos', value: 'DRAFT' },
            ]}
            value={filterStatus === 'ALL' ? null : filterStatus}
            onChange={(val) => {
              setStatusFilter((val as ExamStatus) ?? 'ALL');
              setCurrentPage(1);
            }}
          />

          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de Provas Online */}
      <OnlineExamsTable
        exams={paginatedExams}
        currentPage={currentPage}
        totalPages={totalPages}
        total={filteredExams.length}
        onPageChange={setCurrentPage}
        onOpenAddQuestion={handleOpenAddQuestion}
        onOpenSimulator={handleOpenSimulator}
        onOpenGrading={handleOpenGrading}
      />

      {/* Modal 1: Criar Nova Prova */}
      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        sections={sections}
        onSave={handleSaveExam}
      />

      {/* Modal 2: Adicionar Questão */}
      <AddQuestionModal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        activeExam={activeExam}
        onSaveQuestion={handleSaveQuestion}
      />

      {/* Modal 3: Simulador de Realização pelo Aluno */}
      <ExamSimulatorModal
        isOpen={isStudentSimulatorOpen}
        onClose={() => setIsStudentSimulatorOpen(false)}
        activeExam={activeExam}
        onSubmitSimulation={handleSubmitSimulation}
      />

      {/* Modal 4: Mesa de Correcção e Lançamento na Mini-Pauta */}
      <ExamGradingModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        activeExam={activeExam}
        activeSubmission={activeSubmission}
        onSaveEssayGrade={handleSaveEssayGrade}
        onPushToGradebook={handlePushToPauta}
      />
    </div>
  );
}
