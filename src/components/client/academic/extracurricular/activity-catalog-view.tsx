"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
} from "@/components";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { useExtracurricularStore } from "@/stores/school/extracurricular-store";
import { ActivityCategory } from "@/types";

interface ActivityCatalogViewProps {
  onOpenEnrollment: (activityId?: string) => void;
  onOpenNewActivity: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "Todas as Categorias" },
  { value: "TECHNOLOGY_STEM", label: "Robótica & STEM" },
  { value: "ACADEMIC_CHESS", label: "Xadrez & Cognição" },
  { value: "SPORTS", label: "Desporto Escolar" },
  { value: "ARTS_CULTURE", label: "Artes & Cultura" },
];

export function ActivityCatalogView({
  onOpenEnrollment,
  onOpenNewActivity,
}: ActivityCatalogViewProps) {
  const { activities } = useExtracurricularStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("ALL");

  const hasFilter = Boolean(searchTerm.trim() || selectedCat !== "ALL");

  const handleClear = () => {
    setSearchTerm("");
    setSelectedCat("ALL");
  };

  const filteredActivities = activities.filter((a) => {
    const matchesCat = selectedCat === "ALL" || a.category === selectedCat;
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: ActivityCategory) => {
    switch (cat) {
      case "TECHNOLOGY_STEM":
        return <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">Robótica & STEM</Badge>;
      case "ACADEMIC_CHESS":
        return <Badge variant="outline" className="border-border text-foreground text-[10px]">Xadrez & Cognição</Badge>;
      case "SPORTS":
        return <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">Desporto</Badge>;
      case "ARTS_CULTURE":
        return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px]">Artes</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">Clube</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* MindGest Standard Search and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchHandlerWrapper
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Pesquisar por modalidade, instrutor, local..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Categoria"
            icon="Layers"
            options={CATEGORY_OPTIONS}
            value={selectedCat === "ALL" ? null : selectedCat}
            onChange={(val) => setSelectedCat(val ?? "ALL")}
          />

          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}

          <Button
            size="sm"
            onClick={onOpenNewActivity}
            className="gap-1.5 text-xs h-10 shadow-xs"
          >
            <Icon name="Plus" className="size-3.5" />
            Nova Modalidade
          </Button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((act) => {
          const occupancyRate = Math.round((act.enrolledCount / act.maxCapacity) * 100);
          const isFull = act.enrolledCount >= act.maxCapacity;

          return (
            <div
              key={act.id}
              className="p-4 rounded-lg border bg-card hover:border-primary/40 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block">{act.code}</span>
                    <h3 className="font-semibold text-sm text-foreground">
                      {act.name}
                    </h3>
                  </div>
                  {getCategoryBadge(act.category)}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {act.description}
                </p>

                {/* Occupancy bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Inscrições:</span>
                    <span className={`font-semibold ${isFull ? "text-destructive" : "text-foreground"}`}>
                      {act.enrolledCount} / {act.maxCapacity} alunos ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? "bg-destructive" : occupancyRate > 80 ? "bg-amber-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Details box */}
                <div className="text-xs bg-muted/20 p-2.5 rounded border space-y-1">
                  <div><strong>Instrutor:</strong> {act.instructorName}</div>
                  <div><strong>Horário:</strong> {act.scheduleDays} ({act.scheduleTime})</div>
                  <div><strong>Local:</strong> {act.location}</div>
                  <div><strong>Público:</strong> {act.targetGrades}</div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t flex items-center justify-between">
                <Button
                  size="sm"
                  className="w-full text-xs h-8 gap-1.5"
                  disabled={isFull}
                  onClick={() => onOpenEnrollment(act.id)}
                >
                  <Icon name="Sparkles" className="size-3.5" />
                  {isFull ? "Vagas Esgotadas" : "Inscrever Estudante"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
