"use client";

import { Can, Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { useModal } from "@/stores/modal/use-modal-store";
import { ActivityCatalogView } from "./activity-catalog-view";
import { ActivityEnrollmentsView } from "./activity-enrollments-view";
import { ActivityWeekView } from "./activity-week-view";
import { NewActivityModal } from "./new-activity-modal";
import { ActivityEnrollmentModal } from "./activity-enrollment-modal";

export interface CertificateTarget {
  studentName: string;
  activityName: string;
  enrolledAt: string;
}

export function ExtracurricularPageContent() {
  const { metrics } = useExtracurricular();
  const { openModal } = useModal();

  return (
    <div className="space-y-6">
      <TitleList title="Atividades Extracurriculares" suTitle="Clubes escolares e desporto: horário, responsável, lotação e inscrições.">
        <div className="flex items-center gap-2">
          <Can permission="activity:write"><Button size="sm" variant="outline" className="gap-1.5" onClick={() => openModal("activity-enroll")}><Icon name="UserPlus" className="size-4" />Inscrever aluno</Button></Can>
          <Can permission="activity:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("activity-new")}><Icon name="Plus" className="size-4" />Nova atividade</Button></Can>
        </div>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={metrics.open} subtitle="Atividades abertas" description="Com inscrições a decorrer" icon="Trophy" />
        <DynamicMetricCard title={metrics.enrolled} subtitle="Inscrições ativas" description="Alunos inscritos" icon="Users" />
        <DynamicMetricCard title={metrics.capacity} subtitle="Vagas totais" description="Lotação das atividades abertas" icon="Layers" />
        <DynamicMetricCard title={metrics.free} subtitle="Vagas livres" description="Para novas inscrições" icon="CircleCheck" />
      </div>

      <Tabs defaultValue="catalog" className="space-y-2">
        <TabsList>
          <TabsTrigger value="catalog" className="gap-1.5"><Icon name="Trophy" className="size-4" />Catálogo</TabsTrigger>
          <TabsTrigger value="week" className="gap-1.5"><Icon name="CalendarRange" className="size-4" />Semana</TabsTrigger>
          <TabsTrigger value="enrollments" className="gap-1.5"><Icon name="Users" className="size-4" />Inscrições</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog"><ActivityCatalogView /></TabsContent>
        <TabsContent value="week" className="pt-6"><ActivityWeekView /></TabsContent>
        <TabsContent value="enrollments"><ActivityEnrollmentsView /></TabsContent>
      </Tabs>

      <NewActivityModal />
      <ActivityEnrollmentModal />
    </div>
  );
}
