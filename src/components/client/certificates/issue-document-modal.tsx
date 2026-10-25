'use client';

import { useState } from 'react';
import { StudentSelect } from "@/components/shared/filters/student-select";
import { FormModal, FormSelect, Input } from '@/components';
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
    checkedByName?: string;
    registryBook?: string;
    registrySheet?: string;
  }) => Promise<void>;
}

const TYPES = [
  { value: 'CONDUCT_CERTIFICATE', label: 'Certificado de Conduta' },
  { value: 'DECLARATION_ENROLLMENT', label: 'Declaração de Frequência (sem notas)' },
  { value: 'DECLARATION_WITH_GRADES', label: 'Declaração com Notas do Ano Letivo (Boletim)' },
  { value: 'HABILITATION_CERTIFICATE', label: 'Certificado de Habilitações Literárias' },
  { value: 'TRANSFER_GUIDE', label: 'Guia de Transferência Escolar' },
];

export function IssueDocumentModal({ students, onIssue }: IssueDocumentModalProps) {
  const [studentId, setStudentId] = useState('');
  const [documentType, setDocumentType] = useState<OfficialDocumentType>('DECLARATION_ENROLLMENT');
  const [purpose, setPurpose] = useState('');
  const [checkedByName, setCheckedByName] = useState('');
  const [registryBook, setRegistryBook] = useState('');
  const [registrySheet, setRegistrySheet] = useState('');

  const isCert = documentType === 'HABILITATION_CERTIFICATE';

  const submit = async () => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !purpose.trim()) throw new Error('incomplete');
    if (isCert && !checkedByName.trim()) throw new Error('O nome do responsável pela conferência é obrigatório.');
    await onIssue({
      documentType,
      student,
      purpose: purpose.trim(),
      issuerRole: 'Secretaria Geral', // a API regista o utilizador que emite; este texto não é enviado
      checkedByName: isCert ? checkedByName.trim() : undefined,
      registryBook: isCert && registryBook.trim() ? registryBook.trim() : undefined,
      registrySheet: isCert && registrySheet.trim() ? registrySheet.trim() : undefined,
    });
    setPurpose('');
    setCheckedByName('');
  };

  return (
    <FormModal
      id={ISSUE_DOCUMENT_MODAL_ID}
      title="Emitir certificado ou declaração oficial"
      description="Ao gerar, o documento recebe o próximo número da série (não se reutiliza nem se edita), fica registado em seu nome e abre em PDF com um código QR que qualquer pessoa pode verificar."
      submitLabel="Gerar documento"
      size="lg"
      disabled={!studentId || !purpose.trim() || (isCert && !checkedByName.trim())}
      onSubmit={submit}
    >
      <div className="sm:col-span-2">
        <StudentSelect label="Aluno *" students={students} value={studentId} onChange={setStudentId} />
      </div>
      <FormSelect label="Tipo de documento" value={documentType} onValueChange={(v) => setDocumentType(v as OfficialDocumentType)} options={TYPES} />
      {documentType === 'DECLARATION_WITH_GRADES' && (
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Usa as notas do último período do ano letivo e só se emite se a pauta desse período estiver fechada pela Direção; caso contrário o sistema recusa e diz porquê.
        </p>
      )}
      {isCert && (
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          O certificado de habilitações exige o nome de quem conferiu os dados. O livro e a folha de registo aparecem no rodapé.
        </p>
      )}

      {isCert && (
        <>
          <div className="sm:col-span-2">
            <Input
              label="Conferido por (responsável pela Coordenação) *"
              value={checkedByName}
              onChange={(e) => setCheckedByName(e.target.value)}
              placeholder="Ex: Edson Jorge Sousa Viegas"
            />
          </div>
          <div>
            <Input
              label="Livro de registo n.º (opcional, vai no rodapé)"
              value={registryBook}
              onChange={(e) => setRegistryBook(e.target.value)}
              placeholder="Ex: 12"
            />
          </div>
          <div>
            <Input
              label="Folha n.º (opcional)"
              value={registrySheet}
              onChange={(e) => setRegistrySheet(e.target.value)}
              placeholder="Ex: 0324"
            />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <Input label="Finalidade / efeito do documento *" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ex: Abono de família, passaporte, matrícula no ensino superior" />
      </div>
    </FormModal>
  );
}
