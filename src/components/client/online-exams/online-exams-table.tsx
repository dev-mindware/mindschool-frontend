'use client';

import React from 'react';
import { GenericTable, Button, Badge, Icon } from '@/components';
import { OnlineExam, ExamStatus } from '@/types/online-exam';

interface OnlineExamsTableProps {
  exams: OnlineExam[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onOpenAddQuestion: (exam: OnlineExam) => void;
  onOpenSimulator: (exam: OnlineExam) => void;
  onOpenGrading: (exam: OnlineExam) => void;
}

export function OnlineExamsTable({
  exams,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onOpenAddQuestion,
  onOpenSimulator,
  onOpenGrading,
}: OnlineExamsTableProps) {
  const getExamStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-xs font-normal">
            Publicada
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success border border-success-border">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Em Curso
          </span>
        );
      case 'GRADED':
        return (
          <Badge variant="default" className="text-xs font-normal">
            Corrigida
          </Badge>
        );
      case 'CLOSED':
        return <Badge variant="secondary" className="text-xs font-normal">Encerrada</Badge>;
      case 'DRAFT':
        return (
          <Badge variant="warning" className="text-xs font-normal">
            Rascunho
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <GenericTable<OnlineExam>
        data={exams}
        page={currentPage}
        totalPages={totalPages}
        total={total}
        setPage={onPageChange}
        goToNextPage={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        goToPreviousPage={() => onPageChange(Math.max(1, currentPage - 1))}
        columns={[
          {
            key: 'title',
            header: 'Prova & Disciplina',
            render: (_, item) => (
              <div>
                <p className="font-medium text-foreground text-sm leading-snug">{item.title}</p>
                <p className="text-xs text-muted-foreground font-mono">{item.subjectName} • {item.term}.º Trimestre</p>
              </div>
            ),
          },
          {
            key: 'class',
            header: 'Turma & Docente',
            render: (_, item) => (
              <div className="text-xs">
                <p className="font-medium text-foreground">{item.className}</p>
                <p className="text-muted-foreground">{item.createdByTeacherName}</p>
              </div>
            ),
          },
          {
            key: 'questionsCount',
            header: 'Questões & Duração',
            render: (_, item) => (
              <div className="text-xs">
                <p className="font-mono font-medium text-foreground">{item.questions.length} questões ({item.totalPoints.toFixed(1)} val)</p>
                <p className="text-muted-foreground">{item.durationMinutes} minutos de tempo limite</p>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Estado',
            render: (_, item) => getExamStatusBadge(item.status),
          },
          {
            key: 'actions',
            header: 'Ações',
            className: 'text-right',
            render: (_, item) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenAddQuestion(item)}
                  className="h-8 gap-1 text-xs"
                  title="Adicionar Questões à Prova"
                >
                  <Icon name="Plus" className="w-3.5 h-3.5" />
                  Questões
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenSimulator(item)}
                  className="h-8 gap-1 text-xs hover:text-foreground"
                  title="Simular Realização pelo Aluno"
                >
                  <Icon name="Play" className="w-3.5 h-3.5" />
                  Simular
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onOpenGrading(item)}
                  className="h-8 gap-1 text-xs"
                  title="Mesa de Correcção e Lançamento"
                >
                  <Icon name="CheckCheck" className="w-3.5 h-3.5" />
                  Corrigir
                </Button>
              </div>
            ),
          },
        ]}
        emptyMessage="Nenhuma prova online encontrada com os filtros atuais."
      />
    </div>
  );
}
