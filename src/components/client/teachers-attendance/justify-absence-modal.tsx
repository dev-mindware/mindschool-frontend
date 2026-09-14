'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Icon } from '@/components';
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
      className="!w-[95vw] sm:!max-w-lg lg:!max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-0.5">
          <p className="font-medium text-foreground">
            {selectedTeacher?.teacherName} ({selectedTeacher?.teacherCode})
          </p>
          <p className="text-muted-foreground">
            Departamento: {selectedTeacher?.department} • Data: {selectedTeacher?.date}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Motivo da Justificação *
          </label>
          <textarea
            required
            rows={3}
            value={justifyReason}
            onChange={(e) => setJustifyReason(e.target.value)}
            placeholder="Ex: Atestado Médico emitido pelo Hospital Geral de Luanda, comparência em formação oficial do MED..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Nome do Documento / Comprovativo Anexado
          </label>
          <input
            type="text"
            value={justifyDocName}
            onChange={(e) => setJustifyDocName(e.target.value)}
            placeholder="Ex: atestado-medico-consulta.pdf"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Icon name="Check" className="w-4 h-4" />
            Gravar Justificação
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
