'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal, FormSelect, Input } from '@/components';
import type { TeacherAssignment } from '@/types';
import type { ApiTerm } from '@/services/grades-service';
import { quantitySchema, safeTextSchema } from '@/schemas';

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

const createExamSchema = z
  .object({
    title: safeTextSchema(3, 150, 'O título da avaliação'),
    assignmentId: z.string().trim().min(1, 'Seleccione a disciplina e turma.'),
    termId: z.string().trim().min(1, 'Seleccione o período.'),
    opens: z
      .string({ error: 'A data de abertura é obrigatória.' })
      .trim()
      .min(1, 'A data de abertura é obrigatória.')
      .refine((v) => Number.isFinite(new Date(v).getTime()), 'Data e hora de abertura inválidas.'),
    closes: z
      .string({ error: 'A data de fecho é obrigatória.' })
      .trim()
      .min(1, 'A data de fecho é obrigatória.')
      .refine((v) => Number.isFinite(new Date(v).getTime()), 'Data e hora de fecho inválidas.'),
    duration: z.union([z.literal(''), quantitySchema(1, 360, 'A duração (minutos)')]).optional(),
    attempts: quantitySchema(1, 10, 'O número de tentativas'),
  })
  .refine((d) => new Date(d.closes).getTime() > new Date(d.opens).getTime(), {
    message: 'A data de fecho deve ser posterior à data de abertura.',
    path: ['closes'],
  });

type CreateExamInput = z.input<typeof createExamSchema>;
type CreateExamData = z.infer<typeof createExamSchema>;

export function CreateExamModal({ assignments, terms, isSaving, onSave }: CreateExamModalProps) {
  const defaultTermId = terms[0]?.id ?? '';
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateExamInput, unknown, CreateExamData>({
    resolver: zodResolver(createExamSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      assignmentId: '',
      termId: defaultTermId,
      opens: localNow(),
      closes: localNow(48),
      duration: 60,
      attempts: 1,
    },
  });

  const assignmentId = watch('assignmentId');
  const termId = watch('termId');
  const duration = watch('duration');
  const attempts = watch('attempts');

  useEffect(() => {
    if (!termId && defaultTermId) {
      setValue('termId', defaultTermId, { shouldValidate: true });
    }
  }, [termId, defaultTermId, setValue]);

  const resetDefaults = () =>
    reset({
      title: '',
      assignmentId: '',
      termId: terms[0]?.id ?? '',
      opens: localNow(),
      closes: localNow(48),
      duration: 60,
      attempts: 1,
    });

  const onSubmit = async (data: CreateExamData) => {
    const assignment = assignments.find((a) => a.id === data.assignmentId);
    if (!assignment) throw new Error('incomplete');
    await onSave({
      sectionId: assignment.sectionId,
      assignmentId: assignment.id,
      termId: data.termId,
      title: data.title,
      opensAt: toIso(data.opens),
      closesAt: toIso(data.closes),
      timeLimitMinutes: typeof data.duration === 'number' ? data.duration : undefined,
      maxAttempts: data.attempts,
    });
    resetDefaults();
  };

  return (
    <FormModal
      id={CREATE_EXAM_MODAL_ID}
      title="Criar nova avaliação digital"
      description="A prova fica ligada à avaliação periódica da disciplina; a nota confirmada entra na mini-pauta."
      submitLabel="Criar e adicionar questões"
      size="lg"
      isLoading={isSaving}
      disabled={!isValid || isSaving}
      onClose={resetDefaults}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="sm:col-span-2">
        <Input
          label="Título da avaliação *"
          maxLength={150}
          placeholder="Ex: 2.ª Prova Parcial de Matemática"
          error={errors.title?.message}
          {...register('title')}
        />
      </div>
      <FormSelect
        label="Disciplina e turma *"
        value={assignmentId}
        onValueChange={(v) => setValue('assignmentId', v, { shouldValidate: true, shouldTouch: true })}
        options={assignments.map((a) => ({ label: `${a.subjectName} — ${a.sectionName}`, value: a.id }))}
        error={errors.assignmentId?.message}
      />
      <FormSelect
        label="Período *"
        value={termId}
        onValueChange={(v) => setValue('termId', v, { shouldValidate: true, shouldTouch: true })}
        options={terms.map((t) => ({ label: `${t.sequence}.º Trimestre`, value: t.id }))}
        error={errors.termId?.message}
      />
      <Input
        label="Abre em *"
        type="datetime-local"
        error={errors.opens?.message}
        {...register('opens', {
          onChange: () => {
            void setValue('closes', watch('closes'), { shouldValidate: true });
          },
        })}
      />
      <Input
        label="Fecha em *"
        type="datetime-local"
        error={errors.closes?.message}
        {...register('closes')}
      />
      <Input
        label="Duração (minutos)"
        type="quantity"
        min={1}
        max={360}
        step={5}
        placeholder="Ex.: 90"
        value={duration === undefined || duration === null ? '' : String(duration)}
        error={errors.duration?.message}
        onChange={(e) => setValue('duration', e.target.value, { shouldValidate: true, shouldTouch: true })}
      />
      <Input
        label="Tentativas permitidas *"
        type="quantity"
        min={1}
        max={10}
        step={1}
        placeholder="Ex.: 1"
        value={attempts === undefined || attempts === null ? '' : String(attempts)}
        error={errors.attempts?.message}
        onChange={(e) => setValue('attempts', e.target.value, { shouldValidate: true, shouldTouch: true })}
      />
    </FormModal>
  );
}
