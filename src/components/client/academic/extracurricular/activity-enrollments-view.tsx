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
import { ActivityEnrollment } from "@/types";
import { toast } from "sonner";

interface ActivityEnrollmentsViewProps {
  onPrintCertificate: (enrollment: ActivityEnrollment) => void;
  onOpenEnrollment: () => void;
}

export function ActivityEnrollmentsView({
  onPrintCertificate,
  onOpenEnrollment,
}: ActivityEnrollmentsViewProps) {
  const { enrollments, activities, addStudentAchievement } = useExtracurricularStore();

  const [selectedActivityId, setSelectedActivityId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const activityOptions = [
    { value: "ALL", label: "Todas as Actividades" },
    ...activities.map((a) => ({ value: a.id, label: a.name })),
  ];

  const hasFilter = Boolean(searchTerm.trim() || selectedActivityId !== "ALL");

  const handleClear = () => {
    setSearchTerm("");
    setSelectedActivityId("ALL");
  };

  const filteredEnrollments = enrollments.filter((e) => {
    const matchActivity =
      selectedActivityId === "ALL" || e.activityId === selectedActivityId;
    const matchSearch =
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.classLevel.toLowerCase().includes(searchTerm.toLowerCase());

    return matchActivity && matchSearch;
  });

  const handlePromptAchievement = (enrollmentId: string, studentName: string) => {
    const title = window.prompt(`Registar conquista / menção honrosa para ${studentName}:`);
    if (title && title.trim()) {
      addStudentAchievement(enrollmentId, title.trim());
      toast.success("Conquista registada com sucesso!");
    }
  };

  return (
    <div className="space-y-4">
      {/* MindGest Standard Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchHandlerWrapper
          search={searchTerm}
          setSearch={setSearchTerm}
          placeholder="Pesquisar por aluno, turma, modalidade..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Clube"
            icon="Layers"
            options={activityOptions}
            value={selectedActivityId === "ALL" ? null : selectedActivityId}
            onChange={(val) => setSelectedActivityId(val ?? "ALL")}
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

          <Button onClick={onOpenEnrollment} className="gap-1.5 text-xs h-10 shadow-xs">
            <Icon name="Plus" className="size-3.5" />
            Nova Inscrição
          </Button>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-3">Estudante</th>
                <th className="py-2.5 px-3">Turma</th>
                <th className="py-2.5 px-3">Clube / Modalidade</th>
                <th className="py-2.5 px-3">Data Inscrição</th>
                <th className="py-2.5 px-3">Destaques / Conquistas</th>
                <th className="py-2.5 px-3">Encarregado</th>
                <th className="py-2.5 px-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Icon name="Sparkles" className="size-8 mx-auto mb-2 opacity-40" />
                    Nenhuma inscrição encontrada com estes filtros.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{enr.studentName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {enr.studentNumber}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {enr.classLevel}
                      <span className="block text-[10px]">{enr.sectionName}</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {enr.activityName}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground text-[11px]">
                      {enr.enrolledAt}
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      {enr.achievements && enr.achievements.length > 0 ? (
                        <div className="space-y-0.5">
                          {enr.achievements.map((ach, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-[10px] bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30 truncate block max-w-full"
                              title={ach}
                            >
                              🏆 {ach}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                      <div>{enr.guardianName}</div>
                      <span className="text-[10px] font-mono">{enr.guardianPhone}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                          title="Registar Menção Honrosa ou Conquista"
                          onClick={() => handlePromptAchievement(enr.id, enr.studentName)}
                        >
                          <Icon name="Award" className="size-3.5 mr-1" />
                          Prémio
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          title="Imprimir Certificado de Mérito Extracurricular A4"
                          onClick={() => onPrintCertificate(enr)}
                        >
                          <Icon name="Printer" className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
