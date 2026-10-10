'use client';

import React, { useState } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { useTeacherAttendance } from '@/hooks/school/use-teacher-attendance';
import { TeacherAttendanceLog } from '@/types/teacher-attendance';
import { TeachersAttendanceMetrics } from './teachers-attendance-metrics';
import { TeachersAttendanceTable } from './teachers-attendance-table';
import { AttendanceQrScannerModal } from './attendance-qr-scanner-modal';
import { JustifyAbsenceModal } from './justify-absence-modal';
import { MyQrModal } from './my-qr-modal';
import { TeacherCredentialModal } from './teacher-credential-modal';

export function TeachersAttendancePageContent() {
  const { attendanceLogs, credentials, registerScan, justifyAbsence, getMetrics } = useTeacherAttendance();

  const metrics = getMetrics();

  // Modais
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isMyQrOpen, setIsMyQrOpen] = useState(false);

  // Professor selecionado para justificativa e cartão
  const [selectedTeacherForJustify, setSelectedTeacherForJustify] = useState<TeacherAttendanceLog | null>(null);
  const [selectedCardTeacherId, setSelectedCardTeacherId] = useState<string | null>(null);

  const handleOpenJustify = (log: TeacherAttendanceLog) => {
    setSelectedTeacherForJustify(log);
    setIsJustifyOpen(true);
  };

  const handleOpenCard = (teacherId: string) => {
    setSelectedCardTeacherId(teacherId);
    setIsCardModalOpen(true);
  };

  const selectedCredential = credentials.find((c) => c.teacherId === selectedCardTeacherId);

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Assiduidade & Presença Docente"
        suTitle="Registo rápido e auditável de entradas, saídas e tempos letivos via QR Code."
      >
        <Button variant="outline" size="sm" onClick={() => setIsMyQrOpen(true)} className="gap-2 shadow-xs text-xs">
          <Icon name="QrCode" className="size-4" />
          O meu QR
        </Button>
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

      <TeachersAttendanceTable logs={attendanceLogs} onOpenCard={handleOpenCard} onOpenJustify={handleOpenJustify} />

      {/* Modal 1: Terminal de Ponto QR */}
      <AttendanceQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(code) => registerScan(code, 'PORTAO-PRINCIPAL-01')}
      />

      <MyQrModal isOpen={isMyQrOpen} onClose={() => setIsMyQrOpen(false)} />

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
