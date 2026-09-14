'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Icon } from '@/components';
import { OfficialDocumentType } from '@/types/certificate';
import { Student } from '@/types';

interface IssueDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onIssue: (docData: {
    documentType: OfficialDocumentType;
    student: Student;
    purpose: string;
    notes?: string;
    issuerRole: string;
  }) => void;
}

export function IssueDocumentModal({
  isOpen,
  onClose,
  students,
  onIssue,
}: IssueDocumentModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [documentType, setDocumentType] = useState<OfficialDocumentType>('DECLARATION_ENROLLMENT');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [issuerRole, setIssuerRole] = useState('Secretaria Geral');

  useEffect(() => {
    if (isOpen) {
      setSelectedStudentId(students[0]?.id || '');
      setDocumentType('DECLARATION_ENROLLMENT');
      setPurpose('Para efeitos de Abono de Família junto do Instituto Nacional de Segurança Social (INSS)');
      setNotes('');
      setIssuerRole('Secretaria Geral');
    }
  }, [isOpen, students]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s: Student) => s.id === selectedStudentId);
    if (!student || !purpose.trim()) return;

    onIssue({
      documentType,
      student,
      purpose,
      notes: notes || undefined,
      issuerRole,
    });
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Emitir Certificado ou Declaração Oficial"
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Selecionar Aluno *</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            {students.map((s: Student) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.studentNumber}) - {s.currentSectionName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Tipo de Documento Oficial</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as OfficialDocumentType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="DECLARATION_ENROLLMENT">Declaração de Frequência (Sem Notas)</option>
              <option value="DECLARATION_WITH_GRADES">Declaração com Notas do Ano Lectivo</option>
              <option value="HABILITATION_CERTIFICATE">Certificado de Habilitações Literárias</option>
              <option value="TRANSFER_GUIDE">Guia de Transferência Escolar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Serviço Emissor
            </label>
            <input
              type="text"
              value={issuerRole}
              onChange={(e) => setIssuerRole(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Finalidade / Efeito do Documento *
          </label>
          <input
            type="text"
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Ex: Para efeitos de Abono de Família, Emissão de Passaporte, Matrícula Superior..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Observações Adicionais (Opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações complementares a figurar no registo do arquivo..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Icon name="FileCheck" className="w-4 h-4" />
            Gerar Documento Oficial
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
