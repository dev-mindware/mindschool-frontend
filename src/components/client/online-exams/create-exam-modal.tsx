'use client';

import React, { useState } from 'react';
import { GlobalModal, SelectField, Button, Icon } from '@/components';
import { OnlineExam } from '@/types/online-exam';

interface SectionOption {
  id: string;
  name: string;
  classLevel: string;
  shift?: string;
}

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionOption[];
  onSave: (examData: Omit<OnlineExam, 'id' | 'createdAt' | 'questions'>) => void;
}

export function CreateExamModal({
  isOpen,
  onClose,
  sections,
  onSave,
}: CreateExamModalProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Matemática');
  const [newSectionId, setNewSectionId] = useState(sections[0]?.id || 'sec-7a');
  const [newDuration, setNewDuration] = useState(60);
  const [newTerm, setNewTerm] = useState<1 | 2 | 3>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const section = sections.find((s) => s.id === newSectionId);

    onSave({
      title: newTitle,
      subjectId: `sub-${newSubject.toLowerCase().slice(0, 3)}`,
      subjectName: newSubject,
      classId: newSectionId,
      className: section ? `${section.classLevel} - ${section.name}` : '7ª Classe A',
      term: newTerm,
      academicYear: '2025/2026',
      durationMinutes: newDuration,
      totalPoints: 20.0,
      passingPoints: 10.0,
      status: 'DRAFT',
      startDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      createdByTeacherId: 'tch-01',
      createdByTeacherName: 'Docente Responsável',
    });

    setNewTitle('');
    setNewSubject('Matemática');
    setNewSectionId(sections[0]?.id || 'sec-7a');
    setNewDuration(60);
    setNewTerm(1);
    onClose();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Nova Avaliação Digital"
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Título da Avaliação *
          </label>
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex: 2.ª Prova Parcial de Matemática - Geometria Espacial"
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Disciplina"
            value={newSubject}
            onValueChange={(val) => setNewSubject(val)}
            options={[
              { label: 'Matemática', value: 'Matemática' },
              { label: 'Língua Portuguesa', value: 'Língua Portuguesa' },
              { label: 'Física', value: 'Física' },
              { label: 'Química', value: 'Química' },
              { label: 'Biologia', value: 'Biologia' },
              { label: 'História', value: 'História' },
            ]}
          />

          <SelectField
            label="Turma Destinatária"
            value={newSectionId}
            onValueChange={(val) => setNewSectionId(val)}
            options={sections.map((s) => ({
              label: `${s.classLevel} - ${s.name} (${s.shift})`,
              value: s.id,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Duração da Prova (Minutos)
            </label>
            <input
              type="number"
              min={15}
              max={180}
              value={newDuration}
              onChange={(e) => setNewDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <SelectField
            label="Trimestre Escolar"
            value={newTerm.toString()}
            onValueChange={(val) => setNewTerm(Number(val) as 1 | 2 | 3)}
            options={[
              { label: '1.º Trimestre', value: '1' },
              { label: '2.º Trimestre', value: '2' },
              { label: '3.º Trimestre', value: '3' },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Icon name="Check" className="w-4 h-4" />
            Criar & Adicionar Questões
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
