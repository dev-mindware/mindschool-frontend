"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Can, Icon } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useGuardians } from "@/hooks/school/use-guardians";
import { GuardiansList } from "./guardians-list";
import { GuardianModal } from "./guardian-modal";

export function GuardiansPageContent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { allGuardians, counts, isLoading, isError } = useGuardians();

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <TitleList
        title="Encarregados de Educação"
        suTitle="Cadastro, preferências de notificação e acompanhamento de educandos."
      >
        <Can permission="guardian:write">
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0 shadow-xs"
        >
          <Icon name="UserPlus" className="size-4" />
          Cadastrar Encarregado
        </Button>
        </Can>
      </TitleList>

      {/* Cartões de Métricas no Padrão MindGest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={counts.total}
          subtitle="Total Encarregados"
          description="Pais e tutores registados"
          icon="Users"
        />
        <DynamicMetricCard
          title={counts.whatsapp}
          subtitle="Preferência WhatsApp"
          description="Canal de notificação instantânea"
          icon="MessageSquare"
        />
        <DynamicMetricCard
          title={counts.sms}
          subtitle="Preferência SMS"
          description="Alertas por mensagem de texto"
          icon="Smartphone"
        />
        <DynamicMetricCard
          title={counts.email}
          subtitle="Notificação E-mail"
          description="Relatórios e avisos formais"
          icon="Mail"
        />
      </div>

      <GuardiansList guardians={allGuardians} isLoading={isLoading} isError={isError} />

      {/* Modal de Registo de Encarregado */}
      <GuardianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
