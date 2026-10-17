'use client';

import { Badge, ButtonOnlyAction, DataList, type Column } from '@/components';
import { OfficialDocumentItem, OfficialDocumentType } from '@/types/certificate';

const TYPE_LABEL: Record<OfficialDocumentType, string> = {
  DECLARATION_ENROLLMENT: 'Decl. de Frequência',
  DECLARATION_WITH_GRADES: 'Decl. com Notas',
  HABILITATION_CERTIFICATE: 'Cert. de Habilitações',
  TRANSFER_GUIDE: 'Guia de Transferência',
  CONDUCT_CERTIFICATE: 'Cert. de Conduta',
};

const TYPE_VARIANT: Record<OfficialDocumentType, 'default' | 'info' | 'warning'> = {
  HABILITATION_CERTIFICATE: 'default',
  DECLARATION_WITH_GRADES: 'info',
  DECLARATION_ENROLLMENT: 'info',
  TRANSFER_GUIDE: 'warning',
  CONDUCT_CERTIFICATE: 'default',
};

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'));

interface CertificatesTableProps {
  documents: OfficialDocumentItem[];
  isLoading?: boolean;
  onViewPreview: (doc: OfficialDocumentItem) => void;
}

/** Documentos oficiais emitidos, com filtros na URL (tipo, turma, ano, emissor, data). */
export function CertificatesTable({ documents, isLoading, onViewPreview }: CertificatesTableProps) {
  const columns: Column<OfficialDocumentItem>[] = [
    {
      key: 'docNumber',
      header: 'Número & Tipo',
      render: (_, d) => (
        <div>
          <span className="font-mono text-sm font-medium">{d.documentNumber}</span>
          <div className="mt-1"><Badge variant={TYPE_VARIANT[d.documentType] ?? 'outline'} className="text-xs font-normal">{TYPE_LABEL[d.documentType] ?? 'Documento Oficial'}</Badge></div>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Aluno & Turma',
      render: (_, d) => (
        <div>
          <p className="text-sm font-medium leading-snug">{d.studentName}</p>
          <p className="font-mono text-xs text-muted-foreground">{d.studentNumber} • {d.className}</p>
        </div>
      ),
    },
    { key: 'purpose', header: 'Finalidade / Efeito', render: (_, d) => <div className="max-w-xs truncate text-xs text-muted-foreground" title={d.purpose}>{d.purpose}</div> },
    {
      key: 'date',
      header: 'Data & Código QR',
      render: (_, d) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium">{d.issueDate}</p>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">{d.verificationCode}</span>
        </div>
      ),
    },
    { key: 'actions', header: 'Acção', render: (_, d) => <ButtonOnlyAction data={d} actions={[{ label: 'Baixar PDF', icon: 'Download', onClick: onViewPreview }]} /> },
  ];

  return (
    <DataList<OfficialDocumentItem>
      prefix="documentos"
      rows={documents}
      columns={columns}
      isLoading={isLoading}
      pageSize={10}
      searchPlaceholder="Pesquisar por número, aluno, código ou finalidade"
      searchText={(d) => `${d.documentNumber} ${d.studentName} ${d.studentNumber} ${d.verificationCode} ${d.purpose}`}
      filters={[
        { key: 'tipo', label: 'Tipo', icon: 'ListFilter', options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })), match: (d, v) => d.documentType === v },
        { key: 'turma', label: 'Turma', icon: 'Users', options: uniq(documents.map((d) => d.className)).map((v) => ({ value: v, label: v })), match: (d, v) => d.className === v },
        { key: 'ano', label: 'Ano lectivo', icon: 'CalendarRange', options: uniq(documents.map((d) => d.academicYear)).map((v) => ({ value: v, label: v })), match: (d, v) => d.academicYear === v },
        { key: 'emissor', label: 'Emitido por', icon: 'UserCheck', options: uniq(documents.map((d) => d.issuedBy)).map((v) => ({ value: v, label: v })), match: (d, v) => d.issuedBy === v },
        { key: 'estado', label: 'Estado', icon: 'Flag', options: uniq(documents.map((d) => d.status)).map((v) => ({ value: v, label: v })), match: (d, v) => d.status === v },
      ]}
      dateFilters={[{ key: 'emissao', label: 'Emissão', getDate: (d) => d.issueDate }]}
      sorts={[
        { value: 'data', label: 'Data de emissão', compare: (a, b) => a.issueDate.localeCompare(b.issueDate) },
        { value: 'aluno', label: 'Aluno', compare: (a, b) => a.studentName.localeCompare(b.studentName, 'pt') },
        { value: 'numero', label: 'Número', compare: (a, b) => a.documentNumber.localeCompare(b.documentNumber) },
      ]}
      emptyTitle="Nenhum documento emitido"
      emptyDescription="Emita um certificado ou declaração para o ver aqui."
      emptyIcon="FileText"
    />
  );
}
