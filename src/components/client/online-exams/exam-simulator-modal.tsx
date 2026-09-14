'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Badge, Icon } from '@/components';
import { OnlineExam } from '@/types/online-exam';

interface ExamSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: OnlineExam | null;
  onSubmitSimulation: (examId: string, answers: Record<string, string>) => void;
}

export function ExamSimulatorModal({
  isOpen,
  onClose,
  activeExam,
  onSubmitSimulation,
}: ExamSimulatorModalProps) {
  const [simulatorAnswers, setSimulatorAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSimulatorAnswers({});
      setCurrentQuestionIndex(0);
    }
  }, [isOpen, activeExam]);

  const handleFinish = () => {
    if (!activeExam) return;
    onSubmitSimulation(activeExam.id, simulatorAnswers);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeExam ? `Exame do Aluno: ${activeExam.title}` : 'Simulador de Exame'}
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
    >
      {activeExam && activeExam.questions.length > 0 && (
        <div className="space-y-6">
          {/* Barra de Status do Exame */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Icon name="Clock" className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Tempo Restante: <strong className="font-mono text-emerald-400">00:44:12</strong></span>
            </div>
            <div className="font-mono text-slate-300">
              Questão {currentQuestionIndex + 1} de {activeExam.questions.length}
            </div>
            <div className="text-[11px] text-slate-400">
              Auto-salvo localmente ✅
            </div>
          </div>

          {/* Pergunta Corrente */}
          {(() => {
            const q = activeExam.questions[currentQuestionIndex];
            if (!q) return null;

            return (
              <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-sm text-foreground">
                    Questão {currentQuestionIndex + 1} ({q.points.toFixed(1)} valores)
                  </span>
                  <Badge variant="outline">{q.type}</Badge>
                </div>

                <p className="text-sm font-medium text-foreground leading-relaxed">{q.prompt}</p>

                {/* Resposta de Escolha Múltipla */}
                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          simulatorAnswers[q.id] === opt.id
                            ? 'border-primary bg-primary/5 font-semibold text-primary'
                            : 'border-border hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`sim-${q.id}`}
                          checked={simulatorAnswers[q.id] === opt.id}
                          onChange={() => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: opt.id })}
                          className="text-primary"
                        />
                        <span className="font-mono">{opt.label})</span>
                        <span className="text-sm">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Resposta V/F */}
                {q.type === 'TRUE_FALSE' && (
                  <div className="flex gap-4 pt-2">
                    {['TRUE', 'FALSE'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: val })}
                        className={`flex-1 py-3 px-4 rounded-lg border font-semibold text-sm transition-colors ${
                          simulatorAnswers[q.id] === val
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-background hover:bg-muted text-foreground'
                        }`}
                      >
                        {val === 'TRUE' ? 'Verdadeiro (V)' : 'Falso (F)'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Resposta Curta */}
                {q.type === 'SHORT_ANSWER' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      placeholder="Digite a sua resposta..."
                      value={simulatorAnswers[q.id] || ''}
                      onChange={(e) => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono"
                    />
                  </div>
                )}

                {/* Resposta Dissertativa */}
                {q.type === 'ESSAY' && (
                  <div className="pt-2">
                    <textarea
                      rows={5}
                      placeholder="Escreva aqui o seu desenvolvimento completo..."
                      value={simulatorAnswers[q.id] || ''}
                      onChange={(e) => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* Navegação entre Questões */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            >
              Anterior
            </Button>

            <div className="flex gap-1">
              {activeExam.questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-md text-xs font-mono font-semibold transition-colors ${
                    idx === currentQuestionIndex
                      ? 'bg-primary text-white'
                      : simulatorAnswers[activeExam.questions[idx].id]
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < activeExam.questions.length - 1 ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setCurrentQuestionIndex((i) => Math.min(activeExam.questions.length - 1, i + 1))}
              >
                Seguinte
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleFinish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <Icon name="CircleCheck" className="w-4 h-4" />
                Finalizar & Submeter
              </Button>
            )}
          </div>
        </div>
      )}
    </GlobalModal>
  );
}
