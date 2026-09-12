"use client";

import React, { useState } from "react";
import { useHealthStore } from "@/stores/school/health-store";
import { ClinicVisitsView } from "./clinic-visits-view";
import { StudentHealthDirectoryView } from "./student-health-directory-view";
import { PsychopedagogicalView } from "./psychopedagogical-view";
import { NewClinicVisitModal } from "./new-clinic-visit-modal";
import { HealthProfileModal } from "./health-profile-modal";
import { MedicalReportPrintModal } from "./medical-report-print-modal";
import { StudentHealthProfile, ClinicVisitRecord } from "@/types";
import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function HealthPageContent() {
  const { visits, profiles, plans } = useHealthStore();

  const [activeTab, setActiveTab] = useState<string>("VISITS");
  const [newVisitModalOpen, setNewVisitModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState<StudentHealthProfile | null>(null);
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState<ClinicVisitRecord | null>(null);

  // Metrics
  const totalVisits = visits.length;
  const underObservation = visits.filter((v) => v.status === "UNDER_OBSERVATION").length;
  const criticalOrUrgent = visits.filter((v) => v.urgencyLevel === "CRITICAL" || v.urgencyLevel === "URGENT").length;
  const activePlans = plans.filter((p) => p.isActive).length;
  const profilesWithAlerts = profiles.filter(
    (p) => p.allergies.length > 0 || p.chronicConditions.length > 0
  ).length;

  const handleOpenProfile = (profile: StudentHealthProfile) => {
    setSelectedProfile(profile);
    setProfileModalOpen(true);
  };

  const handlePrintProfileReport = (profile: StudentHealthProfile) => {
    setSelectedProfile(profile);
    setSelectedVisitForPrint(null);
    setPrintModalOpen(true);
  };

  const handlePrintVisitReport = (visit: ClinicVisitRecord) => {
    setSelectedVisitForPrint(visit);
    const profile = profiles.find((p) => p.studentId === visit.studentId) || null;
    setSelectedProfile(profile);
    setPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Saúde & Apoio Psicopedagógico"
        suTitle="Enfermaria escolar, triagem clínica e planos de inclusão (NEE/AEE)."
      >
        <Button
          size="sm"
          onClick={() => setNewVisitModalOpen(true)}
          className="gap-2 shadow-xs text-xs"
        >
          <Icon name="Plus" className="size-4" />
          Novo Atendimento
        </Button>
      </TitleList>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${totalVisits} Atendimentos`}
          subtitle="Enfermaria Escolar"
          description={`${underObservation} aluno(s) em observação no momento`}
          icon="HeartPulse"
        />

        <DynamicMetricCard
          title={`${profilesWithAlerts} Alunos`}
          subtitle="Alertas Médicos Crónicos"
          description="Alergias graves, asma e patologias crónicas"
          icon="TriangleAlert"
        />

        <DynamicMetricCard
          title={`${activePlans} Casos Activos`}
          subtitle="Apoio Psicopedagógico (AEE)"
          description="Planos de adaptação curricular em curso"
          icon="BrainCircuit"
        />

        <DynamicMetricCard
          title={`${criticalOrUrgent} Casos`}
          subtitle="Urgências & Encaminhamentos"
          description="Atendimentos com triagem de gravidade elevada"
          icon="Activity"
          colors={criticalOrUrgent > 0 ? "destructive" : "default"}
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-[540px]">
          <TabsTrigger value="VISITS" className="gap-1.5 text-xs">
            <Icon name="Cross" className="size-3.5 text-red-500" />
            Enfermaria Escolar
          </TabsTrigger>
          <TabsTrigger value="PROFILES" className="gap-1.5 text-xs">
            <Icon name="FileHeart" className="size-3.5" />
            Fichas Clínicas
          </TabsTrigger>
          <TabsTrigger value="AEE" className="gap-1.5 text-xs">
            <Icon name="BrainCircuit" className="size-3.5" />
            Psicopedagogia (AEE)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="VISITS" className="space-y-4">
          <ClinicVisitsView
            onOpenNewVisit={() => setNewVisitModalOpen(true)}
            onPrintVisit={handlePrintVisitReport}
          />
        </TabsContent>

        <TabsContent value="PROFILES" className="space-y-4">
          <StudentHealthDirectoryView
            onOpenProfile={handleOpenProfile}
            onPrintReport={handlePrintProfileReport}
          />
        </TabsContent>

        <TabsContent value="AEE" className="space-y-4">
          <PsychopedagogicalView />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewClinicVisitModal
        open={newVisitModalOpen}
        onOpenChange={setNewVisitModalOpen}
      />

      <HealthProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        profile={selectedProfile}
        onPrintReport={handlePrintProfileReport}
      />

      <MedicalReportPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        profile={selectedProfile}
        visit={selectedVisitForPrint}
      />
    </div>
  );
}
