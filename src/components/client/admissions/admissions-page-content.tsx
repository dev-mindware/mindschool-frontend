"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Icon, StatusLegend } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { ApplicationsList } from "./applications-list";
import { CandidateApplicationDrawer } from "./candidate-application-drawer";

export function AdmissionsPageContent() {
  const { applications, entranceExams } = useAdmissions();

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
          description="Inscrições submetidas neste ano letivo"
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

      <StatusLegend
        title="Como avança uma candidatura"
        items={[
          { label: "Submetida", description: "Recebida, com os documentos por validar.", next: "validar os documentos (menu da candidatura)." },
          { label: "Docs Validados", description: "Documentos conferidos pela secretaria.", next: "lançar a nota da prova de acesso, se a classe a exige, e depois o despacho da Direção." },
          { label: "Em Avaliação", description: "Aguarda nota e/ou decisão.", next: "despacho da Direção Pedagógica (aprovar, lista de espera ou não admitir)." },
          { label: "Aprovado", description: "Admitido e com vaga.", next: "converter em aluno e matrícula (cria a ficha, a matrícula e as propinas)." },
          { label: "Lista de Espera", description: "Aprovado, mas sem vaga na classe. É promovido sozinho quando uma matrícula é anulada ou a capacidade aumenta; também se pode promover à mão.", next: "aguardar vaga." },
          { label: "Não Admitido", description: "Candidatura encerrada: nota abaixo do mínimo, ausência à prova ou decisão da Direção." },
          { label: "Matriculado", description: "Já é aluno: converteu-se em matrícula." },
          { label: "Desistente", description: "O candidato desistiu; liberta a vaga se a tinha." },
        ]}
      />
      <ApplicationsList applications={applications} entranceExams={entranceExams} />

      {/* Drawer de Nova Candidatura (MindGest UX Standard: formulário com scroll reside em Drawer) */}
      <CandidateApplicationDrawer
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
}
