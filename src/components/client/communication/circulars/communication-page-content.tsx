"use client";

import React, { useState } from "react";
import { useCircularStore } from "@/stores/school/circular-store";
import { CircularsFeed } from "./circulars-feed";
import { NewCircularModal } from "./new-circular-modal";
import { Button, Icon, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function CommunicationPageContent() {
  const { circulars } = useCircularStore();
  const [newModalOpen, setNewModalOpen] = useState(false);

  // Metrics
  const totalCount = circulars.length;
  const meetingsCount = circulars.filter((c) => c.type === "MEETING_CONVOCATION").length;
  const urgentCount = circulars.filter((c) => c.isUrgent).length;

  // Average read rate
  const totalRecipients = circulars.reduce((acc, c) => acc + c.totalRecipients, 0);
  const totalReads = circulars.reduce((acc, c) => acc + c.readCount, 0);
  const globalReachPercent = Math.round((totalReads / Math.max(1, totalRecipients)) * 100);

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Circulares & Comunicados"
        suTitle="Comunicação institucional da direcção e convocatórias com RSVP."
      >
        <Button onClick={() => setNewModalOpen(true)} className="gap-2 shadow-xs text-xs">
          <Icon name="Plus" className="size-4" />
          Nova Circular
        </Button>
      </TitleList>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${totalCount}`}
          subtitle="Circulares Publicadas"
          description="Total emitido no ano lectivo"
          icon="Files"
        />

        <DynamicMetricCard
          title={`${meetingsCount} Reuniões`}
          subtitle="Convocatórias de Pais"
          description="Sessões de encarregados com RSVP"
          icon="Calendar"
        />

        <DynamicMetricCard
          title={`${globalReachPercent}%`}
          subtitle="Taxa Média de Abertura"
          description="Alcance nos canais digitais e portal"
          icon="Eye"
        />

        <DynamicMetricCard
          title={`${urgentCount} Alertas`}
          subtitle="Comunicados Urgentes"
          description="Avisos e tolerâncias de ponto"
          icon="TriangleAlert"
          colors={urgentCount > 0 ? "default" : "default"}
        />
      </div>

      {/* Feed of Circulars */}
      <CircularsFeed onOpenNewModal={() => setNewModalOpen(true)} />

      {/* New Circular Modal */}
      <NewCircularModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
      />
    </div>
  );
}
