'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, ButtonSubmit, FormTextarea, Input, Icon } from '@/components';
import { TeacherAttendanceLog } from '@/types/teacher-attendance';

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
  const [justifyReason, setJustifyReason] = useState('');
  const [justifyDocName, setJustifyDocName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJustifyReason('');
      setJustifyDocName('');
    }
  }, [isOpen, selectedTeacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !justifyReason.trim()) return;

    onSave(selectedTeacher.teacherId, justifyReason, justifyDocName);
    onClose();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedTeacher ? `Justificar Falta: ${selectedTeacher.teacherName}` : 'Justificar Falta'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          value={justifyReason}
          onChange={setJustifyReason}
          placeholder="Ex: Atestado Médico emitido pelo Hospital Geral de Luanda, comparência em formação oficial do MED..."
        />

        <Input
          label="Nome do Documento / Comprovativo Anexado"
          type="text"
          value={justifyDocName}
          onChange={(e) => setJustifyDocName(e.target.value)}
          placeholder="Ex: atestado-medico-consulta.pdf"
        />

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={false} disabled={!justifyReason.trim()} className="gap-2">
            <Icon name="Check" className="size-4" />
            Gravar Justificação
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
