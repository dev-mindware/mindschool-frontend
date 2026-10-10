"use client";

import { Can, Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useHealth } from "@/hooks/school/use-health";
import { useModal } from "@/stores/modal/use-modal-store";
import { ClinicVisitsView } from "./clinic-visits-view";
import { StudentHealthDirectoryView } from "./student-health-directory-view";
import { PsychopedagogicalView } from "./psychopedagogical-view";
import { NewClinicVisitModal } from "./new-clinic-visit-modal";

export function HealthPageContent() {
  const { metrics, visitsForbidden } = useHealth();
  const { openModal } = useModal();

  return (
    <div className="space-y-6">
      <TitleList title="Saúde & Apoio Psicopedagógico" suTitle="Enfermaria escolar, fichas clínicas e acompanhamento psicopedagógico. Dados confidenciais: o acesso é restrito e auditado.">
        {!visitsForbidden && (
          <Can permission="health:write"><Button size="sm" onClick={() => openModal("health-new-visit")} className="gap-2"><Icon name="Plus" className="size-4" />Novo atendimento</Button></Can>
        )}
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={metrics.visits} subtitle="Atendimentos na enfermaria" description={`${metrics.today} hoje`} icon="HeartPulse" />
        <DynamicMetricCard title={metrics.notNotified} subtitle="Sem aviso ao encarregado" description="Atendimentos com encarregado por avisar" icon="TriangleAlert" colors={metrics.notNotified > 0 ? "destructive" : "default"} />
        <DynamicMetricCard title={metrics.openCases} subtitle="Casos em acompanhamento" description="Psicopedagogia em curso" icon="BrainCircuit" />
        <DynamicMetricCard title="Restrito" subtitle="Acesso confidencial" description="Só perfis autorizados leem estes dados" icon="ShieldCheck" />
      </div>

      <Tabs defaultValue="visits" className="space-y-2">
        <TabsList>
          <TabsTrigger value="visits" className="gap-1.5"><Icon name="Cross" className="size-4" />Enfermaria</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-1.5"><Icon name="FileHeart" className="size-4" />Fichas clínicas</TabsTrigger>
          <TabsTrigger value="aee" className="gap-1.5"><Icon name="BrainCircuit" className="size-4" />Psicopedagogia</TabsTrigger>
        </TabsList>
        <TabsContent value="visits"><ClinicVisitsView /></TabsContent>
        <TabsContent value="profiles"><StudentHealthDirectoryView /></TabsContent>
        <TabsContent value="aee"><PsychopedagogicalView /></TabsContent>
      </Tabs>

      <NewClinicVisitModal />
    </div>
  );
}
