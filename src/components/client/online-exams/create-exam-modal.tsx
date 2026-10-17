'use client';

import { useMemo, useState } from 'react';
import { FormModal, FormSelect, Input } from '@/components';
import type { TeacherAssignment } from '@/types';
import type { ApiTerm } from '@/services/grades-service';

export const CREATE_EXAM_MODAL_ID = 'exam-create';

interface CreateExamModalProps {
  assignments: TeacherAssignment[];
  terms: ApiTerm[];
  isSaving: boolean;
  onSave: (v: { sectionId: string; assignmentId: string; termId: string; title: string; opensAt: string; closesAt: string; timeLimitMinutes?: number; maxAttempts: number }) => Promise<unknown>;
}

/** `datetime-local` (hora local) -> ISO com fuso. */
const toIso = (local: string) => new Date(local).toISOString();
const localNow = (plusHours = 0) => {
  const d = new Date(Date.now() + plusHours * 3_600_000 - new Date().getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
};

export function CreateExamModal({ assignments, terms, isSaving, onSave }: CreateExamModalProps) {
  const [title, setTitle] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [termId, setTermId] = useState('');
  const [opens, setOpens] = useState(localNow());
  const [closes, setCloses] = useState(localNow(48));
  const [duration, setDuration] = useState('60');
  const [attempts, setAttempts] = useState('1');

  const assignment = useMemo(() => assignments.find((a) => a.id === assignmentId), [assignments, assignmentId]);
  const term = termId || terms[0]?.id || '';

  const submit = async () => {
    if (!assignment || !term || title.trim().length < 3) throw new Error('incomplete');
    await onSave({
      sectionId: assignment.sectionId, assignmentId: assignment.id, termId: term, title: title.trim(),
      opensAt: toIso(opens), closesAt: toIso(closes), timeLimitMinutes: Number(duration) || undefined, maxAttempts: Number(attempts) || 1,
    });
    setTitle('');
  };

  return (
    <FormModal
      id={CREATE_EXAM_MODAL_ID}
      title="Criar nova avaliação digital"
      description="A prova fica ligada à avaliação periódica da disciplina; a nota confirmada entra na mini-pauta."
      submitLabel="Criar e adicionar questões"
      size="lg"
      isLoading={isSaving}
      disabled={!assignment || title.trim().length < 3}
      onSubmit={submit}
    >
      <div className="sm:col-span-2">
        <Input label="Título da avaliação *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: 2.ª Prova Parcial de Matemática" />
      </div>
      <FormSelect label="Disciplina e turma" value={assignmentId} onValueChange={setAssignmentId} options={assignments.map((a) => ({ label: `${a.subjectName} — ${a.sectionName}`, value: a.id }))} />
      <FormSelect label="Período" value={term} onValueChange={setTermId} options={terms.map((t) => ({ label: `${t.sequence}.º Trimestre`, value: t.id }))} />
      <Input label="Abre em" type="datetime-local" value={opens} onChange={(e) => setOpens(e.target.value)} />
      <Input label="Fecha em" type="datetime-local" value={closes} onChange={(e) => setCloses(e.target.value)} />
      <Input label="Duração (minutos)" type="quantity" min={1} max={360} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
      <Input label="Tentativas permitidas" type="quantity" min={1} max={10} step={1} value={attempts} onChange={(e) => setAttempts(e.target.value)} />
    </FormModal>
  );
}
