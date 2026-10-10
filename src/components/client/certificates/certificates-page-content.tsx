'use client';

import { Can, TitleList, Button, Icon } from '@/components';
import { useCertificates, openDocumentPdf } from '@/hooks/school/use-certificates';
import { useStudents } from '@/hooks/school/use-students';
import { useGradeTerms } from '@/hooks/school/use-grades';
import { getApiErrorMessage } from '@/utils/api-error';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { useModal } from '@/stores/modal/use-modal-store';
import { OfficialDocumentItem, OfficialDocumentType } from '@/types/certificate';
import { Student } from '@/types';
import { CertificatesMetrics } from './certificates-metrics';
import { CertificatesTable } from './certificates-table';
import { IssueDocumentModal, ISSUE_DOCUMENT_MODAL_ID } from './issue-document-modal';

export function CertificatesPageContent() {
  const { documents, issue, getMetrics } = useCertificates();
  const { allStudents: students } = useStudents();
  const { data: terms = [] } = useGradeTerms();
  const { openModal } = useModal();
  const metrics = getMetrics();

  const handleIssueSave = async (docData: { documentType: OfficialDocumentType; student: Student; purpose: string; notes?: string; issuerRole: string }) => {
    try {
      // O boletim exige o período (pauta fechada): usa-se o último período disponível.
      const termId = docData.documentType === 'DECLARATION_WITH_GRADES' ? terms[terms.length - 1]?.id : undefined;
      const doc = await issue.mutateAsync({ studentId: docData.student.id, documentType: docData.documentType, purpose: docData.purpose, termId });
      SucessMessage(`Documento ${doc.documentNumber} emitido com sucesso!`);
      await openDocumentPdf(doc.id);
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, 'Não foi possível emitir o documento.'));
      throw err;
    }
  };

  const handleViewPreview = async (doc: OfficialDocumentItem) => {
    try {
      await openDocumentPdf(doc.id);
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, 'Não foi possível abrir o PDF.'));
    }
  };

  return (
    <div className="space-y-6">
      <TitleList title="Certificados & Declarações" suTitle="Emissão de documentos timbrados com código QR, numeração sequencial e assinatura digital.">
        <Can permission="document:issue"><Button size="sm" onClick={() => openModal(ISSUE_DOCUMENT_MODAL_ID)} className="gap-2 shadow-xs">
          <Icon name="Plus" className="size-4" />
          Emitir Documento
        </Button></Can>
      </TitleList>

      <CertificatesMetrics metrics={metrics} />

      <CertificatesTable documents={documents} onViewPreview={handleViewPreview} />

      <IssueDocumentModal students={students} onIssue={handleIssueSave} />
    </div>
  );
}
