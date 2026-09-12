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
import { useTeacherAttendanceStore } from '@/stores/school/teacher-attendance-store';
import { TeacherAttendanceLog, TeacherDayStatus } from '@/types/teacher-attendance';

export function TeachersAttendancePageContent() {
  const { 
    attendanceLogs, 
    credentials, 
    filterStatus, 
    searchQuery, 
    setStatusFilter, 
    setSearchQuery, 
    registerScan, 
    justifyAbsence, 
    getMetrics 
  } = useTeacherAttendanceStore();

  const metrics = getMetrics();

  // Modais
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Estados de Scanner
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{ 
    success: boolean; 
    type: 'CHECK_IN' | 'CHECK_OUT'; 
    teacherName: string; 
    time: string; 
    message: string; 
  } | null>(null);

  // Estados de Justificação
  const [selectedTeacherForJustify, setSelectedTeacherForJustify] = useState<TeacherAttendanceLog | null>(null);
  const [justifyReason, setJustifyReason] = useState('');
  const [justifyDocName, setJustifyDocName] = useState('');

  // Professor selecionado para cartão
  const [selectedCardTeacherId, setSelectedCardTeacherId] = useState<string | null>(null);

  // Filtros
  const filteredLogs = useMemo(() => {
    return attendanceLogs.filter((log) => {
      const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
      const matchesQuery = 
        log.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.teacherCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.department.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [attendanceLogs, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const handleSimulateScan = (codeToScan?: string) => {
    const code = codeToScan || scannedCodeInput;
    if (!code.trim()) return;

    const res = registerScan(code, 'PORTAO-PRINCIPAL-01');
    setScanResult(res);
    setScannedCodeInput('');
  };

  const handleOpenJustify = (log: TeacherAttendanceLog) => {
    setSelectedTeacherForJustify(log);
    setJustifyReason('');
    setJustifyDocName('');
    setIsJustifyOpen(true);
  };

  const handleSaveJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForJustify || !justifyReason.trim()) return;

    justifyAbsence(selectedTeacherForJustify.teacherId, justifyReason, justifyDocName);
    setIsJustifyOpen(false);
  };

  const handleOpenCard = (teacherId: string) => {
    setSelectedCardTeacherId(teacherId);
    setIsCardModalOpen(true);
  };

  const getStatusBadge = (status: TeacherDayStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Presente
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Atrasado
          </span>
        );
      case 'JUSTIFIED_ABSENCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Falta Justificada
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Ausente
          </span>
        );
      case 'ON_DUTY':
        return <Badge variant="secondary" className="text-xs font-normal">Em Serviço</Badge>;
    }
  };

  const hasFilter = Boolean(searchQuery.trim() || filterStatus !== 'ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const selectedCredential = credentials.find((c) => c.teacherId === selectedCardTeacherId);

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Assiduidade & Presença Docente"
        suTitle="Registo rápido e auditável de entradas, saídas e tempos letivos via QR Code."
      >
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            setScanResult(null);
            setIsScannerOpen(true);
          }}
          className="gap-2 shadow-xs text-xs font-semibold"
        >
          <Icon name="ScanQrCode" className="size-4" />
          Terminal de Ponto QR
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${metrics.presentToday} / ${metrics.totalTeachers}`}
          subtitle="Presenças Hoje"
          description="Docentes registados no turno"
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={`${metrics.punctualityRatePercentage}%`}
          subtitle="Taxa de Pontualidade"
          description={`${metrics.lateArrivalsToday} atrasos registados`}
          icon="Clock"
        />
        <DynamicMetricCard
          title={metrics.absentToday}
          subtitle="Ausências Hoje"
          description="Sujeitas a justificação"
          icon="CalendarX"
        />
        <DynamicMetricCard
          title={`${metrics.classesFulfillmentPercentage}%`}
          subtitle="Cumprimento de Aulas"
          description="Sem tempos letivos vazios"
          icon="Award"
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
          placeholder="Pesquisar professor ou código..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={[
              { label: 'Todos os Estados', value: 'ALL' },
              { label: 'Presentes (Pontuais)', value: 'PRESENT' },
              { label: 'Atrasados', value: 'LATE' },
              { label: 'Faltas Justificadas', value: 'JUSTIFIED_ABSENCE' },
              { label: 'Ausentes (Falta)', value: 'ABSENT' },
            ]}
            value={filterStatus === 'ALL' ? null : filterStatus}
            onChange={(val) => {
              setStatusFilter((val as TeacherDayStatus) ?? 'ALL');
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

      {/* Tabela de Assiduidade */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">

        {/* GenericTable */}
        <GenericTable<TeacherAttendanceLog>
          data={paginatedLogs}
          page={currentPage}
          totalPages={totalPages}
          total={filteredLogs.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          columns={[
            {
              key: 'teacher',
              header: 'Professor & Código',
              render: (_, item) => (
                <div>
                  <p className="font-medium text-foreground text-sm leading-snug">{item.teacherName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.teacherCode} • {item.department}</p>
                </div>
              ),
            },
            {
              key: 'checkIn',
              header: 'Entrada (Check-In)',
              render: (_, item) => (
                <div className="text-xs">
                  {item.checkInTime ? (
                    <div>
                      <span className="font-mono font-medium text-foreground">{item.checkInTime}</span>
                      {item.delayMinutes && item.delayMinutes > 0 ? (
                        <p className="text-[11px] text-amber-600 font-medium">+{item.delayMinutes} min de atraso</p>
                      ) : (
                        <p className="text-[11px] text-emerald-600">Pontual</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground font-mono">--:--:--</span>
                  )}
                </div>
              ),
            },
            {
              key: 'checkOut',
              header: 'Saída (Check-Out)',
              render: (_, item) => (
                <div className="text-xs">
                  {item.checkOutTime ? (
                    <div>
                      <span className="font-mono font-medium text-foreground">{item.checkOutTime}</span>
                      <p className="text-[11px] text-muted-foreground">{item.durationMinutes} min em serviço</p>
                    </div>
                  ) : item.checkInTime ? (
                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                      Em Aula / Turno
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-mono">--:--:--</span>
                  )}
                </div>
              ),
            },
            {
              key: 'classes',
              header: 'Aulas Cumpridas',
              render: (_, item) => (
                <div className="text-xs font-mono">
                  <span className="font-medium text-foreground">{item.completedClassesCount}</span>
                  <span className="text-muted-foreground"> / {item.scheduledClassesCount} tempos</span>
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
                    onClick={() => handleOpenCard(item.teacherId)}
                    className="h-8 gap-1 text-xs"
                    title="Ver Cartão Físico com QR Code"
                  >
                    <Icon name="QrCode" className="w-3.5 h-3.5" />
                    Cartão QR
                  </Button>

                  {item.status === 'ABSENT' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenJustify(item)}
                      className="h-8 gap-1 text-xs"
                      title="Justificar Falta com Documento"
                    >
                      <Icon name="FileText" className="w-3.5 h-3.5" />
                      Justificar
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhum registo de assiduidade docente encontrado."
        />
      </div>

      {/* Modal 1: Terminal de Ponto QR (Scanner Balcão) */}
      <GlobalModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        title="Terminal de Ponto por Leitura QR (Portão / Balcão)"
        className="!w-[95vw] sm:!max-w-xl lg:!max-w-2xl"
      >
        <div className="space-y-5">
          <div className="text-center p-6 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
            <div className="inline-flex items-center justify-center p-4 bg-primary/20 text-primary rounded-full border border-primary/40">
              <Icon name="ScanQrCode" className="w-12 h-12 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold">Aproxime o QR Code do Professor</h3>
              <p className="text-xs text-slate-400 mt-1">
                Suporta QR Dinâmico da aplicação móvel ou o Cartão Físico institucional.
              </p>
            </div>

            {/* Input Simulado de Leitor Ótico de Balcão */}
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="text"
                autoFocus
                placeholder="Código QR ou DOC-XXXX..."
                value={scannedCodeInput}
                onChange={(e) => setScannedCodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSimulateScan();
                  }
                }}
                className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" variant="default" onClick={() => handleSimulateScan()}>
                Confirmar
              </Button>
            </div>
          </div>

          {/* Feedback Visual do Ponto */}
          {scanResult && (
            <div className={`p-4 rounded-xl border ${scanResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <div className="flex items-start gap-3">
                <Icon 
                  name={scanResult.success ? 'CircleCheck' : 'CircleAlert'} 
                  className={`w-5 h-5 mt-0.5 ${scanResult.success ? 'text-emerald-600' : 'text-rose-600'}`} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">
                      {scanResult.success ? (scanResult.type === 'CHECK_IN' ? 'Check-In Realizado (Entrada)' : 'Check-Out Realizado (Saída)') : 'Erro na Leitura'}
                    </h4>
                    {scanResult.time && <span className="text-xs font-mono font-bold">{scanResult.time}</span>}
                  </div>
                  {scanResult.teacherName && (
                    <p className="text-xs font-semibold mt-0.5">{scanResult.teacherName}</p>
                  )}
                  <p className="text-xs mt-1 text-muted-foreground">{scanResult.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Atalhos Rápidos para Testar com Docentes Cadastrados */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/80 space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Atalhos de Simulação Instantânea:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {credentials.slice(0, 5).map((cred) => (
                <button
                  key={cred.id}
                  type="button"
                  onClick={() => handleSimulateScan(cred.teacherCode)}
                  className="px-2 py-1 bg-card hover:bg-muted border border-border rounded-md text-xs font-medium text-foreground transition-colors"
                >
                  {cred.teacherName.split(' ')[1] || cred.teacherName} ({cred.teacherCode})
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlobalModal>

      {/* Modal 2: Justificação de Ausência */}
      <GlobalModal
        isOpen={isJustifyOpen}
        onClose={() => setIsJustifyOpen(false)}
        title={selectedTeacherForJustify ? `Justificar Falta: ${selectedTeacherForJustify.teacherName}` : 'Justificar Falta'}
        className="!w-[95vw] sm:!max-w-lg lg:!max-w-xl"
      >
        <form onSubmit={handleSaveJustification} className="space-y-4">
          <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-0.5">
            <p className="font-medium text-foreground">{selectedTeacherForJustify?.teacherName} ({selectedTeacherForJustify?.teacherCode})</p>
            <p className="text-muted-foreground">Departamento: {selectedTeacherForJustify?.department} • Data: {selectedTeacherForJustify?.date}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Motivo da Justificação *
            </label>
            <textarea
              required
              rows={3}
              value={justifyReason}
              onChange={(e) => setJustifyReason(e.target.value)}
              placeholder="Ex: Atestado Médico emitido pelo Hospital Geral de Luanda, comparência em formação oficial do MED..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Nome do Documento / Comprovativo Anexado
            </label>
            <input
              type="text"
              value={justifyDocName}
              onChange={(e) => setJustifyDocName(e.target.value)}
              placeholder="Ex: atestado-medico-consulta.pdf"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setIsJustifyOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="Check" className="w-4 h-4" />
              Gravar Justificação
            </Button>
          </div>
        </form>
      </GlobalModal>

      {/* Modal 3: Cartão de Identificação Docente com QR Code */}
      <GlobalModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title="Cartão Institucional Docente (Para Impressão)"
        className="!w-[95vw] sm:!max-w-md"
      >
        {selectedCredential && (
          <div className="space-y-6 text-center">
            {/* Design do Cartão PVC Simulado */}
            <div className="w-80 mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-xl border border-slate-700 relative overflow-hidden text-left">
              {/* Marca d'água */}
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <Icon name="GraduationCap" className="w-48 h-48 text-white" />
              </div>

              {/* Cabeçalho do Cartão */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">República de Angola</span>
                  <h4 className="font-extrabold text-sm tracking-tight text-white">MINDSCHOOL ANGOLA</h4>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/40">
                  MS
                </div>
              </div>

              {/* Informações do Docente */}
              <div className="my-4 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
                  <Icon name="User" className="w-8 h-8" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white leading-tight">{selectedCredential.teacherName}</h5>
                  <p className="text-xs text-primary font-medium mt-0.5">Corpo Docente</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{selectedCredential.teacherCode}</p>
                </div>
              </div>

              {/* QR Code de Ponto Físico */}
              <div className="bg-white p-3 rounded-xl flex items-center justify-center max-w-[140px] mx-auto shadow-md">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-950 p-1 flex items-center justify-center rounded">
                    <Icon name="QrCode" className="w-20 h-20 text-white" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-900 block mt-1 font-semibold">
                    {selectedCredential.teacherCode}
                  </span>
                </div>
              </div>

              <p className="text-[9px] text-center text-slate-400 mt-4">
                Cartão oficial para registo de assiduidade diária nas instalações escolares.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs"
              >
                <Icon name="Printer" className="w-4 h-4" />
                Imprimir Cartão
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsCardModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </GlobalModal>
    </div>
  );
}
