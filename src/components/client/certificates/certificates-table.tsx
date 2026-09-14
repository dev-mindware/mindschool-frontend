'use client';

import React from 'react';
import { GenericTable, Button, Badge, Icon } from '@/components';
import { OfficialDocumentItem, OfficialDocumentType } from '@/types/certificate';

interface CertificatesTableProps {
  documents: OfficialDocumentItem[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewPreview: (doc: OfficialDocumentItem) => void;
  onMarkAsDelivered: (docId: string) => void;
}

export function CertificatesTable({
  documents,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onViewPreview,
  onMarkAsDelivered,
}: CertificatesTableProps) {
  const getDocTypeBadge = (type: OfficialDocumentType) => {
    switch (type) {
      case 'HABILITATION_CERTIFICATE':
        return <Badge variant="default" className="text-xs font-normal">Certificado</Badge>;
      case 'DECLARATION_WITH_GRADES':
        return <Badge variant="info" className="text-xs font-normal">Declaração c/ Notas</Badge>;
      case 'DECLARATION_ENROLLMENT':
        return <Badge variant="info" className="text-xs font-normal">Decl. de Frequência</Badge>;
      case 'TRANSFER_GUIDE':
        return <Badge variant="warning" className="text-xs font-normal">Guia de Transferência</Badge>;
      default:
        return <Badge variant="outline" className="text-xs font-normal">Documento Oficial</Badge>;
    }
  };

  return (
    <GenericTable<OfficialDocumentItem>
      data={documents}
      page={currentPage}
      totalPages={totalPages}
      total={total}
      setPage={onPageChange}
      goToNextPage={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      goToPreviousPage={() => onPageChange(Math.max(1, currentPage - 1))}
      columns={[
        {
          key: 'docNumber',
          header: 'Número & Tipo',
          render: (_, item) => (
            <div>
              <span className="font-mono font-medium text-foreground text-sm leading-snug">{item.documentNumber}</span>
              <div className="mt-1">{getDocTypeBadge(item.documentType)}</div>
            </div>
          ),
        },
        {
          key: 'student',
          header: 'Aluno & Turma',
          render: (_, item) => (
            <div>
              <p className="font-medium text-foreground text-sm leading-snug">{item.studentName}</p>
              <p className="text-xs text-muted-foreground font-mono">{item.studentNumber} • {item.className}</p>
            </div>
          ),
        },
        {
          key: 'purpose',
          header: 'Finalidade / Efeito',
          render: (_, item) => (
            <div className="text-xs text-muted-foreground max-w-xs truncate" title={item.purpose}>
              {item.purpose}
            </div>
          ),
        },
        {
          key: 'date',
          header: 'Data & Código QR',
          render: (_, item) => (
            <div className="text-xs space-y-0.5">
              <p className="text-foreground font-medium">{item.issueDate}</p>
              <span className="font-mono text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {item.verificationCode}
              </span>
            </div>
          ),
        },
        {
          key: 'status',
          header: 'Estado',
          render: (_, item) => (
            <div>
              {item.isDeliveredToGuardian ? (
                <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                  <Icon name="CircleCheck" className="w-3.5 h-3.5" />
                  Entregue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-warning font-medium">
                  <Icon name="Clock" className="w-3.5 h-3.5" />
                  Pronto na Secretaria
                </span>
              )}
            </div>
          ),
        },
        {
          key: 'actions',
          header: 'Ações',
          className: 'text-right',
          render: (_, item) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewPreview(item)}
                className="h-8 gap-1 text-xs"
                title="Visualizar e Imprimir Documento"
              >
                <Icon name="Printer" className="w-3.5 h-3.5" />
                Visualizar
              </Button>

              {!item.isDeliveredToGuardian && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onMarkAsDelivered(item.id)}
                  className="h-8 gap-1 text-xs"
                  title="Marcar como Entregue ao Encarregado"
                >
                  <Icon name="Check" className="w-3.5 h-3.5" />
                  Entregar
                </Button>
              )}
            </div>
          ),
        },
      ]}
      emptyMessage="Nenhum documento emitido encontrado com os filtros atuais."
    />
  );
}
