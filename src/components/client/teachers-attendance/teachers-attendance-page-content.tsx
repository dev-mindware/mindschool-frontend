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

import { usePlanUpgradeModal, isPlanRestrictedError } from '@/stores/plan/use-plan-upgrade-modal-store';
import { useAuthStore } from '@/stores';
import { isEntitled } from '@/lib/plan-access';

export function TeachersAttendancePageContent() {
  const { attendanceLogs, credentials, registerScan, justifyAbsence, getMetrics } = useTeacherAttendance();
  const user = useAuthStore((s) => s.user);
  const planModal = usePlanUpgradeModal();

  const entitled = isEntitled({ feature: "teacher_attendance", minPlan: "profissional" }, user?.company?.subscription);

  const requireProfessionalPlan = (actionName?: string): boolean => {
    if (!entitled) {
      planModal.open({
        featureName: "Assiduidade Docente",
        requiredPlan: "profissional",
        description: `O recurso de Assiduidade Docente (${actionName || "controlo de ponto via QR"}) não faz parte do seu plano actual. Actualize para o plano Profissional para aceder a esta funcionalidade.`,
      });
      return false;
    }
    return true;
  };

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
    if (!requireProfessionalPlan("Justificar Falta")) return;
    setSelectedTeacherForJustify(log);
    setIsJustifyOpen(true);
  };

  const handleOpenCard = (teacherId: string) => {
    if (!requireProfessionalPlan("Credencial Docente")) return;
    setSelectedCardTeacherId(teacherId);
    setIsCardModalOpen(true);
  };

  const handleRegisterScan = async (code: string) => {
    try {
      return await registerScan(code, 'PORTAO-PRINCIPAL-01');
    } catch (err: unknown) {
      if (isPlanRestrictedError(err)) {
        setIsScannerOpen(false);
        planModal.open({
          featureName: "Assiduidade Docente",
          requiredPlan: "profissional",
          description: "O registo de assiduidade docente via terminal QR exige o plano Profissional. Faça upgrade da sua subscrição para desbloquear esta funcionalidade.",
        });
        return { success: false, type: 'CHECK_IN' as const, teacherName: '', time: '', message: 'Plano insuficiente.' };
      }
      throw err;
    }
  };

  const handleJustifyAbsence = async (id: string, reason: string, docUrl?: string) => {
    try {
      await justifyAbsence(id, reason, docUrl);
    } catch (err: unknown) {
      if (isPlanRestrictedError(err)) {
        setIsJustifyOpen(false);
        planModal.open({
          featureName: "Assiduidade Docente",
          requiredPlan: "profissional",
          description: "A justificação de faltas de professores exige o plano Profissional. Faça upgrade da sua subscrição para desbloquear esta funcionalidade.",
        });
        return;
      }
      throw err;
    }
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
          variant="outline"
          size="sm"
          onClick={() => {
            if (!requireProfessionalPlan("O meu QR")) return;
            setIsMyQrOpen(true);
          }}
          className="gap-2 shadow-xs text-xs"
        >
          <Icon name="QrCode" className="size-4" />
          O meu QR
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            if (!requireProfessionalPlan("Terminal de Ponto QR")) return;
            setIsScannerOpen(true);
          }}
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
        onScan={handleRegisterScan}
      />

      <MyQrModal isOpen={isMyQrOpen} onClose={() => setIsMyQrOpen(false)} />

      {/* Modal 2: Justificação de Ausência */}
      <JustifyAbsenceModal
        isOpen={isJustifyOpen}
        onClose={() => setIsJustifyOpen(false)}
        selectedTeacher={selectedTeacherForJustify}
        onSave={handleJustifyAbsence}
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
