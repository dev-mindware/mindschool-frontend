'use client';

import React, { useState, useMemo } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { SearchHandlerWrapper } from '@/components/common/search-handler-wrapper';
import { FilterPopover } from '@/components/shared/filters/filter-popover';
import { useCertificateStore } from '@/stores/school/certificate-store';
import { useSchoolDataStore } from '@/stores/school/school-data-store';
import { OfficialDocumentItem, OfficialDocumentType } from '@/types/certificate';
import { Student } from '@/types';
import { CertificatesMetrics } from './certificates-metrics';
import { CertificatesTable } from './certificates-table';
import { IssueDocumentModal } from './issue-document-modal';
import { CertificatePreviewModal } from './certificate-preview-modal';

export function CertificatesPageContent() {
  const {
    documents,
    filterType,
    searchQuery,
    setFilterType,
    setSearchQuery,
    issueDocument,
    markAsDelivered,
    getMetrics,
  } = useCertificateStore();

  const { students } = useSchoolDataStore();
  const metrics = getMetrics();

  // Modais
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<OfficialDocumentItem | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Filtros
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesType = filterType === 'ALL' || doc.documentType === filterType;
      const matchesQuery =
        doc.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.verificationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.purpose.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [documents, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDocs.slice(start, start + PAGE_SIZE);
  }, [filteredDocs, currentPage]);

  const handleIssueSave = (docData: {
    documentType: OfficialDocumentType;
    student: Student;
    purpose: string;
    notes?: string;
    issuerRole: string;
  }) => {
    const newDoc = issueDocument({
      documentType: docData.documentType,
      studentId: docData.student.id,
      studentName: docData.student.fullName,
      studentNumber: docData.student.studentNumber,
      classId: docData.student.currentSectionId,
      className: docData.student.currentSectionName,
      academicYear: docData.student.academicYear || '2025/2026',
      purpose: docData.purpose,
      issuedBy: docData.issuerRole,
      notes: docData.notes,
    });

    setIsIssueModalOpen(false);
    setSelectedDocument(newDoc);
    setIsPreviewModalOpen(true);
  };

  const handleViewPreview = (doc: OfficialDocumentItem) => {
    setSelectedDocument(doc);
    setIsPreviewModalOpen(true);
  };

  const hasActiveFilters = filterType !== 'ALL' || Boolean(searchQuery);

  const handleClearFilters = () => {
    setFilterType('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Certificados & Declarações"
        suTitle="Emissão de documentos timbrados com código QR, numeração sequencial e assinatura digital."
      >
        <Button
          size="sm"
          onClick={() => setIsIssueModalOpen(true)}
          className="gap-2 shadow-xs"
        >
          <Icon name="Plus" className="size-4" />
          Emitir Documento
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <CertificatesMetrics metrics={metrics} />

      {/* Tabela de Documentos Emitidos */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/60">
          {/* Filtros e Pesquisa – Padrão MindGest */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <SearchHandlerWrapper
              search={searchQuery}
              setSearch={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Pesquisar por número, aluno ou código QR..."
              className="w-full sm:max-w-xs md:max-w-sm"
            />

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <FilterPopover
                label="Tipo"
                icon="ListFilter"
                options={[
                  { label: 'Todos os Tipos', value: 'ALL' },
                  { label: 'Decl. de Frequência', value: 'DECLARATION_ENROLLMENT' },
                  { label: 'Decl. com Notas', value: 'DECLARATION_WITH_GRADES' },
                  { label: 'Cert. de Habilitações', value: 'HABILITATION_CERTIFICATE' },
                  { label: 'Guia de Transferência', value: 'TRANSFER_GUIDE' },
                ]}
                value={filterType === 'ALL' ? null : filterType}
                onChange={(val) => {
                  setFilterType((val ?? 'ALL') as OfficialDocumentType | 'ALL');
                  setCurrentPage(1);
                }}
              />

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" className="mr-1 size-3.5" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* GenericTable */}
        <CertificatesTable
          documents={paginatedDocs}
          currentPage={currentPage}
          totalPages={totalPages}
          total={filteredDocs.length}
          onPageChange={setCurrentPage}
          onViewPreview={handleViewPreview}
          onMarkAsDelivered={markAsDelivered}
        />
      </div>

      {/* Modal 1: Formulário de Emissão de Documento */}
      <IssueDocumentModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        students={students}
        onIssue={handleIssueSave}
      />

      {/* Modal 2: Visualização e Impressão do Documento Timbrado */}
      <CertificatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        selectedDocument={selectedDocument}
      />
    </div>
  );
}
