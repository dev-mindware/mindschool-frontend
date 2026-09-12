"use client";

import React, { useState } from "react";
import { useCircularStore } from "@/stores/school/circular-store";
import { SchoolCircular, CircularType } from "@/types";
import { Badge, Button, Icon } from "@/components";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { CircularPrintModal } from "./circular-print-modal";
import { RsvpTrackerModal } from "./rsvp-tracker-modal";

interface CircularsFeedProps {
  onOpenNewModal: () => void;
}

export function CircularsFeed({ onOpenNewModal }: CircularsFeedProps) {
  const {
    circulars,
    searchQuery,
    typeFilter,
    setSearchQuery,
    setTypeFilter,
  } = useCircularStore();

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedPrintCircular, setSelectedPrintCircular] = useState<SchoolCircular | null>(null);

  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedRsvpCircular, setSelectedRsvpCircular] = useState<SchoolCircular | null>(null);

  const filteredCirculars = circulars.filter((c) => {
    if (typeFilter !== "ALL" && c.type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.circularNumber.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchContent = c.content.toLowerCase().includes(q);
      return matchNum || matchTitle || matchContent;
    }

    return true;
  });

  const handlePrint = (c: SchoolCircular) => {
    setSelectedPrintCircular(c);
    setPrintModalOpen(true);
  };

  const handleOpenRsvp = (c: SchoolCircular) => {
    setSelectedRsvpCircular(c);
    setRsvpModalOpen(true);
  };

  const getTypeBadge = (type: CircularType) => {
    switch (type) {
      case "MEETING_CONVOCATION":
        return <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px]">Convocatória</Badge>;
      case "ACADEMIC_NOTICE":
        return <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px]">Pedagógica</Badge>;
      case "URGENT_ALERT":
        return <Badge variant="destructive" className="text-[10px]">Urgente</Badge>;
      case "ADMINISTRATIVE_NOTICE":
        return <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">Administrativo</Badge>;
      case "EVENT_ACTIVITY":
      default:
        return <Badge variant="secondary" className="text-[10px]">Actividade</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* MindGest Standard Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={setSearchQuery}
          placeholder="Pesquisar por título, número ou palavra-chave..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Tipo"
            icon="ListFilter"
            options={[
              { value: "ALL", label: "Todas as Circulares" },
              { value: "MEETING_CONVOCATION", label: "Convocatórias de Pais" },
              { value: "ACADEMIC_NOTICE", label: "Circulares Pedagógicas" },
              { value: "URGENT_ALERT", label: "Alertas Urgentes" },
              { value: "ADMINISTRATIVE_NOTICE", label: "Avisos Administrativos" },
              { value: "EVENT_ACTIVITY", label: "Actividades / Eventos" },
            ]}
            value={typeFilter === "ALL" ? null : typeFilter}
            onChange={(val) => setTypeFilter((val as CircularType) ?? "ALL")}
          />

          {(searchQuery.trim() || typeFilter !== "ALL") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("ALL");
              }}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Feed of Cards */}
      <div className="space-y-4">
        {filteredCirculars.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/40 text-muted-foreground text-sm">
            Nenhuma circular encontrada para esta pesquisa.
          </div>
        ) : (
          filteredCirculars.map((circ) => {
            const confirmedRsvp = circ.rsvpList?.filter((r) => r.status === "CONFIRMED").length || 0;
            const totalRsvp = circ.rsvpList?.length || 0;

            return (
              <div
                key={circ.id}
                className={`p-5 rounded-xl border bg-card shadow-xs space-y-4 transition-all hover:border-primary/40 ${
                  circ.isUrgent ? "border-destructive/30 bg-destructive/5" : "border-border/70"
                }`}
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-primary">
                      {circ.circularNumber}
                    </span>
                    {getTypeBadge(circ.type)}
                    <Badge variant="outline" className="text-[10px] font-normal">
                      Público: {circ.audienceLabel}
                    </Badge>
                    {circ.isUrgent && (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <Icon name="TriangleAlert" className="size-2.5" />
                        Urgente
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    Publicado em {new Date(circ.publishedAt.slice(0, 10)).toLocaleDateString("pt-PT")}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground">
                    {circ.title}
                  </h3>
                  {circ.subtitle && (
                    <p className="text-xs text-muted-foreground font-medium">
                      {circ.subtitle}
                    </p>
                  )}
                </div>

                {/* Content excerpt */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3">
                  {circ.content}
                </p>

                {/* Event banner if meeting */}
                {circ.eventDate && (
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Icon name={"Calendar" as any} className="size-3.5 text-primary" />
                        {new Date(circ.eventDate).toLocaleDateString("pt-PT")} às {circ.eventTime}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon name={"MapPin" as any} className="size-3.5" />
                        {circ.eventLocation}
                      </span>
                    </div>

                    {circ.rsvpEnabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Presenças Confirmadas: <strong>{confirmedRsvp}/{totalRsvp}</strong>
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRsvp(circ)}
                          className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Icon name="SquareCheck" className="size-3" />
                          Gerir Presenças (RSVP)
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>Subscrito por: <strong className="text-foreground">{circ.authorName}</strong> ({circ.authorRole})</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Icon name={"Eye" as any} className="size-3.5" />
                      {circ.readCount} leituras ({Math.round((circ.readCount / Math.max(1, circ.totalRecipients)) * 100)}% alcance)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrint(circ)}
                      className="gap-1.5 text-xs shadow-xs"
                    >
                      <Icon name={"Printer" as any} className="size-3.5" />
                      Imprimir Folha A4
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Print Modal */}
      <CircularPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        circular={selectedPrintCircular}
      />

      {/* RSVP Tracker Modal */}
      <RsvpTrackerModal
        open={rsvpModalOpen}
        onOpenChange={setRsvpModalOpen}
        circular={selectedRsvpCircular}
      />
    </div>
  );
}
