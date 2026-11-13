'use client';

import { useMemo, useState } from 'react';
import { StudentSelect } from "@/components/shared/filters/student-select";
import { FormModal, FormSelect, Input } from '@/components';
import { OfficialDocumentType } from '@/types/certificate';
import { Student } from '@/types';
import { issueDocumentSchema } from '@/schemas';

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (k: string) => setTouched((p) => (p[k] ? p : { ...p, [k]: true }));

  const isCert = documentType === 'HABILITATION_CERTIFICATE';

  const validation = useMemo(
    () =>
      issueDocumentSchema.safeParse({
        studentId,
        documentType,
        purpose,
        checkedByName: isCert ? checkedByName : undefined,
        registryBook: isCert ? registryBook : undefined,
        registrySheet: isCert ? registrySheet : undefined,
      }),
    [studentId, documentType, purpose, isCert, checkedByName, registryBook, registrySheet]
  );

  const fieldErrors = useMemo(() => {
    const map: Record<string, string> = {};
    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const key = String(issue.path[0] ?? '');
        if (key && !map[key]) map[key] = issue.message;
      }
    }
    return map;
  }, [validation]);

  const showErr = (k: string, val: string) => (touched[k] || val.length > 0 ? fieldErrors[k] : undefined);

  const submit = async () => {
    setTouched({ studentId: true, purpose: true, checkedByName: true, registryBook: true, registrySheet: true });
    const student = students.find((s) => s.id === studentId);
    if (!student || !validation.success) throw new Error('incomplete');
    const data = validation.data;
    await onIssue({
      documentType,
      student,
      purpose: data.purpose,
      issuerRole: 'Secretaria Geral', // a API regista o utilizador que emite; este texto não é enviado
      checkedByName: isCert ? data.checkedByName || undefined : undefined,
      registryBook: isCert && data.registryBook ? data.registryBook : undefined,
      registrySheet: isCert && data.registrySheet ? data.registrySheet : undefined,
    });
    setPurpose('');
    setCheckedByName('');
    setRegistryBook('');
    setRegistrySheet('');
    setTouched({});
  };

  return (
    <FormModal
      id={ISSUE_DOCUMENT_MODAL_ID}
      title="Emitir certificado ou declaração oficial"
      description="Ao gerar, o documento recebe o próximo número da série (não se reutiliza nem se edita), fica registado em seu nome e abre em PDF com um código QR que qualquer pessoa pode verificar."
      submitLabel="Gerar documento"
      size="lg"
      disabled={!validation.success}
      onSubmit={submit}
    >
      <div className="sm:col-span-2">
        <StudentSelect label="Aluno *" students={students} value={studentId} onChange={(v) => { touch('studentId'); setStudentId(v); }} />
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
              onChange={(e) => { touch('checkedByName'); setCheckedByName(e.target.value); }}
              error={showErr('checkedByName', checkedByName)}
              placeholder="Ex: Edson Jorge Sousa Viegas"
            />
          </div>
          <div>
            <Input
              label="Livro de registo n.º (opcional, vai no rodapé)"
              value={registryBook}
              onChange={(e) => { touch('registryBook'); setRegistryBook(e.target.value); }}
              error={showErr('registryBook', registryBook)}
              placeholder="Ex: 12"
            />
          </div>
          <div>
            <Input
              label="Folha n.º (opcional)"
              value={registrySheet}
              onChange={(e) => { touch('registrySheet'); setRegistrySheet(e.target.value); }}
              error={showErr('registrySheet', registrySheet)}
              placeholder="Ex: 0324"
            />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <Input
          label="Finalidade / efeito do documento *"
          value={purpose}
          onChange={(e) => { touch('purpose'); setPurpose(e.target.value); }}
          error={showErr('purpose', purpose)}
          placeholder="Ex: Abono de família, passaporte, matrícula no ensino superior"
        />
      </div>
    </FormModal>
  );
}
