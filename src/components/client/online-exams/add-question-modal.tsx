'use client';

import React, { useState } from 'react';
import { SelectField, Button, Checkbox, FormTextarea, Icon, Input } from '@/components';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import type { ApiExam, ApiQuestionType, NewQuestion } from '@/services/exams-service';

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

/** Perguntas da prova: lista e adiciona. Depois de publicada ou ligada ao Google Forms as perguntas ficam fixas. */
export function AddQuestionModal({ isOpen, onClose, activeExam, isSaving, onAddQuestion, onRemoveQuestion }: ExamQuestionsModalProps) {
  const [type, setType] = useState<ApiQuestionType>('escolha_multipla_unica');
  const [prompt, setPrompt] = useState('');
  const [points, setPoints] = useState(2);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correct, setCorrect] = useState<string[]>(['a']);
  const [expected, setExpected] = useState('');
  const [truth, setTruth] = useState<'true' | 'false'>('true');

  const locked = !activeExam || activeExam.status !== 'rascunho' || Boolean(activeExam.google_form);
  const multiple = type === 'escolha_multipla_unica' || type === 'escolha_multipla_varias';

  const reset = () => {
    setPrompt('');
    setOptions(['', '', '', '']);
    setCorrect(['a']);
    setExpected('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q: NewQuestion = { question_type: type, prompt: prompt.trim(), max_score: points };
    if (multiple) {
      q.options = options.map((text, i) => ({ id: LETTERS[i]!, text: text.trim() })).filter((o) => o.text);
      q.expected_answer = type === 'escolha_multipla_unica' ? correct[0] : correct.join(',');
    } else if (type === 'verdadeiro_falso') {
      q.expected_answer = truth;
    } else if (type === 'resposta_curta') {
      q.expected_answer = expected.trim();
    }
    await onAddQuestion(q);
    reset();
  };

  const toggleCorrect = (id: string) =>
    setCorrect((cur) => (type === 'escolha_multipla_unica' ? [id] : cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-lg font-bold">{activeExam ? `Questões: ${activeExam.title}` : 'Questões'}</SheetTitle>
          <SheetDescription className="text-xs">Lista e adiciona as perguntas da prova.</SheetDescription>
        </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
      {activeExam && (
        <div className="space-y-5">
          <div className="space-y-2">
            {activeExam.questions.length === 0 && <p className="text-xs text-muted-foreground">Ainda não há questões.</p>}
            {activeExam.questions.map((q) => (
              <div key={q.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
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
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              {activeExam.google_form ? 'A prova está ligada a um Google Form: desligue-o para alterar as questões.' : 'Só é possível alterar as questões enquanto a prova é um rascunho.'}
            </p>
          ) : (
            <form id="add-question-form" onSubmit={submit} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <SelectField
                    label="Tipo de questão"
                    value={type}
                    onValueChange={(v) => { setType(v as ApiQuestionType); setCorrect(['a']); }}
                    options={(Object.keys(TYPE_LABEL) as ApiQuestionType[]).map((t) => ({ label: TYPE_LABEL[t], value: t }))}
                  />
                </div>
                <Input label="Pontos" type="number" value={String(points)} onChange={(e) => setPoints(Number(e.target.value))} />
              </div>
              <FormTextarea label="Enunciado *" value={prompt} onChange={setPrompt} rows={2} />

              {multiple && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Opções (marque a(s) certa(s))</p>
                  {options.map((text, i) => (
                    <div key={LETTERS[i]} className="flex items-center gap-2">
                      <Checkbox checked={correct.includes(LETTERS[i]!)} onCheckedChange={() => toggleCorrect(LETTERS[i]!)} aria-label={`Opção ${LETTERS[i]!.toUpperCase()} correcta`} />
                      <span className="w-5 text-xs font-mono uppercase">{LETTERS[i]}</span>
                      <div className="flex-1"><Input value={text} onChange={(e) => setOptions((cur) => cur.map((o, j) => (j === i ? e.target.value : o)))} placeholder={`Opção ${LETTERS[i]!.toUpperCase()}${i < 2 ? " *" : ""}`} /></div>
                    </div>
                  ))}
                </div>
              )}
              {type === 'verdadeiro_falso' && (
                <SelectField label="Resposta certa" value={truth} onValueChange={(v) => setTruth(v as 'true' | 'false')} options={[{ label: 'Verdadeiro', value: 'true' }, { label: 'Falso', value: 'false' }]} />
              )}
              {type === 'resposta_curta' && (
                <Input label="Resposta esperada (alternativas separadas por |)" value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Ex: Brasília" />
              )}
            </form>
          )}
        </div>
      )}
      </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
          {activeExam && !locked && (
            <Button type="submit" form="add-question-form" disabled={isSaving} className="gap-1.5">
              <Icon name="Plus" className="size-4" />
              Adicionar questão
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
