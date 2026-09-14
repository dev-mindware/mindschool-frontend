"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useHealthStore } from "@/stores/school/health-store";
import { ClinicVisitRecord, ClinicVisitStatus, HealthUrgencyLevel } from "@/types";
import { toast } from "sonner";

interface ClinicVisitsViewProps {
  onOpenNewVisit: () => void;
  onPrintVisit: (visit: ClinicVisitRecord) => void;
}

export function ClinicVisitsView({
  onOpenNewVisit,
  onPrintVisit,
}: ClinicVisitsViewProps) {
  const { visits, updateClinicVisitStatus } = useHealthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("ALL");

  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.symptoms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === "ALL" || v.status === selectedStatus;

    const matchesUrgency =
      selectedUrgency === "ALL" || v.urgencyLevel === selectedUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getUrgencyBadge = (level: HealthUrgencyLevel) => {
    switch (level) {
      case "CRITICAL":
      case "URGENT":
        return <Badge variant="destructive">Urgente / Emergência</Badge>;
      case "MODERATE":
        return <Badge variant="warning">Moderado</Badge>;
      case "ROUTINE":
      default:
        return <Badge variant="secondary">Rotina / Ligeiro</Badge>;
    }
  };

  const getStatusBadge = (status: ClinicVisitStatus) => {
    switch (status) {
      case "UNDER_OBSERVATION":
        return (
          <Badge variant="info" className="animate-pulse">
            Em Observação
          </Badge>
        );
      case "DISCHARGED_TO_CLASS":
        return (
          <Badge variant="success">
            Retorno à Aula
          </Badge>
        );
      case "SENT_HOME":
        return (
          <Badge variant="warning">
            Enviado p/ Casa
          </Badge>
        );
      case "REFERRED_TO_HOSPITAL":
        return (
          <Badge variant="destructive">
            Encaminhado ao Hospital
          </Badge>
        );
    }
  };

  const handleQuickStatusChange = (
    visitId: string,
    newStatus: ClinicVisitStatus,
    studentName: string
  ) => {
    updateClinicVisitStatus(visitId, newStatus);
    toast.success(`Estado do atendimento de ${studentName} actualizado.`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Icon
              name="Search"
              className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Pesquisar por aluno, processo, queixa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[160px] text-xs h-8">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Estados</SelectItem>
              <SelectItem value="UNDER_OBSERVATION">Em Observação</SelectItem>
              <SelectItem value="DISCHARGED_TO_CLASS">Retorno à Aula</SelectItem>
              <SelectItem value="SENT_HOME">Enviado p/ Casa</SelectItem>
              <SelectItem value="REFERRED_TO_HOSPITAL">Encaminhado Hospital</SelectItem>
            </SelectContent>
          </Select>

          {/* Urgency Filter */}
          <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
            <SelectTrigger className="w-[150px] text-xs h-8">
              <SelectValue placeholder="Gravidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as Gravidades</SelectItem>
              <SelectItem value="ROUTINE">Rotina</SelectItem>
              <SelectItem value="MODERATE">Moderado</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
              <SelectItem value="CRITICAL">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onOpenNewVisit} className="gap-1.5 text-xs h-8 shrink-0">
          <Icon name="Plus" className="size-3.5" />
          Registar Atendimento
        </Button>
      </div>

      {/* Visits Table */}
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-3">Protocolo</th>
                <th className="py-2.5 px-3">Estudante</th>
                <th className="py-2.5 px-3">Turma</th>
                <th className="py-2.5 px-3">Queixa / Sintomas</th>
                <th className="py-2.5 px-3">Gravidade</th>
                <th className="py-2.5 px-3">Sinais Vitais</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Icon name="HeartPulse" className="size-8 mx-auto mb-2 opacity-40" />
                    Nenhum atendimento na enfermaria encontrado com estes filtros.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] font-medium text-primary">
                      {v.visitNumber}
                      <span className="block text-[10px] text-muted-foreground font-sans">
                        {new Date(v.recordedAt).toLocaleTimeString("pt-AO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">{v.studentName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {v.studentNumber}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {v.classLevel}
                      <span className="block text-[10px]">{v.sectionName}</span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[260px]">
                      <div className="font-medium text-foreground truncate" title={v.chiefComplaint}>
                        {v.chiefComplaint}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex flex-wrap gap-1 mt-0.5">
                        {v.symptoms.slice(0, 3).map((sym, idx) => (
                          <span key={idx} className="bg-muted px-1.5 py-0.2 rounded text-[9px]">
                            {sym}
                          </span>
                        ))}
                        {v.symptoms.length > 3 && (
                          <span className="text-[9px]">+{v.symptoms.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {getUrgencyBadge(v.urgencyLevel)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground font-mono">
                      {v.vitalSigns?.temperatureCelsius ? (
                        <span className={v.vitalSigns.temperatureCelsius >= 38 ? "text-red-600 font-medium" : ""}>
                          🌡️ {v.vitalSigns.temperatureCelsius}ºC
                        </span>
                      ) : (
                        "—"
                      )}
                      {v.vitalSigns?.bloodPressure && (
                        <span className="block text-[10px]">TA: {v.vitalSigns.bloodPressure}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {v.status === "UNDER_OBSERVATION" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-success hover:bg-success-muted"
                            title="Dar alta e retornar à sala de aula"
                            onClick={() =>
                              handleQuickStatusChange(v.id, "DISCHARGED_TO_CLASS", v.studentName)
                            }
                          >
                            <Icon name="Check" className="size-3.5 mr-1" />
                            Alta
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2"
                          title="Imprimir Guia Oficial de Encaminhamento A4"
                          onClick={() => onPrintVisit(v)}
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
