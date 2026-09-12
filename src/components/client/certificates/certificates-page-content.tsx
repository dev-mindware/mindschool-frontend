'use client';

import React, { useState, useMemo } from 'react';
import { 
  DynamicMetricCard, 
  GenericTable, 
  TitleList, 
  GlobalModal, 
  Button, 
  Badge, 
  Icon 
} from '@/components';
import { SearchHandlerWrapper } from '@/components/common/search-handler-wrapper';
import { FilterPopover } from '@/components/shared/filters/filter-popover';
import { useCertificateStore } from '@/stores/school/certificate-store';
import { useSchoolDataStore } from '@/stores/school/school-data-store';
import { OfficialDocumentItem, OfficialDocumentType } from '@/types/certificate';
import { Student } from '@/types';

export function CertificatesPageContent() {
  const { 
    documents, 
    filterType, 
    searchQuery, 
    setFilterType, 
    setSearchQuery, 
    issueDocument, 
    markAsDelivered, 
    getMetrics 
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

  // Formulário de Nova Emissão
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [documentType, setDocumentType] = useState<OfficialDocumentType>('DECLARATION_ENROLLMENT');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [issuerRole, setIssuerRole] = useState('Secretaria Geral');

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

  const handleOpenIssue = () => {
    setSelectedStudentId(students[0]?.id || '');
    setDocumentType('DECLARATION_ENROLLMENT');
    setPurpose('Para efeitos de Abono de Família junto do Instituto Nacional de Segurança Social (INSS)');
    setNotes('');
    setIsIssueModalOpen(true);
  };

  const handleSaveIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s: Student) => s.id === selectedStudentId);
    if (!student || !purpose.trim()) return;

    const newDoc = issueDocument({
      documentType,
      studentId: student.id,
      studentName: student.fullName,
      studentNumber: student.studentNumber,
      classId: student.currentSectionId,
      className: student.currentSectionName,
      academicYear: student.academicYear || '2025/2026',
      purpose,
      issuedBy: issuerRole,
      notes: notes || undefined,
    });

    setIsIssueModalOpen(false);
    setSelectedDocument(newDoc);
    setIsPreviewModalOpen(true);
  };

  const handleViewPreview = (doc: OfficialDocumentItem) => {
    setSelectedDocument(doc);
    setIsPreviewModalOpen(true);
  };

  const getDocTypeBadge = (type: OfficialDocumentType) => {
    switch (type) {
      case 'HABILITATION_CERTIFICATE':
        return <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs">Certificado</Badge>;
      case 'DECLARATION_WITH_GRADES':
        return <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-700 text-xs">Declaração c/ Notas</Badge>;
      case 'DECLARATION_ENROLLMENT':
        return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700 text-xs">Decl. de Frequência</Badge>;
      case 'TRANSFER_GUIDE':
        return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 text-xs">Guia de Transferência</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Documento Oficial</Badge>;
    }
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
          onClick={handleOpenIssue}
          className="gap-2 shadow-xs"
        >
          <Icon name="Plus" className="size-4" />
          Emitir Documento
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={metrics.totalIssued}
          subtitle="Documentos Emitidos"
          description="No ano lectivo corrente"
          icon="FileCheck"
        />
        <DynamicMetricCard
          title={metrics.declarationsCount}
          subtitle="Declarações Escolares"
          description="Com ou sem notas"
          icon="FileText"
        />
        <DynamicMetricCard
          title={metrics.certificatesCount}
          subtitle="Certificados de Habilitações"
          description="Conclusão de ciclo escolar"
          icon="Award"
        />
        <DynamicMetricCard
          title={metrics.pendingDeliveryCount}
          subtitle="Aguardam Levantamento"
          description="Na secretaria escolar"
          icon="Clock"
        />
      </div>

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
        <GenericTable<OfficialDocumentItem>
          data={paginatedDocs}
          page={currentPage}
          totalPages={totalPages}
          total={filteredDocs.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <Icon name="CircleCheck" className="w-3.5 h-3.5" />
                      Entregue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
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
                    onClick={() => handleViewPreview(item)}
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
                      onClick={() => markAsDelivered(item.id)}
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
      </div>

      {/* Modal 1: Formulário de Emissão de Documento */}
      <GlobalModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Emitir Certificado ou Declaração Oficial"
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
      >
        <form onSubmit={handleSaveIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Selecionar Aluno *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              {students.map((s: Student) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.studentNumber}) - {s.currentSectionName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Tipo de Documento Oficial</label>
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
              <label className="block text-xs font-semibold text-foreground mb-1">
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
            <label className="block text-xs font-semibold text-foreground mb-1">
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
            <label className="block text-xs font-semibold text-foreground mb-1">
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
            <Button variant="outline" type="button" onClick={() => setIsIssueModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="FileCheck" className="w-4 h-4" />
              Gerar Documento Oficial
            </Button>
          </div>
        </form>
      </GlobalModal>

      {/* Modal 2: Visualização e Impressão do Documento Timbrado */}
      <GlobalModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={selectedDocument ? `Documento: ${selectedDocument.documentNumber}` : 'Visualização de Documento'}
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-4xl"
      >
        {selectedDocument && (
          <div className="space-y-6">
            {/* Folha A4 Timbrada Oficial Simulada */}
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl border border-border shadow-lg font-serif relative overflow-hidden">
              {/* Marca d'água */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Icon name="GraduationCap" className="w-96 h-96 text-slate-900" />
              </div>

              {/* Cabeçalho Oficial de Angola */}
              <div className="text-center space-y-1 mb-8 border-b-2 border-slate-900 pb-4">
                <p className="text-xs uppercase font-bold tracking-widest text-slate-700">REPÚBLICA DE ANGOLA</p>
                <p className="text-xs uppercase font-semibold text-slate-700">MINISTÉRIO DA EDUCAÇÃO</p>
                <p className="text-xs uppercase text-slate-600">DIRECÇÃO PROVINCIAL DA EDUCAÇÃO DE LUANDA</p>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-slate-950 mt-2">
                  COMPLEXO ESCOLAR MINDSCHOOL
                </h2>
                <p className="text-[10px] text-slate-500 font-sans">
                  Ensino Primário, I e II Ciclos do Ensino Secundário Geral • Luanda - Angola
                </p>
              </div>

              {/* Título do Documento */}
              <div className="text-center my-6">
                <span className="text-xs font-mono font-semibold text-slate-600 uppercase block mb-1">
                  N.º {selectedDocument.documentNumber}
                </span>
                <h3 className="text-xl font-bold uppercase tracking-wide underline underline-offset-4 decoration-1">
                  {selectedDocument.documentType === 'HABILITATION_CERTIFICATE'
                    ? 'CERTIFICADO DE HABILITAÇÕES LITERÁRIAS'
                    : selectedDocument.documentType === 'DECLARATION_WITH_GRADES'
                    ? 'DECLARAÇÃO COM NOTAS'
                    : selectedDocument.documentType === 'TRANSFER_GUIDE'
                    ? 'GUIA OFICIAL DE TRANSFERÊNCIA'
                    : 'DECLARAÇÃO DE FREQUÊNCIA ESCOLAR'}
                </h3>
              </div>

              {/* Corpo Textual Formal do Documento */}
              <div className="text-justify text-sm leading-relaxed space-y-4 my-8 font-sans">
                <p>
                  Para os devidos efeitos e a pedido do encarregado de educação, declara-se que{' '}
                  <strong className="font-bold text-slate-950 underline decoration-slate-400">
                    {selectedDocument.studentName}
                  </strong>
                  , portador do processo individual n.º{' '}
                  <span className="font-mono font-bold">{selectedDocument.studentNumber}</span>, está regularmente
                  matriculado e frequenta nesta instituição de ensino a{' '}
                  <strong>{selectedDocument.className}</strong>, no ano lectivo de{' '}
                  <strong>{selectedDocument.academicYear}</strong>.
                </p>

                <p>
                  A presente declaração é emitida especificamente{' '}
                  <span className="italic font-medium">{selectedDocument.purpose}</span>, constando nos livros de matrícula e
                  termos de aproveitamento sob custódia legal desta Secretaria.
                </p>

                <p>
                  E, por ser verdade e me haver sido solicitada, mandei passar a presente declaração que vai por mim assinada
                  e autenticada com o carimbo a óleo e selo em uso nesta instituição.
                </p>
              </div>

              {/* Data e Localidade */}
              <div className="text-right text-xs my-6 font-sans">
                <p>Luanda, aos {selectedDocument.issueDate}.</p>
              </div>

              {/* Assinaturas Oficiais */}
              <div className="grid grid-cols-2 gap-8 text-center pt-8 mt-12 border-t border-slate-300 font-sans text-xs">
                <div>
                  <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
                  <p className="font-bold text-slate-900">O(A) Secretário(a) Geral</p>
                  <p className="text-[10px] text-slate-500">{selectedDocument.issuedBy}</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
                  <p className="font-bold text-slate-900">O(A) Director(a) Pedagógico(a)</p>
                  <p className="text-[10px] text-slate-500">Direcção Pedagógica Geral</p>
                </div>
              </div>

              {/* Rodapé de Validação e Código QR */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between font-sans text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-100 p-1 border border-slate-300 rounded flex items-center justify-center">
                    <Icon name="QrCode" className="w-8 h-8 text-slate-800" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Autenticidade Verificável por QR Code</p>
                    <p className="font-mono">Código: {selectedDocument.verificationCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p>Documento processado por computador • MindSchool Angola</p>
                  <p className="font-mono">Emissão válida por 90 dias</p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground font-mono">
                Autenticação: {selectedDocument.verificationCode}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Icon name="Printer" className="w-4 h-4" />
                  Imprimir Documento
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </GlobalModal>
    </div>
  );
}
