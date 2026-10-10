"use client";

import { Can, Button, Icon, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { useModal } from "@/stores/modal/use-modal-store";
import { RequestsTable } from "./requests-table";
import { NewRequestModal } from "./new-request-modal";

export function SecretaryRequestsContent() {
  const { counts } = useSecretaryRequests();
  const { openModal } = useModal();

  return (
    <div className="space-y-6">
      <TitleList title="Secretaria Digital" suTitle="Requerimentos com número de protocolo: declarações, certificados, 2.ª vias e transferências.">
        <Can permission="request:write"><Button onClick={() => openModal("request-new")} className="gap-2"><Icon name="FilePlus" className="size-4" />Novo requerimento</Button></Can>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={counts.total} subtitle="Processos registados" description="Total tramitado" icon="Files" />
        <DynamicMetricCard title={counts.open} subtitle="Por tratar" description="Submetidos, ainda sem análise" icon="Clock" />
        <DynamicMetricCard title={counts.inReview} subtitle="Em análise" description="A ser tratados pela secretaria" icon="Search" />
        <DynamicMetricCard title={counts.done} subtitle="Concluídos" description="Resolvidos e comunicados ao requerente" icon="CheckCheck" />
      </div>

      <RequestsTable />
      <NewRequestModal />
    </div>
  );
}
