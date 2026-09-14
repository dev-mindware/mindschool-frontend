'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, SelectField, Button, Icon } from '@/components';
import { OnlineExam, ExamQuestion, QuestionType } from '@/types/online-exam';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: OnlineExam | null;
  onSaveQuestion: (examId: string, question: Omit<ExamQuestion, 'id'>) => void;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  activeExam,
  onSaveQuestion,
}: AddQuestionModalProps) {
  const [qType, setQType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [qPrompt, setQPrompt] = useState('');
  const [qPoints, setQPoints] = useState(5.0);
  const [qCorrectAnswer, setQCorrectAnswer] = useState('opt-a');
  const [qRubric, setQRubric] = useState('');
  const [qOptions, setQOptions] = useState([
    { id: 'opt-a', label: 'A', text: '' },
    { id: 'opt-b', label: 'B', text: '' },
    { id: 'opt-c', label: 'C', text: '' },
    { id: 'opt-d', label: 'D', text: '' },
  ]);

  useEffect(() => {
    if (isOpen) {
      setQPrompt('');
      setQPoints(5.0);
      setQType('MULTIPLE_CHOICE');
      setQCorrectAnswer('opt-a');
      setQRubric('');
      setQOptions([
        { id: 'opt-a', label: 'A', text: '' },
        { id: 'opt-b', label: 'B', text: '' },
        { id: 'opt-c', label: 'C', text: '' },
        { id: 'opt-d', label: 'D', text: '' },
      ]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam || !qPrompt.trim()) return;

    onSaveQuestion(activeExam.id, {
      type: qType,
      prompt: qPrompt,
      points: Number(qPoints),
      options: qType === 'MULTIPLE_CHOICE' ? qOptions : undefined,
      correctAnswer:
        qType === 'MULTIPLE_CHOICE' || qType === 'TRUE_FALSE' || qType === 'SHORT_ANSWER'
          ? qCorrectAnswer
          : undefined,
      rubricCriteria: qType === 'ESSAY' ? qRubric : undefined,
    });

    onClose();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={activeExam ? `Adicionar Questão: ${activeExam.title}` : 'Adicionar Questão'}
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Tipo de Questão"
            value={qType}
            onValueChange={(val) => setQType(val as QuestionType)}
            options={[
              { label: 'Escolha Múltipla (A, B, C, D)', value: 'MULTIPLE_CHOICE' },
              { label: 'Verdadeiro ou Falso (V/F)', value: 'TRUE_FALSE' },
              { label: 'Resposta Curta (Texto/Número)', value: 'SHORT_ANSWER' },
              { label: 'Dissertativa / Desenvolvimento', value: 'ESSAY' },
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Pontuação da Questão (Valores no Decreto 424/25)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              value={qPoints}
              onChange={(e) => setQPoints(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Enunciado / Pergunta *
          </label>
          <textarea
            required
            rows={3}
            value={qPrompt}
            onChange={(e) => setQPrompt(e.target.value)}
            placeholder="Digite a pergunta ou problema a ser resolvido pelo aluno..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Configuração de Escolha Múltipla */}
        {qType === 'MULTIPLE_CHOICE' && (
          <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
            <span className="text-xs font-semibold text-foreground">Opções de Resposta & Chave Correcta:</span>
            <div className="space-y-2">
              {qOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                    {opt.label}
                  </span>
                  <input
                    type="text"
                    placeholder={`Texto da opção ${opt.label}...`}
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...qOptions];
                      updated[idx].text = e.target.value;
                      setQOptions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background"
                  />
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="correctOpt"
                      checked={qCorrectAnswer === opt.id}
                      onChange={() => setQCorrectAnswer(opt.id)}
                    />
                    <span className={qCorrectAnswer === opt.id ? 'font-semibold text-emerald-600' : 'text-muted-foreground'}>
                      Correcta
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuração de V/F */}
        {qType === 'TRUE_FALSE' && (
          <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-2">
            <span className="text-xs font-semibold text-foreground">Gabarito da Questão:</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="tfCorrect"
                  checked={qCorrectAnswer === 'TRUE'}
                  onChange={() => setQCorrectAnswer('TRUE')}
                />
                Verdadeiro (V)
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="tfCorrect"
                  checked={qCorrectAnswer === 'FALSE'}
                  onChange={() => setQCorrectAnswer('FALSE')}
                />
                Falso (F)
              </label>
            </div>
          </div>
        )}

        {/* Configuração de Resposta Curta */}
        {qType === 'SHORT_ANSWER' && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Resposta Exacta Esperada (Correcção Automática) *
            </label>
            <input
              type="text"
              required
              value={qCorrectAnswer}
              onChange={(e) => setQCorrectAnswer(e.target.value)}
              placeholder="Ex: 7 ou segundo ou Luanda"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono"
            />
          </div>
        )}

        {/* Configuração de Dissertativa */}
        {qType === 'ESSAY' && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Critérios de Avaliação e Rubrica (Para Orientar a Correcção do Docente)
            </label>
            <textarea
              rows={2}
              value={qRubric}
              onChange={(e) => setQRubric(e.target.value)}
              placeholder="Ex: Coerência argumentativa (2 val), domínio da gramática (2 val), fundamentação (2 val)..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Icon name="Plus" className="w-4 h-4" />
            Guardar Pergunta na Prova
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
