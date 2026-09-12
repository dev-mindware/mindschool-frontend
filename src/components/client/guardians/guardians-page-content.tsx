"use client";

import React, { useState } from "react";
import { TitleList } from "@/components/common/title-list";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useGuardians } from "@/hooks/school/use-guardians";
import { GuardiansList } from "./guardians-list";
import { GuardianModal } from "./guardian-modal";
import { PreferredContactChannel } from "@/types";

export function GuardiansPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<
    PreferredContactChannel | "ALL"
  >("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    guardians,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage,
    goToPreviousPage,
    counts,
  } = useGuardians(searchQuery, channelFilter);

  const hasActiveFilters = channelFilter !== "ALL" || Boolean(searchQuery);

  const handleClearFilters = () => {
    setChannelFilter("ALL");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header com TitleList e Botão de Ação */}
      <TitleList
        title="Encarregados de Educação"
        suTitle="Cadastro, preferências de notificação e acompanhamento de educandos."
      >
        <Button
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 shrink-0 shadow-xs"
        >
          <Icon name="UserPlus" className="size-4" />
          Cadastrar Encarregado
        </Button>
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

      {/* Barra de Filtros e Pesquisa – Padrão MindGest */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80 shadow-xs">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={setSearchQuery}
          placeholder="Pesquisar por nome, telefone ou BI..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Canal"
            icon="ListFilter"
            options={[
              { label: "Todos os Canais", value: "ALL" },
              { label: "WhatsApp", value: "WHATSAPP" },
              { label: "SMS Tradicional", value: "SMS" },
              { label: "E-mail", value: "EMAIL" },
              { label: "Chamada Telefónica", value: "PHONE_CALL" },
            ]}
            value={channelFilter === "ALL" ? null : channelFilter}
            onChange={(val) =>
              setChannelFilter((val ?? "ALL") as PreferredContactChannel | "ALL")
            }
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="mr-1 size-3.5" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de Encarregados */}
      <GuardiansList
        guardians={guardians}
        total={total}
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
      />

      {/* Modal de Registo de Encarregado */}
      <GuardianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
