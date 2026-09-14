'use client';

import React, { useState, useMemo } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { SearchHandlerWrapper } from '@/components/common';
import { FilterPopover } from '@/components/shared';
import { useTeacherAttendanceStore } from '@/stores/school/teacher-attendance-store';
import { TeacherAttendanceLog, TeacherDayStatus } from '@/types/teacher-attendance';
import { TeachersAttendanceMetrics } from './teachers-attendance-metrics';
import { TeachersAttendanceTable } from './teachers-attendance-table';
import { AttendanceQrScannerModal } from './attendance-qr-scanner-modal';
import { JustifyAbsenceModal } from './justify-absence-modal';
import { TeacherCredentialModal } from './teacher-credential-modal';

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
    getMetrics,
  } = useTeacherAttendanceStore();

  const metrics = getMetrics();

  // Modais
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Professor selecionado para justificativa e cartão
  const [selectedTeacherForJustify, setSelectedTeacherForJustify] = useState<TeacherAttendanceLog | null>(null);
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

  const handleOpenJustify = (log: TeacherAttendanceLog) => {
    setSelectedTeacherForJustify(log);
    setIsJustifyOpen(true);
  };

  const handleOpenCard = (teacherId: string) => {
    setSelectedCardTeacherId(teacherId);
    setIsCardModalOpen(true);
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
          onClick={() => setIsScannerOpen(true)}
          className="gap-2 shadow-xs text-xs font-semibold"
        >
          <Icon name="ScanQrCode" className="size-4" />
          Terminal de Ponto QR
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <TeachersAttendanceMetrics metrics={metrics} />

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
      <TeachersAttendanceTable
        logs={paginatedLogs}
        currentPage={currentPage}
        totalPages={totalPages}
        total={filteredLogs.length}
        onPageChange={setCurrentPage}
        onOpenCard={handleOpenCard}
        onOpenJustify={handleOpenJustify}
      />

      {/* Modal 1: Terminal de Ponto QR */}
      <AttendanceQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        credentials={credentials}
        onScan={(code) => registerScan(code, 'PORTAO-PRINCIPAL-01')}
      />

      {/* Modal 2: Justificação de Ausência */}
      <JustifyAbsenceModal
        isOpen={isJustifyOpen}
        onClose={() => setIsJustifyOpen(false)}
        selectedTeacher={selectedTeacherForJustify}
        onSave={justifyAbsence}
      />

      {/* Modal 3: Cartão de Identificação Docente com QR Code */}
      <TeacherCredentialModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        credential={selectedCredential}
      />
    </div>
  );
}
