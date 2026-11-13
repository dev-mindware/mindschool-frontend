'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlobalModal, Button, ButtonSubmit, FormTextarea, Input, Icon } from '@/components';
import { TeacherAttendanceLog } from '@/types/teacher-attendance';
import { optionalSafeTextSchema, safeTextSchema } from '@/schemas';

const justifyTeacherAbsenceSchema = z.object({
  reason: safeTextSchema(5, 500, 'O motivo da justificação'),
  docName: optionalSafeTextSchema(150, 3, 'O nome do documento'),
});

type JustifyTeacherAbsenceInput = z.input<typeof justifyTeacherAbsenceSchema>;
type JustifyTeacherAbsenceData = z.infer<typeof justifyTeacherAbsenceSchema>;

interface JustifyAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeacher: TeacherAttendanceLog | null;
  onSave: (teacherId: string, reason: string, docName?: string) => void;
}

export function JustifyAbsenceModal({
  isOpen,
  onClose,
  selectedTeacher,
  onSave,
}: JustifyAbsenceModalProps) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<JustifyTeacherAbsenceInput, unknown, JustifyTeacherAbsenceData>({
    resolver: zodResolver(justifyTeacherAbsenceSchema),
    mode: 'onChange',
    defaultValues: { reason: '', docName: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ reason: '', docName: '' });
    }
  }, [isOpen, selectedTeacher, reset]);

  const reason = watch('reason');

  const onSubmit = (data: JustifyTeacherAbsenceData) => {
    if (!selectedTeacher) return;
    onSave(selectedTeacher.teacherId, data.reason, data.docName || undefined);
    reset({ reason: '', docName: '' });
    onClose();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedTeacher ? `Justificar Falta: ${selectedTeacher.teacherName}` : 'Justificar Falta'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-0.5 rounded-xs bg-muted/40 p-3 text-xs">
          <p className="font-medium text-foreground">
            {selectedTeacher?.teacherName} ({selectedTeacher?.teacherCode})
          </p>
          <p className="text-muted-foreground">
            Departamento: {selectedTeacher?.department} • Data: {selectedTeacher?.date}
          </p>
        </div>

        <FormTextarea
          label="Motivo da Justificação *"
          rows={3}
          maxLength={500}
          value={reason}
          error={errors.reason?.message}
          onChange={(v) => setValue('reason', v, { shouldValidate: true, shouldTouch: true })}
          placeholder="Ex: Atestado Médico emitido pelo Hospital Geral de Luanda, comparência em formação oficial do MED..."
        />

        <Input
          label="Nome do Documento / Comprovativo Anexado"
          type="text"
          maxLength={150}
          error={errors.docName?.message}
          placeholder="Ex: atestado-medico-consulta.pdf"
          {...register('docName')}
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} disabled={!selectedTeacher || !isValid || isSubmitting} className="gap-2">
            <Icon name="Check" className="size-4" />
            Gravar Justificação
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
