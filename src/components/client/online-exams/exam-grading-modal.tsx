'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Icon } from '@/components';
import { OnlineExam, StudentExamSubmission } from '@/types/online-exam';

interface ExamGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: OnlineExam | null;
  activeSubmission: StudentExamSubmission | null;
  onSaveEssayGrade: (questionId: string, maxPoints: number, score: number, feedback: string) => void;
  onPushToGradebook: () => void;
}

export function ExamGradingModal({
  isOpen,
  onClose,
  activeExam,
  activeSubmission,
  onSaveEssayGrade,
  onPushToGradebook,
}: ExamGradingModalProps) {
  const [essayScoreInputs, setEssayScoreInputs] = useState<Record<string, number>>({});
  const [essayFeedbackInputs, setEssayFeedbackInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeSubmission) {
      setEssayScoreInputs(activeSubmission.essayScores || {});
      setEssayFeedbackInputs(activeSubmission.essayFeedback || {});
    }
  }, [activeSubmission]);

  const handleSaveGrade = (questionId: string, maxPoints: number) => {
    const rawScore = essayScoreInputs[questionId] !== undefined
      ? essayScoreInputs[questionId]
      : (activeSubmission?.essayScores[questionId] || 0);
    const score = Math.min(maxPoints, Math.max(0, rawScore));
    const feedback = essayFeedbackInputs[questionId] !== undefined
      ? essayFeedbackInputs[questionId]
      : (activeSubmission?.essayFeedback[questionId] || '');

    onSaveEssayGrade(questionId, maxPoints, score, feedback);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeSubmission ? `Mesa de Correcção: ${activeSubmission.studentName}` : 'Mesa de Correcção'}
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-4xl"
    >
      {activeSubmission && activeExam && (
        <div className="space-y-6">
          {/* Resumo da Nota */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground">{activeSubmission.studentNumber}</span>
              <h3 className="text-base font-semibold text-foreground">{activeSubmission.studentName}</h3>
              <p className="text-xs text-muted-foreground">
                {activeExam.title} • Submetido em: {activeSubmission.submittedAt}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-medium tracking-wider text-muted-foreground block">
                Nota Final
              </span>
              <span
                className={`text-3xl font-extrabold font-mono ${
                  activeSubmission.totalScore >= 10 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {activeSubmission.totalScore.toFixed(1)}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ 20 val</span>
              </span>
            </div>
          </div>

          {/* Revisão Questão a Questão */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {activeExam.questions.map((q, idx) => {
              const studentAns = activeSubmission.answers[q.id];
              const isObjective = q.type !== 'ESSAY';
              const isCorrect =
                isObjective &&
                studentAns &&
                (q.type === 'SHORT_ANSWER'
                  ? studentAns.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
                  : studentAns === q.correctAnswer);

              return (
                <div key={q.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-semibold text-xs text-foreground">
                      Questão {idx + 1} ({q.points.toFixed(1)} valores)
                    </span>
                    {isObjective ? (
                      isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <Icon name="CircleCheck" className="w-4 h-4" />
                          Correcta (+{q.points.toFixed(1)} val)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold">
                          <Icon name="CircleAlert" className="w-4 h-4" />
                          Errada (0 val)
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">
                        Dissertativa (Correcção Manual)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-foreground font-medium">{q.prompt}</p>

                  <div className="p-2.5 rounded-lg bg-muted/40 text-xs">
                    <span className="text-muted-foreground block text-[11px] mb-0.5">Resposta do Aluno:</span>
                    <p className="font-mono text-foreground font-semibold">
                      {studentAns || <span className="italic text-muted-foreground">Sem resposta</span>}
                    </p>
                  </div>

                  {/* Bloco de Correcção para Dissertativas */}
                  {q.type === 'ESSAY' && (
                    <div className="pt-2 border-t border-border/40 space-y-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                      <p className="text-[11px] text-muted-foreground italic">
                        Critérios: {q.rubricCriteria}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-40">
                          <label className="block text-[11px] font-medium text-foreground mb-1">
                            Nota Atribuída (0 a {q.points.toFixed(1)})
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={q.points}
                            value={
                              essayScoreInputs[q.id] !== undefined
                                ? essayScoreInputs[q.id]
                                : activeSubmission.essayScores[q.id] || 0
                            }
                            onChange={(e) =>
                              setEssayScoreInputs({ ...essayScoreInputs, [q.id]: Number(e.target.value) })
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-border bg-background font-mono"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[11px] font-medium text-foreground mb-1">
                            Feedback ao Aluno
                          </label>
                          <input
                            type="text"
                            placeholder="Observações do professor..."
                            value={
                              essayFeedbackInputs[q.id] !== undefined
                                ? essayFeedbackInputs[q.id]
                                : activeSubmission.essayFeedback[q.id] || ''
                            }
                            onChange={(e) =>
                              setEssayFeedbackInputs({ ...essayFeedbackInputs, [q.id]: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
                          />
                        </div>

                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSaveGrade(q.id, q.points)}
                          className="h-7 text-xs mt-4"
                        >
                          Gravar Nota
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Rodapé com Lançamento na Mini-Pauta (UC-02) */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {activeSubmission.isPushedToGradebook ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <Icon name="CheckCheck" className="w-4 h-4 text-emerald-600" />
                Nota Lançada na Mini-Pauta Oficial (Decreto 424/25)
              </span>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onPushToGradebook}
                className="bg-primary text-white gap-1.5 text-xs font-semibold"
              >
                <Icon name="FileCheck" className="w-4 h-4" />
                Lançar Nota na Mini-Pauta da Turma (UC-02)
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar Mesa
            </Button>
          </div>
        </div>
      )}
    </GlobalModal>
  );
}
