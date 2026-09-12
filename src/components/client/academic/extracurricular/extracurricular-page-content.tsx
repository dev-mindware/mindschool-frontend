"use client";

import React, { useState } from "react";
import { useExtracurricularStore } from "@/stores/school/extracurricular-store";
import { ActivityCatalogView } from "./activity-catalog-view";
import { ActivityEnrollmentsView } from "./activity-enrollments-view";
import { ActivityAttendanceView } from "./activity-attendance-view";
import { NewActivityModal } from "./new-activity-modal";
import { ActivityEnrollmentModal } from "./activity-enrollment-modal";
import { ActivityCertificatePrintModal } from "./activity-certificate-print-modal";
import { ActivityEnrollment, ExtracurricularActivity } from "@/types";
import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function ExtracurricularPageContent() {
  const { activities, enrollments, attendanceLogs } = useExtracurricularStore();

  const [activeTab, setActiveTab] = useState<string>("CATALOG");
  const [newActivityModalOpen, setNewActivityModalOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedActivityIdForEnroll, setSelectedActivityIdForEnroll] = useState<string | undefined>(undefined);
  const [selectedEnrollmentForCertificate, setSelectedEnrollmentForCertificate] = useState<ActivityEnrollment | null>(null);

  // Metrics
  const activeActivitiesCount = activities.filter((a) => a.isActive).length;
  const activeEnrollmentsCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const totalCapacity = activities.reduce((acc, a) => acc + a.maxCapacity, 0);
  const totalSessionsRecorded = attendanceLogs.length;

  const handleOpenEnrollment = (activityId?: string) => {
    setSelectedActivityIdForEnroll(activityId);
    setEnrollmentModalOpen(true);
  };

  const handlePrintCertificate = (enrollment: ActivityEnrollment) => {
    setSelectedEnrollmentForCertificate(enrollment);
    setCertificateModalOpen(true);
  };

  const targetActivityForCertificate = selectedEnrollmentForCertificate
    ? activities.find((a) => a.id === selectedEnrollmentForCertificate.activityId) || null
    : null;

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Actividades Extracurriculares"
        suTitle="Clubes escolares, desporto, registo de presenças e mérito estudantil."
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenEnrollment()}
            variant="outline"
            className="gap-1.5 shadow-xs text-xs"
          >
            <Icon name="UserPlus" className="size-3.5" />
            Inscrever Aluno
          </Button>

          <Button
            size="sm"
            onClick={() => setNewActivityModalOpen(true)}
            className="gap-1.5 shadow-xs text-xs"
          >
            <Icon name="Plus" className="size-3.5" />
            Novo Clube
          </Button>
        </div>
      </TitleList>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${activeActivitiesCount} Modalidades`}
          subtitle="Clubes & Desportos Activos"
          description="Robótica, Xadrez, Basquetebol, Artes"
          icon="Sparkles"
        />

        <DynamicMetricCard
          title={`${activeEnrollmentsCount} Inscrições`}
          subtitle="Alunos Participantes"
          description="Estudantes em actividades formativas"
          icon="Users"
        />

        <DynamicMetricCard
          title={`${totalCapacity} Vagas`}
          subtitle="Capacidade Total Oferecida"
          description="Lotação distribuída pelas oficinas"
          icon="Award"
        />

        <DynamicMetricCard
          title={`${totalSessionsRecorded} Registos`}
          subtitle="Presenças em Treinos"
          description="Acompanhamento contínuo de assiduidade"
          icon="CalendarCheck"
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-[540px]">
          <TabsTrigger value="CATALOG" className="gap-1.5 text-xs">
            <Icon name="LayoutGrid" className="size-3.5" />
            Catálogo de Clubes
          </TabsTrigger>
          <TabsTrigger value="ENROLLMENTS" className="gap-1.5 text-xs">
            <Icon name="GraduationCap" className="size-3.5" />
            Inscrições & Membros
          </TabsTrigger>
          <TabsTrigger value="ATTENDANCE" className="gap-1.5 text-xs">
            <Icon name="CalendarCheck" className="size-3.5" />
            Presenças & Treinos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="CATALOG" className="space-y-4">
          <ActivityCatalogView
            onOpenEnrollment={handleOpenEnrollment}
            onOpenNewActivity={() => setNewActivityModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="ENROLLMENTS" className="space-y-4">
          <ActivityEnrollmentsView
            onOpenEnrollment={() => handleOpenEnrollment()}
            onPrintCertificate={handlePrintCertificate}
          />
        </TabsContent>

        <TabsContent value="ATTENDANCE" className="space-y-4">
          <ActivityAttendanceView />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewActivityModal
        open={newActivityModalOpen}
        onOpenChange={setNewActivityModalOpen}
      />

      <ActivityEnrollmentModal
        open={enrollmentModalOpen}
        onOpenChange={setEnrollmentModalOpen}
        preselectedActivityId={selectedActivityIdForEnroll}
      />

      <ActivityCertificatePrintModal
        open={certificateModalOpen}
        onOpenChange={setCertificateModalOpen}
        enrollment={selectedEnrollmentForCertificate}
        activity={targetActivityForCertificate}
      />
    </div>
  );
}
