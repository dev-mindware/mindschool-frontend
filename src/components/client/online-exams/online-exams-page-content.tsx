'use client';

import React, { useState } from 'react';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { Can, TitleList, Button, Icon } from '@/components';
import { useExamTargets, useOnlineExams } from '@/hooks/school/use-online-exams';
import type { ApiExam } from '@/services/exams-service';
import { getApiErrorMessage } from '@/utils/api-error';
import { OnlineExamsMetrics } from './online-exams-metrics';
import { OnlineExamsTable } from './online-exams-table';
import { CreateExamModal, CREATE_EXAM_MODAL_ID } from './create-exam-modal';
import { useModal } from '@/stores/modal/use-modal-store';
import { AddQuestionModal } from './add-question-modal';
import { ExamGradingModal } from './exam-grading-modal';
import { GoogleFormModal } from './google-form-modal';

export function OnlineExamsPageContent() {
  const { allExams, isLoading, metrics, create, addQuestion, removeQuestion, publish, close } = useOnlineExams();
  const { assignments, terms } = useExamTargets();

  const { openModal } = useModal();
  const [questionsFor, setQuestionsFor] = useState<string | null>(null);
  const [gradingFor, setGradingFor] = useState<string | null>(null);
  const [formFor, setFormFor] = useState<string | null>(null);

  // As modais leem sempre a versao mais recente da prova (a lista e invalidada a cada alteracao).
  const byId = (id: string | null): ApiExam | null => allExams.find((e) => e.id === id) ?? null;

  const run = (p: Promise<unknown>, ok: string) => p.then(() => SucessMessage(ok)).catch((e) => ErrorMessage(getApiErrorMessage(e, 'A operação falhou.')));

  return (
    <div className="space-y-6">
      <TitleList
        title="Avaliações & Provas Online"
        suTitle="Elabore provas com escolha múltipla, V/F, resposta curta e dissertativas, na plataforma ou num Google Form, com lançamento na mini-pauta."
      >
        <Can permission="exam:write"><Button variant="default" size="sm" onClick={() => openModal(CREATE_EXAM_MODAL_ID)} className="gap-2 shadow-xs text-xs font-semibold">
          <Icon name="Plus" className="size-4" />
          Criar Nova Prova
        </Button></Can>
      </TitleList>

      <OnlineExamsMetrics metrics={metrics} />

      <OnlineExamsTable
        exams={allExams}
        isLoading={isLoading}
        onOpenQuestions={(e) => setQuestionsFor(e.id)}
        onOpenGoogleForm={(e) => setFormFor(e.id)}
        onOpenGrading={(e) => setGradingFor(e.id)}
        onPublish={(e) => run(publish.mutateAsync(e.id), 'Prova publicada.')}
        onClose={(e) => run(close.mutateAsync(e.id), 'Prova encerrada.')}
      />

      <CreateExamModal
        assignments={assignments}
        terms={terms}
        isSaving={create.isPending}
        onSave={(v) =>
          create.mutateAsync(v).then((exam) => {
            SucessMessage('Prova criada.');
            setQuestionsFor(exam.id);
          }).catch((e) => {
            ErrorMessage(getApiErrorMessage(e, 'Não foi possível criar a prova.'));
            throw e;
          })
        }
      />

      <AddQuestionModal
        isOpen={Boolean(questionsFor)}
        onClose={() => setQuestionsFor(null)}
        activeExam={byId(questionsFor)}
        isSaving={addQuestion.isPending}
        onAddQuestion={(q) => addQuestion.mutateAsync({ examId: questionsFor!, question: q }).then(() => SucessMessage('Questão adicionada.')).catch((e) => ErrorMessage(getApiErrorMessage(e, 'Questão inválida.')))}
        onRemoveQuestion={(id) => run(removeQuestion.mutateAsync({ examId: questionsFor!, questionId: id }), 'Questão removida.')}
      />

      <GoogleFormModal isOpen={Boolean(formFor)} onClose={() => setFormFor(null)} activeExam={byId(formFor)} />
      <ExamGradingModal isOpen={Boolean(gradingFor)} onClose={() => setGradingFor(null)} activeExam={byId(gradingFor)} />
    </div>
  );
}
