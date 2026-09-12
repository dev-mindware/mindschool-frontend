"use client";

import React, { useState } from "react";
import { useSecretaryRequestStore } from "@/stores/school/secretary-request-store";
import { RequestsTable } from "./requests-table";
import { NewRequestModal } from "./new-request-modal";
import { ProtocolSlipModal } from "./protocol-slip-modal";
import { SecretaryRequest } from "@/types";
import { Button, Icon, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function SecretaryRequestsContent() {
  const { requests } = useSecretaryRequestStore();
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [newlyCreatedRequest, setNewlyCreatedRequest] = useState<SecretaryRequest | null>(null);

  // Metrics
  const totalCount = requests.length;
  const pendingDirectorCount = requests.filter((r) => r.status === "PENDING_DIRECTOR").length;
  const readyCount = requests.filter((r) => r.status === "READY_FOR_PICKUP").length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;

  const handleRequestCreated = (req: SecretaryRequest) => {
    setNewlyCreatedRequest(req);
    setSlipModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Secretaria Digital"
        suTitle="Tramitação de processos, certidões e requerimentos escolares."
      >
        <Button onClick={() => setNewModalOpen(true)} className="gap-2 shadow-xs text-xs">
          <Icon name="FilePlus" className="size-4" />
          Novo Requerimento
        </Button>
      </TitleList>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${totalCount}`}
          subtitle="Processos Registados"
          description="Total tramitado no ano lectivo"
          icon="Files"
        />

        <DynamicMetricCard
          title={`${pendingDirectorCount} Processos`}
          subtitle="Aguardando Despacho"
          description="Pendente de parecer da Direcção"
          icon="Clock"
          colors={pendingDirectorCount > 0 ? "default" : "default"}
        />

        <DynamicMetricCard
          title={`${readyCount} Documentos`}
          subtitle="Prontos para Entrega"
          description="Aguardam levantamento na secretaria"
          icon="CheckCheck"
        />

        <DynamicMetricCard
          title={`${completedCount}`}
          subtitle="Entregues / Concluídos"
          description="Processos arquivados com recibo"
          icon="Archive"
        />
      </div>

      {/* Main Table */}
      <RequestsTable onOpenNewModal={() => setNewModalOpen(true)} />

      {/* New Request Modal */}
      <NewRequestModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onSuccess={handleRequestCreated}
      />

      {/* Auto Protocol Slip Modal on creation */}
      <ProtocolSlipModal
        open={slipModalOpen}
        onOpenChange={setSlipModalOpen}
        request={newlyCreatedRequest}
      />
    </div>
  );
}
