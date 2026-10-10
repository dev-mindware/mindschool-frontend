'use client';

import { useState } from 'react';
import { StudentSelect } from "@/components/shared/filters/student-select";
import { FormModal, FormSelect, FormTextarea, Input } from '@/components';
import { OfficialDocumentType } from '@/types/certificate';
import { Student } from '@/types';

export const ISSUE_DOCUMENT_MODAL_ID = 'certificate-issue';

interface IssueDocumentModalProps {
  students: Student[];
  onIssue: (docData: {
    documentType: OfficialDocumentType;
    student: Student;
    purpose: string;
    notes?: string;
    issuerRole: string;
  }) => Promise<void>;
}

const TYPES = [
  { value: 'CONDUCT_CERTIFICATE', label: 'Certificado de Conduta' },
  { value: 'DECLARATION_ENROLLMENT', label: 'Declaração de Frequência (sem notas)' },
  { value: 'DECLARATION_WITH_GRADES', label: 'Declaração com Notas do Ano Lectivo' },
  { value: 'HABILITATION_CERTIFICATE', label: 'Certificado de Habilitações Literárias' },
  { value: 'TRANSFER_GUIDE', label: 'Guia de Transferência Escolar' },
];

export function IssueDocumentModal({ students, onIssue }: IssueDocumentModalProps) {
  const [studentId, setStudentId] = useState('');
  const [documentType, setDocumentType] = useState<OfficialDocumentType>('DECLARATION_ENROLLMENT');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [issuerRole, setIssuerRole] = useState('Secretaria Geral');

  const submit = async () => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !purpose.trim()) throw new Error('incomplete');
    await onIssue({ documentType, student, purpose: purpose.trim(), notes: notes.trim() || undefined, issuerRole });
    setPurpose('');
    setNotes('');
  };

  return (
    <FormModal
      id={ISSUE_DOCUMENT_MODAL_ID}
      title="Emitir certificado ou declaração oficial"
      description="O documento é numerado, recebe código de verificação (QR) e abre em PDF."
      submitLabel="Gerar documento"
      size="lg"
      disabled={!studentId || !purpose.trim()}
      onSubmit={submit}
    >
      <div className="sm:col-span-2">
        <StudentSelect label="Aluno *" students={students} value={studentId} onChange={setStudentId} />
      </div>
      <FormSelect label="Tipo de documento" value={documentType} onValueChange={(v) => setDocumentType(v as OfficialDocumentType)} options={TYPES} />
      <Input label="Serviço emissor" value={issuerRole} onChange={(e) => setIssuerRole(e.target.value)} />
      <div className="sm:col-span-2">
        <Input label="Finalidade / efeito do documento *" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ex: Abono de família, passaporte, matrícula no ensino superior" />
      </div>
      <div className="sm:col-span-2">
        <FormTextarea label="Observações (opcional)" value={notes} onChange={setNotes} rows={2} />
      </div>
    </FormModal>
  );
}
