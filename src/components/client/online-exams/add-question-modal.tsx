'use client';

import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import { SelectField, Button, ButtonSubmit, Checkbox, FormTextarea, Icon, Input, Label } from '@/components';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import type { ApiExam, ApiQuestionType, NewQuestion } from '@/services/exams-service';
import { optionalSafeTextSchema, quantitySchema, safeTextSchema } from '@/schemas';

interface ExamQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ApiExam | null;
  isSaving: boolean;
  onAddQuestion: (q: NewQuestion) => Promise<unknown>;
  onRemoveQuestion: (questionId: string) => void;
}

const TYPE_LABEL: Record<ApiQuestionType, string> = {
  escolha_multipla_unica: 'Escolha múltipla (uma resposta)',
  escolha_multipla_varias: 'Escolha múltipla (várias respostas)',
  verdadeiro_falso: 'Verdadeiro / Falso',
  resposta_curta: 'Resposta curta',
  dissertativa: 'Dissertativa (correcção manual)',
};
const LETTERS = ['a', 'b', 'c', 'd'];

const addQuestionSchema = z
  .object({
    type: z.enum(['escolha_multipla_unica', 'escolha_multipla_varias', 'verdadeiro_falso', 'resposta_curta', 'dissertativa']),
    points: quantitySchema(1, 20, 'A pontuação'),
    prompt: safeTextSchema(5, 2000, 'O enunciado'),
    options: z.array(optionalSafeTextSchema(300, 1, 'A opção')),
    correct: z.array(z.string()),
    expected: z.string(),
    truth: z.enum(['true', 'false']),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'escolha_multipla_unica' || data.type === 'escolha_multipla_varias') {
      const filledIds = data.options
        .map((opt, idx) => (opt && opt.length > 0 ? LETTERS[idx]! : null))
        .filter((id): id is string => id !== null);
      if (filledIds.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: 'Preencha pelo menos 2 opções de resposta.',
        });
      }
      const validCorrect = data.correct.filter((c) => filledIds.includes(c));
      if (validCorrect.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correct'],
          message: 'Marque pelo menos uma opção preenchida como certa.',
        });
      }
    }
    if (data.type === 'resposta_curta') {
      const expCheck = safeTextSchema(1, 300, 'A resposta esperada').safeParse(data.expected);
      if (!expCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expected'],
          message: expCheck.error.issues[0]?.message ?? 'A resposta esperada é obrigatória.',
        });
      }
    }
  });

/** Perguntas da prova: lista e adiciona. Depois de publicada ou ligada ao Google Forms as perguntas ficam fixas. */
export function AddQuestionModal({ isOpen, onClose, activeExam, isSaving, onAddQuestion, onRemoveQuestion }: ExamQuestionsModalProps) {
  const [type, setType] = useState<ApiQuestionType>('escolha_multipla_unica');
  const [prompt, setPrompt] = useState('');
  const [points, setPoints] = useState('2');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correct, setCorrect] = useState<string[]>(['a']);
  const [expected, setExpected] = useState('');
  const [truth, setTruth] = useState<'true' | 'false'>('true');
  const [touched, setTouched] = useState({
    points: false,
    prompt: false,
    options: false,
    expected: false,
  });

  const locked = !activeExam || activeExam.status !== 'rascunho' || Boolean(activeExam.google_form);
  const multiple = type === 'escolha_multipla_unica' || type === 'escolha_multipla_varias';

  const parsed = useMemo(
    () =>
      addQuestionSchema.safeParse({
        type,
        points,
        prompt,
        options,
        correct,
        expected,
        truth,
      }),
    [type, points, prompt, options, correct, expected, truth]
  );

  const issueFor = (pathHead: string) => {
    if (parsed.success) return undefined;
    return parsed.error.issues.find((i) => i.path[0] === pathHead)?.message;
  };
  const optionIssue = (idx: number) => {
    if (parsed.success) return undefined;
    return parsed.error.issues.find((i) => i.path[0] === 'options' && i.path[1] === idx)?.message;
  };

  const reset = () => {
    setPrompt('');
    setPoints('2');
    setOptions(['', '', '', '']);
    setCorrect(['a']);
    setExpected('');
    setTouched({ points: false, prompt: false, options: false, expected: false });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ points: true, prompt: true, options: true, expected: true });
    if (!parsed.success) return;

    const q: NewQuestion = {
      question_type: parsed.data.type,
      prompt: parsed.data.prompt,
      max_score: parsed.data.points,
    };
    if (multiple) {
      q.options = options.map((text, i) => ({ id: LETTERS[i]!, text: text.trim() })).filter((o) => o.text);
      const filledIds = new Set(q.options.map((o) => o.id));
      const validCorrect = correct.filter((c) => filledIds.has(c));
      q.expected_answer = type === 'escolha_multipla_unica' ? validCorrect[0] : validCorrect.join(',');
    } else if (type === 'verdadeiro_falso') {
      q.expected_answer = truth;
    } else if (type === 'resposta_curta') {
      q.expected_answer = expected.trim();
    }
    await onAddQuestion(q);
    reset();
  };

  const toggleCorrect = (id: string) => {
    setTouched((t) => ({ ...t, options: true }));
    setCorrect((cur) => (type === 'escolha_multipla_unica' ? [id] : cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const pointsError = touched.points ? issueFor('points') : undefined;
  const promptError = touched.prompt ? issueFor('prompt') : undefined;
  const optionsGroupError = touched.options ? (issueFor('options') || issueFor('correct')) : undefined;
  const expectedError = touched.expected ? issueFor('expected') : undefined;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{activeExam ? `Questões: ${activeExam.title}` : 'Questões'}</SheetTitle>
          <SheetDescription>Lista e adiciona as perguntas da prova.</SheetDescription>
        </SheetHeader>

        {activeExam && (
          <div className="space-y-5">
            <div className="space-y-2">
              {activeExam.questions.length === 0 && <p className="text-xs text-muted-foreground">Ainda não há questões.</p>}
              {activeExam.questions.map((q) => (
                <div key={q.id} className="flex items-start justify-between gap-3 rounded-xs border border-border p-3">
                  <div className="text-xs">
                    <p className="font-medium text-foreground">{q.order_index}. {q.prompt}</p>
                    <p className="text-muted-foreground mt-0.5">
                      {TYPE_LABEL[q.question_type]} • {q.max_score} pts
                      {q.options ? ` • ${q.options.map((o) => `${o.id.toUpperCase()}) ${o.text}`).join('  ')}` : ''}
                      {q.expected_answer ? ` • certa: ${q.expected_answer}` : ''}
                    </p>
                  </div>
                  {!locked && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-rose-600" onClick={() => onRemoveQuestion(q.id)}>
                      <Icon name="Trash2" className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {locked ? (
              <p className="rounded-xs border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                {activeExam.google_form ? 'A prova está ligada a um Google Form: desligue-o para alterar as questões.' : 'Só é possível alterar as questões enquanto a prova é um rascunho.'}
              </p>
            ) : (
              <form id="add-question-form" onSubmit={submit} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <SelectField
                      label="Tipo de questão"
                      value={type}
                      onValueChange={(v) => {
                        setType(v as ApiQuestionType);
                        setCorrect(['a']);
                        setTouched((t) => ({ ...t, options: false, expected: false }));
                      }}
                      options={(Object.keys(TYPE_LABEL) as ApiQuestionType[]).map((t) => ({ label: TYPE_LABEL[t], value: t }))}
                    />
                  </div>
                  <Input
                    label="Pontos *"
                    type="quantity"
                    min={1}
                    max={20}
                    step={1}
                    placeholder="Ex.: 2"
                    value={points}
                    error={pointsError}
                    onChange={(e) => {
                      setPoints(e.target.value);
                      setTouched((t) => ({ ...t, points: true }));
                    }}
                  />
                </div>
                <FormTextarea
                  label="Enunciado *"
                  placeholder="Escreva o enunciado completo da pergunta..."
                  value={prompt}
                  maxLength={2000}
                  error={promptError}
                  onChange={(v) => {
                    setPrompt(v);
                    setTouched((t) => ({ ...t, prompt: true }));
                  }}
                  rows={2}
                />

                {multiple && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Opções (marque a(s) certa(s))</Label>
                    {options.map((text, i) => (
                      <div key={LETTERS[i]} className="flex items-center gap-2">
                        <Checkbox checked={correct.includes(LETTERS[i]!)} onCheckedChange={() => toggleCorrect(LETTERS[i]!)} aria-label={`Opção ${LETTERS[i]!.toUpperCase()} correcta`} />
                        <span className="w-5 text-xs font-mono uppercase">{LETTERS[i]}</span>
                        <div className="flex-1">
                          <Input
                            value={text}
                            maxLength={300}
                            error={touched.options ? optionIssue(i) : undefined}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOptions((cur) => cur.map((o, j) => (j === i ? val : o)));
                              setTouched((t) => ({ ...t, options: true }));
                            }}
                            placeholder={`Opção ${LETTERS[i]!.toUpperCase()}${i < 2 ? ' *' : ''}`}
                          />
                        </div>
                      </div>
                    ))}
                    {optionsGroupError && <p role="alert" className="text-xs text-destructive">{optionsGroupError}</p>}
                  </div>
                )}
                {type === 'verdadeiro_falso' && (
                  <SelectField label="Resposta certa" value={truth} onValueChange={(v) => setTruth(v as 'true' | 'false')} options={[{ label: 'Verdadeiro', value: 'true' }, { label: 'Falso', value: 'false' }]} />
                )}
                {type === 'resposta_curta' && (
                  <Input
                    label="Resposta esperada (alternativas separadas por |) *"
                    value={expected}
                    maxLength={300}
                    error={expectedError}
                    onChange={(e) => {
                      setExpected(e.target.value);
                      setTouched((t) => ({ ...t, expected: true }));
                    }}
                    placeholder="Ex: Brasília"
                  />
                )}
              </form>
            )}
          </div>
        )}

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
          {activeExam && !locked && (
            <ButtonSubmit form="add-question-form" isLoading={isSaving} disabled={!parsed.success || isSaving}>
              <Icon name="Plus" className="size-4" />
              Adicionar questão
            </ButtonSubmit>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
