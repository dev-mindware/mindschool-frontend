"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useTransportStore } from "@/stores/school/transport-store";
import { RouteShift, TransportStop } from "@/types";
import { toast } from "sonner";

interface NewRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRouteModal({ open, onOpenChange }: NewRouteModalProps) {
  const { vehicles, addRoute } = useTransportStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shift, setShift] = useState<RouteShift>("BOTH");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [monitorName, setMonitorName] = useState("");
  const [monitorPhone, setMonitorPhone] = useState("");
  const [stops, setStops] = useState<Omit<TransportStop, "id">[]>([
    { order: 1, name: "Paragem Inicial", estimatedPickupTime: "06:20", estimatedDropoffTime: "13:30" },
    { order: 2, name: "Campus MindSchool", estimatedPickupTime: "07:15", estimatedDropoffTime: "14:30" },
  ]);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  const handleVehicleChange = (id: string) => {
    setVehicleId(id);
    const veh = vehicles.find((v) => v.id === id);
    if (veh) {
      setDriverName(veh.driverName);
      setDriverPhone(veh.driverPhone);
      setMonitorName(veh.monitorName);
      setMonitorPhone(veh.monitorPhone);
    }
  };

  const handleAddStop = () => {
    const nextOrder = stops.length + 1;
    setStops([
      ...stops,
      { order: nextOrder, name: `Nova Paragem ${nextOrder}`, estimatedPickupTime: "06:40", estimatedDropoffTime: "14:00" },
    ]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) {
      toast.error("A rota deve ter no mínimo 2 paragens");
      return;
    }
    const updated = stops.filter((_, i) => i !== index).map((s, idx) => ({ ...s, order: idx + 1 }));
    setStops(updated);
  };

  const handleStopChange = (index: number, field: string, val: string) => {
    const updated = [...stops];
    updated[index] = { ...updated[index], [field]: val };
    setStops(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      toast.error("Preencha o código e o nome da rota");
      return;
    }

    if (!selectedVehicle) {
      toast.error("Seleccione uma viatura escolar para a rota");
      return;
    }

    addRoute({
      code,
      name,
      shift,
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plateNumber,
      driverName: driverName || selectedVehicle.driverName,
      driverPhone: driverPhone || selectedVehicle.driverPhone,
      monitorName: monitorName || selectedVehicle.monitorName,
      monitorPhone: monitorPhone || selectedVehicle.monitorPhone,
      maxCapacity: selectedVehicle.capacity,
      isActive: true,
      stops: stops.map((s, idx) => ({
        ...s,
        id: `stp-${Date.now()}-${idx}`,
      })),
    });

    toast.success(`Rota ${code} criada com sucesso!`);
    onOpenChange(false);

    // Reset
    setCode("");
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="Bus" className="size-5 text-primary" />
            Criar Nova Rota de Transporte Escolar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identificação da Rota */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="Código da Rota *"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: ROTA-04"
                className="font-mono text-xs"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Nome do Itinerário *"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Benfica • Morro Bento • Samba"
                className="text-xs"
                required
              />
            </div>
          </div>

          {/* Viatura & Turno */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Viatura / Autocarro *</label>
              <Select value={vehicleId} onValueChange={handleVehicleChange}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Seleccione a viatura" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plateNumber} — {v.model} ({v.capacity} lug.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-medium text-foreground">Turno de Operação</label>
              <Select value={shift} onValueChange={(val) => setShift(val as RouteShift)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOTH">Ambos os Turnos (Manhã & Tarde)</SelectItem>
                  <SelectItem value="MORNING">Apenas Turno da Manhã</SelectItem>
                  <SelectItem value="AFTERNOON">Apenas Turno da Tarde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded p-3 bg-muted/15">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Motorista Responsável</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Nome do motorista"
                className="w-full px-2 py-1 border rounded bg-background text-xs"
              />
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="Telemóvel do motorista"
                className="w-full px-2 py-1 border rounded bg-background text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Monitor(a) de Acompanhamento</label>
              <input
                type="text"
                value={monitorName}
                onChange={(e) => setMonitorName(e.target.value)}
                placeholder="Nome da monitora"
                className="w-full px-2 py-1 border rounded bg-background text-xs"
              />
              <input
                type="text"
                value={monitorPhone}
                onChange={(e) => setMonitorPhone(e.target.value)}
                placeholder="Telemóvel da monitora"
                className="w-full px-2 py-1 border rounded bg-background text-xs font-mono"
              />
            </div>
          </div>

          {/* Paragens */}
          <div className="space-y-2 border rounded p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Paragens da Rota ({stops.length})</span>
              <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleAddStop}>
                <Icon name="Plus" className="size-3" />
                Adicionar Paragem
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded border bg-muted/10">
                  <span className="font-bold text-primary w-4">{stop.order}.</span>
                  <input
                    type="text"
                    value={stop.name}
                    onChange={(e) => handleStopChange(idx, "name", e.target.value)}
                    placeholder="Nome da paragem"
                    className="flex-1 px-2 py-1 border rounded bg-background text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={stop.estimatedPickupTime}
                    onChange={(e) => handleStopChange(idx, "estimatedPickupTime", e.target.value)}
                    placeholder="06:30"
                    className="w-16 px-1.5 py-1 border rounded bg-background text-xs font-mono text-center"
                    title="Horário de Recolha"
                  />
                  <input
                    type="text"
                    value={stop.estimatedDropoffTime}
                    onChange={(e) => handleStopChange(idx, "estimatedDropoffTime", e.target.value)}
                    placeholder="14:00"
                    className="w-16 px-1.5 py-1 border rounded bg-background text-xs font-mono text-center"
                    title="Horário de Larga"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => handleRemoveStop(idx)}
                  >
                    <Icon name="Trash2" className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Criar Rota
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
