"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useTransportStore } from "@/stores/school/transport-store";
import { RouteShift } from "@/types";
import { toast } from "sonner";

interface AssignStudentTransportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedRouteId?: string;
}

const SAMPLE_STUDENTS = [
  { id: "stu-01", number: "MS-2026-0042", name: "Nzuzi Maria Afonso", class: "10ª Classe", section: "Turma 10A", guardian: "Ana Paula Afonso", phone: "+244 923 456 789" },
  { id: "stu-02", number: "MS-2026-0089", name: "Mauro António Gaspar", class: "11ª Classe", section: "Turma 11B", guardian: "António Gaspar", phone: "+244 931 112 233" },
  { id: "stu-03", number: "MS-2026-0105", name: "Esperança Domingos", class: "8ª Classe", section: "Turma 8A", guardian: "Teresa Manuel Domingos", phone: "+244 945 889 900" },
  { id: "stu-04", number: "MS-2026-0120", name: "Joaquim Bernardo Silva", class: "7ª Classe", section: "Turma 7C", guardian: "Helena Silva", phone: "+244 912 345 678" },
  { id: "stu-05", number: "MS-2026-0013", name: "Ana Beatriz Domingos", class: "9ª Classe", section: "Turma 9A", guardian: "Manuel Domingos", phone: "+244 922 778 899" },
  { id: "stu-06", number: "MS-2026-0025", name: "Carlos Daniel Kiala", class: "9ª Classe", section: "Turma 9A", guardian: "Sousa Kiala", phone: "+244 933 445 566" },
];

export function AssignStudentTransportModal({
  open,
  onOpenChange,
  preselectedRouteId,
}: AssignStudentTransportModalProps) {
  const { routes, assignStudentToRoute, assignments } = useTransportStore();

  const [studentId, setStudentId] = useState(SAMPLE_STUDENTS[4].id);
  const [routeId, setRouteId] = useState(preselectedRouteId || routes[0]?.id || "");
  const [stopId, setStopId] = useState("");
  const [shift, setShift] = useState<RouteShift>("BOTH");

  const selectedRoute = routes.find((r) => r.id === routeId) || routes[0];
  const selectedStudent = SAMPLE_STUDENTS.find((s) => s.id === studentId);

  // Auto-set stopId when route changes
  const stops = selectedRoute?.stops || [];
  const activeStopId = stopId || (stops[0]?.id ?? "");

  const handleRouteSelect = (id: string) => {
    setRouteId(id);
    const r = routes.find((x) => x.id === id);
    if (r && r.stops.length > 0) {
      setStopId(r.stops[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !selectedRoute) {
      toast.error("Seleccione o aluno e a rota");
      return;
    }

    // Check if already assigned
    const alreadyAssigned = assignments.some(
      (a) => a.studentId === selectedStudent.id && a.isActive
    );
    if (alreadyAssigned) {
      toast.error("Este estudante já possui transporte escolar activo atribuído.");
      return;
    }

    // Check capacity
    if (selectedRoute.assignedStudentsCount >= selectedRoute.maxCapacity) {
      toast.error("Esta rota já atingiu a lotação máxima da viatura.");
      return;
    }

    const currentStop = stops.find((s) => s.id === activeStopId) || stops[0];

    assignStudentToRoute({
      studentId: selectedStudent.id,
      studentNumber: selectedStudent.number,
      studentName: selectedStudent.name,
      classLevel: selectedStudent.class,
      sectionName: selectedStudent.section,
      routeId: selectedRoute.id,
      stopId: currentStop.id,
      stopName: currentStop.name,
      shift,
      guardianName: selectedStudent.guardian,
      guardianPhone: selectedStudent.phone,
    });

    toast.success(`${selectedStudent.name} alocado à ${selectedRoute.name}!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="UserPlus" className="size-5 text-primary" />
            Alocar Estudante ao Transporte Escolar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Estudante *</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_STUDENTS.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} — {st.class} ({st.number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Rota de Transporte *</label>
            <Select value={routeId} onValueChange={handleRouteSelect}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.code}: {r.name} ({r.assignedStudentsCount}/{r.maxCapacity} lug.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Paragem de Embarque / Desembarque *</label>
            <Select value={activeStopId} onValueChange={setStopId}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stops.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.order}. {s.name} (Recolha: {s.estimatedPickupTime} | Larga: {s.estimatedDropoffTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Turno Contratado</label>
            <Select value={shift} onValueChange={(val) => setShift(val as RouteShift)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BOTH">Ambos os Trajectos (Ida e Volta)</SelectItem>
                <SelectItem value="MORNING">Apenas Ida (Manhã)</SelectItem>
                <SelectItem value="AFTERNOON">Apenas Volta (Tarde)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="p-3 bg-muted/20 rounded border space-y-1 text-[11px] text-muted-foreground">
              <div><strong>Encarregado(a):</strong> {selectedStudent.guardian}</div>
              <div><strong>Contacto de Emergência / Monitor:</strong> {selectedStudent.phone}</div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Confirmar Alocação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
