"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { ApplicationsList } from "./applications-list";
import { CandidateApplicationModal } from "./candidate-application-modal";

export function AdmissionsPageContent() {
  const { applications } = useAdmissions();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Counts for DynamicMetricCards
  const counts = useMemo(() => {
    return {
      total: applications.length,
      pendingExam: applications.filter(
        (a) => a.requiresEntranceExam && a.examScore === undefined && a.status !== "REJECTED" && a.status !== "WITHDRAWN"
      ).length,
      approved: applications.filter((a) => a.status === "APPROVED").length,
      waitlist: applications.filter((a) => a.status === "WAITLIST").length,
      enrolled: applications.filter((a) => a.status === "ENROLLED").length,
    };
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Ações Rápidas */}
      <TitleList
        title="Candidaturas & Admissões"
        suTitle="Gestão do processo de pré-inscrições, validação documental e provas de acesso."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admissions/exams">
            <Button variant="outline" size="sm" className="gap-2 shadow-xs">
              <Icon name="FileText" className="size-4 text-muted-foreground" />
              Provas de Acesso
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => setIsNewModalOpen(true)}
            className="gap-2 shrink-0 shadow-xs"
          >
            <Icon name="UserPlus" className="size-4" />
            Nova Candidatura
          </Button>
        </div>
      </TitleList>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total de Candidaturas"
          icon="GraduationCap"
          description="Inscrições submetidas neste ano lectivo"
        />
        <DynamicMetricCard
          title={counts.pendingExam}
          subtitle="Provas de Acesso Pendentes"
          icon="Clock"
          description="Aguardando realização ou nota do exame"
        />
        <DynamicMetricCard
          title={counts.approved}
          subtitle="Candidatos Aprovados"
          icon="CircleCheck"
          description="Aptos para matrícula imediata em 1 clique"
        />
        <DynamicMetricCard
          title={counts.waitlist}
          subtitle="Em Lista de Espera"
          icon="Users"
          description="Ordenados por pontuação de exame"
        />
      </div>

      <ApplicationsList applications={applications} />

      {/* Modal de Nova Candidatura */}
      <CandidateApplicationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
}
