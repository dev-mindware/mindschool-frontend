'use client';

import React, { useState, useMemo } from 'react';
import { 
  DynamicMetricCard, 
  GenericTable, 
  TitleList, 
  GlobalModal, 
  SelectField, 
  Button, 
  Badge, 
  Icon 
} from '@/components';
import { SearchHandlerWrapper } from '@/components/common';
import { FilterPopover } from '@/components/shared';
import { useReportsMedStore } from '@/stores/school/reports-med-store';
import { 
  MedStatisticalReport, 
  MedSnapshotCut, 
  ReportSubmissionStatus,
  ClassStatisticalRow 
} from '@/types/reports-med';

export function ReportsMedPageContent() {
  const { 
    reports, 
    filterCut, 
    searchQuery, 
    setCutFilter, 
    setSearchQuery, 
    generateSnapshot, 
    markAsSubmittedToMED, 
    getMetrics 
  } = useReportsMedStore();

  const metrics = getMetrics();

  // Modais
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isMapPreviewModalOpen, setIsMapPreviewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedStatisticalReport | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Formulário de Geração
  const [newCut, setNewCut] = useState<MedSnapshotCut>('TERM_1_CLOSE');
  const [newYear, setNewYear] = useState('2025/2026');

  // Protocolo de Envio
  const [protocolInput, setProtocolInput] = useState('');

  // Filtros
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesCut = filterCut === 'ALL' || rep.snapshotCut === filterCut;
      const matchesQuery = 
        rep.reportCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.provincialDirectorate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.academicYear.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCut && matchesQuery;
    });
  }, [reports, filterCut, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  const handleOpenGenerate = () => {
    setNewCut('TERM_1_CLOSE');
    setNewYear('2025/2026');
    setIsGenerateModalOpen(true);
  };

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const created = generateSnapshot(newCut, newYear);
    setIsGenerateModalOpen(false);
    setSelectedReport(created);
    setIsMapPreviewModalOpen(true);
  };

  const handleViewMap = (rep: MedStatisticalReport) => {
    setSelectedReport(rep);
    setProtocolInput(rep.submissionProtocolNumber || '');
    setIsMapPreviewModalOpen(true);
  };

  const handleConfirmSubmission = () => {
    if (!selectedReport) return;
    const protocol = protocolInput.trim() || `PROT-MED/DPE-LUANDA/${Date.now()}`;
    markAsSubmittedToMED(selectedReport.id, protocol);
    const updated = useReportsMedStore.getState().reports.find((r) => r.id === selectedReport.id);
    if (updated) setSelectedReport(updated);
  };

  const getCutLabel = (cut: MedSnapshotCut) => {
    switch (cut) {
      case 'ENROLLMENT_START':
        return 'Início do Ano Lectivo (Abertura)';
      case 'TERM_1_CLOSE':
        return 'Fecho do 1.º Trimestre';
      case 'TERM_2_CLOSE':
        return 'Fecho do 2.º Trimestre';
      case 'FINAL_YEAR':
        return 'Fecho Anual / Pauta Final';
    }
  };

  const getStatusBadge = (status: ReportSubmissionStatus) => {
    switch (status) {
      case 'OFFICIALLY_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Icon name="CircleCheck" className="w-3.5 h-3.5 text-emerald-600" />
            Submetido ao MED
          </span>
        );
      case 'DRAFT':
        return <Badge variant="secondary" className="text-xs font-normal">Snapshot em Rascunho</Badge>;
    }
  };

  const hasFilter = Boolean(searchQuery.trim() || filterCut !== 'ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setCutFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Mapas Estatísticos Oficiais do MED"
        suTitle="Gere e arquive snapshots estatísticos imutáveis de aproveitamento e frequência por género para submissão ao Ministério da Educação."
      >
        <Button
          variant="default"
          size="sm"
          onClick={handleOpenGenerate}
          className="gap-2 shadow-xs text-xs font-semibold"
        >
          <Icon name="Plus" className="size-4" />
          Gerar Novo Snapshot MED
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title="100%"
          subtitle="Conformidade Estatística MED"
          description="Normas do Decreto 424/25"
          icon="FileCheck"
        />
        <DynamicMetricCard
          title={`${metrics.femaleStudentRatioPercentage}% Fem / ${100 - metrics.femaleStudentRatioPercentage}% Masc`}
          subtitle="Equilíbrio Demográfico"
          description="Estratificação de género auditada"
          icon="Users"
        />
        <DynamicMetricCard
          title={`${metrics.overallSuccessRatePercentage}%`}
          subtitle="Taxa de Aproveitamento Geral"
          description="Aprovados no snapshot oficial"
          icon="Award"
        />
        <DynamicMetricCard
          title={metrics.totalSnapshots}
          subtitle="Snapshots Arquivados"
          description="Imutabilidade para auditorias"
          icon="Clock"
        />
      </div>

      {/* MindGest Standard Filters Toolbar */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por código, ano ou repartição..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Corte Oficial"
            icon="ListFilter"
            options={[
              { label: 'Todos os Cortes', value: 'ALL' },
              { label: 'Fecho do 1.º Trimestre', value: 'TERM_1_CLOSE' },
              { label: 'Fecho do 2.º Trimestre', value: 'TERM_2_CLOSE' },
              { label: 'Fecho Anual / Pauta Final', value: 'FINAL_YEAR' },
              { label: 'Início do Ano Lectivo', value: 'ENROLLMENT_START' },
            ]}
            value={filterCut === 'ALL' ? null : filterCut}
            onChange={(val) => {
              setCutFilter((val as MedSnapshotCut) ?? 'ALL');
              setCurrentPage(1);
            }}
          />

          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de Snapshots do MED */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* GenericTable */}
        <GenericTable<MedStatisticalReport>
          data={paginatedReports}
          page={currentPage}
          totalPages={totalPages}
          total={filteredReports.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          columns={[
            {
              key: 'code',
              header: 'Código & Corte Oficial',
              render: (_, item) => (
                <div>
                  <span className="font-mono font-medium text-foreground text-sm leading-snug">{item.reportCode}</span>
                  <p className="text-xs text-muted-foreground">{getCutLabel(item.snapshotCut)}</p>
                </div>
              ),
            },
            {
              key: 'academicYear',
              header: 'Ano & Repartição',
              render: (_, item) => (
                <div className="text-xs">
                  <p className="font-medium text-foreground font-mono">{item.academicYear}</p>
                  <p className="text-muted-foreground">{item.municipalDirectorate}</p>
                </div>
              ),
            },
            {
              key: 'demographics',
              header: 'Alunos & Género',
              render: (_, item) => (
                <div className="text-xs font-mono">
                  <p className="font-medium text-foreground">{item.totalStudents.total} Alunos Auditados</p>
                  <p className="text-muted-foreground">{item.totalStudents.female} Fem • {item.totalStudents.male} Masc</p>
                </div>
              ),
            },
            {
              key: 'passRate',
              header: 'Aproveitamento',
              render: (_, item) => (
                <div className="text-xs">
                  <span className="font-medium text-emerald-600 font-mono text-sm">{item.overallPassRate.toFixed(1)}%</span>
                  <p className="text-muted-foreground">{item.totalPassed.total} Aprovados</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Estado',
              render: (_, item) => getStatusBadge(item.status),
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
                    onClick={() => handleViewMap(item)}
                    className="h-8 gap-1 text-xs"
                    title="Visualizar Mapa Estatístico Oficial A4"
                  >
                    <Icon name="FileSpreadsheet" className="w-3.5 h-3.5" />
                    Ver Mapa A4
                  </Button>
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhum relatório estatístico do MED gerado com os filtros atuais."
        />
      </div>

      {/* Modal 1: Geração de Novo Snapshot MED */}
      <GlobalModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Gerar Novo Snapshot Estatístico para o MED (UC-08)"
        className="!w-[95vw] sm:!max-w-xl lg:!max-w-2xl"
      >
        <form onSubmit={handleSaveSnapshot} className="space-y-4">
          <div className="p-4 bg-muted/40 rounded-xl border border-border text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Icon name="ShieldCheck" className="w-4 h-4 text-primary" />
              Regra de Imutabilidade do Ministério da Educação
            </div>
            <p className="text-muted-foreground leading-relaxed">
              O relatório será congelado em formato de snapshot a partir das pautas oficiais fechadas. Os dados consolidados
              não sofrerão alterações automáticas posteriores, servindo como documento de prestação de contas à Inspecção Geral.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Corte Oficial de Prestação de Contas"
              value={newCut}
              onValueChange={(val) => setNewCut(val as MedSnapshotCut)}
              options={[
                { label: 'Fecho do 1.º Trimestre', value: 'TERM_1_CLOSE' },
                { label: 'Fecho do 2.º Trimestre', value: 'TERM_2_CLOSE' },
                { label: 'Fecho Anual / Pauta Final', value: 'FINAL_YEAR' },
                { label: 'Início do Ano Lectivo (Abertura)', value: 'ENROLLMENT_START' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Ano Lectivo
              </label>
              <input
                type="text"
                required
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setIsGenerateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="Camera" className="w-4 h-4" />
              Congelar Snapshot Oficial
            </Button>
          </div>
        </form>
      </GlobalModal>

      {/* Modal 2: Visualização do Mapa Estatístico Oficial A4 Padronizado do MED */}
      <GlobalModal
        isOpen={isMapPreviewModalOpen}
        onClose={() => setIsMapPreviewModalOpen(false)}
        title={selectedReport ? `Mapa Oficial: ${selectedReport.reportCode}` : 'Mapa Estatístico MED'}
        className="!w-[95vw] sm:!max-w-4xl lg:!max-w-6xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Folha A4 em Formato Paisagem Panorâmico Oficial do MED */}
            <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-xl border border-border shadow-lg font-sans text-xs relative overflow-x-auto">
              {/* Cabeçalho Oficial do MED */}
              <div className="text-center space-y-0.5 border-b-2 border-slate-900 pb-4 mb-6">
                <p className="text-[11px] uppercase font-bold tracking-widest text-slate-700">REPÚBLICA DE ANGOLA</p>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-800">MINISTÉRIO DA EDUCAÇÃO</p>
                <p className="text-[10px] uppercase text-slate-600 font-semibold">{selectedReport.provincialDirectorate}</p>
                <p className="text-[10px] text-slate-500">{selectedReport.municipalDirectorate}</p>
                <h2 className="text-base font-extrabold uppercase tracking-tight text-slate-950 mt-2">
                  MAPA ESTATÍSTICO DE RENDIMENTO ESCOLAR E DEMOGRAFIA ({getCutLabel(selectedReport.snapshotCut).toUpperCase()})
                </h2>
                <div className="flex items-center justify-center gap-6 text-[10px] text-slate-600 pt-1 font-mono">
                  <span>Ano Lectivo: <strong>{selectedReport.academicYear}</strong></span>
                  <span>Escola: <strong>{selectedReport.schoolName}</strong></span>
                  <span>Código de Registo: <strong>{selectedReport.reportCode}</strong></span>
                </div>
              </div>

              {/* Tabela Estatística Padronizada Oficial do MED */}
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-medium text-slate-800">
                      <th rowSpan={2} className="p-2 border-r border-slate-300 text-left">Classe & Turma</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-300">Turno</th>
                      <th colSpan={3} className="p-1 border-r border-slate-300 bg-slate-200/60">Matriculados</th>
                      <th colSpan={3} className="p-1 border-r border-slate-300 bg-slate-200/60">Avaliados</th>
                      <th colSpan={3} className="p-1 border-r border-slate-300 bg-emerald-50">Aprovados</th>
                      <th colSpan={3} className="p-1 border-r border-slate-300 bg-rose-50">Reprovados</th>
                      <th colSpan={5} className="p-1 border-r border-slate-300 bg-amber-50">Menções Qualitativas MED</th>
                      <th rowSpan={2} className="p-2 bg-slate-100 font-medium">% Aprov.</th>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-300 text-[10px] text-slate-600">
                      {/* Matriculados */}
                      <th className="p-1 border-r border-slate-200">M</th>
                      <th className="p-1 border-r border-slate-200">F</th>
                      <th className="p-1 border-r border-slate-300 font-medium">T</th>
                      {/* Avaliados */}
                      <th className="p-1 border-r border-slate-200">M</th>
                      <th className="p-1 border-r border-slate-200">F</th>
                      <th className="p-1 border-r border-slate-300 font-medium">T</th>
                      {/* Aprovados */}
                      <th className="p-1 border-r border-slate-200">M</th>
                      <th className="p-1 border-r border-slate-200">F</th>
                      <th className="p-1 border-r border-slate-300 font-medium">T</th>
                      {/* Reprovados */}
                      <th className="p-1 border-r border-slate-200">M</th>
                      <th className="p-1 border-r border-slate-200">F</th>
                      <th className="p-1 border-r border-slate-300 font-medium">T</th>
                      {/* Menções */}
                      <th className="p-1 border-r border-slate-200">Muito Bom</th>
                      <th className="p-1 border-r border-slate-200">Bom</th>
                      <th className="p-1 border-r border-slate-200">Sufic.</th>
                      <th className="p-1 border-r border-slate-200">Medíoc.</th>
                      <th className="p-1 border-r border-slate-300 text-rose-700">Mau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {selectedReport.rows.map((row: ClassStatisticalRow) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2 border-r border-slate-200 text-left font-sans font-medium text-slate-900">
                          {row.classLevel} - {row.sectionName}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-sans text-slate-600">{row.shift}</td>
                        {/* Matriculados */}
                        <td className="p-1 border-r border-slate-200">{row.enrolledStudents.male}</td>
                        <td className="p-1 border-r border-slate-200">{row.enrolledStudents.female}</td>
                        <td className="p-1 border-r border-slate-300 font-medium text-slate-900">{row.enrolledStudents.total}</td>
                        {/* Avaliados */}
                        <td className="p-1 border-r border-slate-200">{row.evaluatedStudents.male}</td>
                        <td className="p-1 border-r border-slate-200">{row.evaluatedStudents.female}</td>
                        <td className="p-1 border-r border-slate-300 font-medium text-slate-900">{row.evaluatedStudents.total}</td>
                        {/* Aprovados */}
                        <td className="p-1 border-r border-slate-200 text-emerald-700">{row.passedStudents.male}</td>
                        <td className="p-1 border-r border-slate-200 text-emerald-700">{row.passedStudents.female}</td>
                        <td className="p-1 border-r border-slate-300 font-medium text-emerald-800">{row.passedStudents.total}</td>
                        {/* Reprovados */}
                        <td className="p-1 border-r border-slate-200 text-rose-700">{row.failedStudents.male}</td>
                        <td className="p-1 border-r border-slate-200 text-rose-700">{row.failedStudents.female}</td>
                        <td className="p-1 border-r border-slate-300 font-medium text-rose-800">{row.failedStudents.total}</td>
                        {/* Menções */}
                        <td className="p-1 border-r border-slate-200 text-emerald-700 font-medium">{row.gradeDistribution.veryGood.total}</td>
                        <td className="p-1 border-r border-slate-200 text-emerald-600">{row.gradeDistribution.good.total}</td>
                        <td className="p-1 border-r border-slate-200 text-slate-700">{row.gradeDistribution.sufficient.total}</td>
                        <td className="p-1 border-r border-slate-200 text-amber-700">{row.gradeDistribution.mediocre.total}</td>
                        <td className="p-1 border-r border-slate-300 text-rose-700 font-medium">{row.gradeDistribution.poor.total}</td>
                        {/* Taxa */}
                        <td className="p-1 font-medium text-slate-900">{row.passRatePercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Linha de Totais da Escola */}
                  <tfoot>
                    <tr className="bg-slate-200/80 font-medium border-t-2 border-slate-400 text-slate-900 font-mono">
                      <td className="p-2 text-left font-sans" colSpan={2}>TOTAIS DO COMPLEXO ESCOLAR:</td>
                      <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.enrolledStudents.male, 0)}</td>
                      <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.enrolledStudents.female, 0)}</td>
                      <td className="p-1 font-medium border-r border-slate-400">{selectedReport.totalStudents.total}</td>

                      <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.evaluatedStudents.male, 0)}</td>
                      <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.evaluatedStudents.female, 0)}</td>
                      <td className="p-1 font-medium border-r border-slate-400">{selectedReport.totalStudents.total}</td>

                      <td className="p-1 text-emerald-800">{selectedReport.totalPassed.male}</td>
                      <td className="p-1 text-emerald-800">{selectedReport.totalPassed.female}</td>
                      <td className="p-1 font-medium text-emerald-900 border-r border-slate-400">{selectedReport.totalPassed.total}</td>

                      <td className="p-1 text-rose-800">{selectedReport.totalFailed.male}</td>
                      <td className="p-1 text-rose-800">{selectedReport.totalFailed.female}</td>
                      <td className="p-1 font-medium text-rose-900 border-r border-slate-400">{selectedReport.totalFailed.total}</td>

                      <td colSpan={5} className="border-r border-slate-400 text-slate-600 font-sans text-[10px]">
                        Estratificação Qualitativa Auditada
                      </td>
                      <td className="p-1 text-primary text-sm font-medium">{selectedReport.overallPassRate.toFixed(1)}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Termo de Encerramento e Assinaturas */}
              <div className="grid grid-cols-2 gap-8 text-center pt-8 mt-6 border-t border-slate-300 font-sans text-xs">
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                  <p className="font-bold text-slate-900">O(A) Director(a) Pedagógico(a)</p>
                  <p className="text-[10px] text-slate-500">{selectedReport.generatedBy}</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
                  <p className="font-bold text-slate-900">O(A) Director(a) Geral do Colégio</p>
                  <p className="text-[10px] text-slate-500">Direcção Geral / Conselho de Direcção</p>
                </div>
              </div>

              {/* Rodapé Oficial de Auditoria */}
              <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <div>
                  Protocolo: <strong className="text-slate-800">{selectedReport.submissionProtocolNumber || 'Aguardando submissão'}</strong>
                </div>
                <div>
                  Gerado em: {selectedReport.generatedAt} • Conforme Decreto Presidencial n.º 424/25
                </div>
              </div>
            </div>

            {/* Ações e Submissão ao MED */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                {selectedReport.status !== 'OFFICIALLY_SUBMITTED' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Número de Protocolo da DPE..."
                      value={protocolInput}
                      onChange={(e) => setProtocolInput(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded border border-border bg-background font-mono w-56"
                    />
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleConfirmSubmission}
                      className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Icon name="CircleCheck" className="w-4 h-4" />
                      Protocolar no MED
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                    <Icon name="CheckCheck" className="w-4 h-4" />
                    Protocolado sob o n.º {selectedReport.submissionProtocolNumber}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Icon name="Printer" className="w-4 h-4" />
                  Imprimir Mapa A4
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsMapPreviewModalOpen(false)}>
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
