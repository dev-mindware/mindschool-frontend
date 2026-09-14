"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
} from "@/components";
import { useHealthStore } from "@/stores/school/health-store";
import { StudentHealthProfile } from "@/types";

interface StudentHealthDirectoryViewProps {
  onOpenProfile: (profile: StudentHealthProfile) => void;
  onPrintReport: (profile: StudentHealthProfile) => void;
}

export function StudentHealthDirectoryView({
  onOpenProfile,
  onPrintReport,
}: StudentHealthDirectoryViewProps) {
  const { profiles } = useHealthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("ALL");

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.classLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.allergies.some((a) => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.chronicConditions.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBlood =
      bloodTypeFilter === "ALL" || p.bloodType === bloodTypeFilter;

    return matchesSearch && matchesBlood;
  });

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Icon
              name="Search"
              className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Pesquisar ficha por aluno, patologia, alergia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {["ALL", "O+", "A+", "B+", "AB+"].map((bt) => (
              <Button
                key={bt}
                size="sm"
                variant={bloodTypeFilter === bt ? "default" : "outline"}
                className="h-8 text-xs px-2.5"
                onClick={() => setBloodTypeFilter(bt)}
              >
                {bt === "ALL" ? "Todos os Tipos" : bt}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredProfiles.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground bg-card rounded-lg border">
            <Icon name="Activity" className="size-8 mx-auto mb-2 opacity-40" />
            Nenhuma ficha clínica encontrada.
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const hasCriticalAlert =
              profile.allergies.length > 0 || profile.chronicConditions.length > 0;

            return (
              <div
                key={profile.studentId}
                className={`p-4 rounded-lg border bg-card transition-all hover:shadow-sm space-y-3 ${
                  hasCriticalAlert ? "border-amber-500/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        {profile.studentName}
                      </h4>
                      <Badge variant="outline" className="font-mono text-[10px] font-medium">
                        🩸 {profile.bloodType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profile.studentNumber} • {profile.classLevel} ({profile.sectionName})
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      title="Imprimir Ficha Médica A4"
                      onClick={() => onPrintReport(profile)}
                    >
                      <Icon name="Printer" className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs px-2.5 gap-1"
                      onClick={() => onOpenProfile(profile)}
                    >
                      <Icon name="FileText" className="size-3.5" />
                      Ver Ficha
                    </Button>
                  </div>
                </div>

                {/* Alerts / Allergies / Conditions */}
                <div className="space-y-1.5 text-xs">
                  {profile.allergies.length > 0 && (
                    <div className="flex items-start gap-1.5 text-red-700 dark:text-red-400">
                      <Icon name="TriangleAlert" className="size-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[11px]">Alergias: </strong>
                        <span>{profile.allergies.join(", ")}</span>
                      </div>
                    </div>
                  )}

                  {profile.chronicConditions.length > 0 && (
                    <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                      <Icon name="HeartPulse" className="size-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[11px]">Patologias: </strong>
                        <span>{profile.chronicConditions.join(", ")}</span>
                      </div>
                    </div>
                  )}

                  {profile.physicalRestrictions.length > 0 && (
                    <div className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                      <Icon name="ShieldAlert" className="size-3.5 shrink-0 mt-0.5" />
                      <span>{profile.physicalRestrictions.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Footer info: Emergency contact & Insurance */}
                <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                  <div>
                    <span className="text-foreground font-medium">Emergência: </span>
                    {profile.emergencyContactName} ({profile.emergencyContactPhone})
                  </div>
                  <div>
                    {profile.healthInsuranceProvider ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {profile.healthInsuranceProvider}
                      </Badge>
                    ) : (
                      <span className="text-[10px] italic">Sem seguro</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
