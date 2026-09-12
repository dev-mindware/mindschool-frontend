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
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useExtracurricularStore } from "@/stores/school/extracurricular-store";
import { ActivityCategory } from "@/types";
import { toast } from "sonner";

interface NewActivityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewActivityModal({ open, onOpenChange }: NewActivityModalProps) {
  const { addActivity } = useExtracurricularStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ActivityCategory>("SPORTS");
  const [description, setDescription] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [instructorPhone, setInstructorPhone] = useState("");
  const [scheduleDays, setScheduleDays] = useState("Terças e Quintas-feiras");
  const [scheduleTime, setScheduleTime] = useState("15:00 - 16:30");
  const [location, setLocation] = useState("Pavilhão Gimnodesportivo");
  const [targetGrades, setTargetGrades] = useState("7ª à 12ª Classe");
  const [maxCapacity, setMaxCapacity] = useState("25");

  const getCategoryLabel = (cat: ActivityCategory) => {
    switch (cat) {
      case "SPORTS": return "Desporto Escolar";
      case "TECHNOLOGY_STEM": return "Ciência, Robótica & Programação";
      case "ACADEMIC_CHESS": return "Xadrez & Estratégia Cognitiva";
      case "ARTS_CULTURE": return "Artes & Expressão Cultural";
      case "MUSIC": return "Música & Coral Escolar";
      case "LANGUAGES": return "Línguas Estrangeiras & Comunicação";
      default: return "Actividade Geral";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim() || !instructorName.trim()) {
      toast.error("Preencha o código, o nome e o instrutor da actividade");
      return;
    }

    addActivity({
      code,
      name,
      category,
      categoryLabel: getCategoryLabel(category),
      description,
      instructorName,
      instructorPhone,
      scheduleDays,
      scheduleTime,
      location,
      targetGrades,
      maxCapacity: parseInt(maxCapacity, 10) || 20,
      isActive: true,
    });

    toast.success(`Actividade ${name} criada com sucesso!`);
    onOpenChange(false);

    // Reset
    setCode("");
    setName("");
    setDescription("");
    setInstructorName("");
    setInstructorPhone("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="Plus" className="size-5 text-primary" />
            Criar Novo Clube ou Modalidade Extracurricular
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label="Código *"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: ACT-JUD-01"
                className="font-mono text-xs"
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Nome da Actividade / Clube *"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Escola de Judo & Autodefesa"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Categoria *</label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as ActivityCategory)}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPORTS">Desporto Escolar (Futebol, Basquetebol, Judo)</SelectItem>
                <SelectItem value="TECHNOLOGY_STEM">Ciência, Robótica & Programação STEAM</SelectItem>
                <SelectItem value="ACADEMIC_CHESS">Xadrez & Estratégia Cognitiva</SelectItem>
                <SelectItem value="ARTS_CULTURE">Artes, Teatro & Cultura Angolana</SelectItem>
                <SelectItem value="MUSIC">Música, Canto Coral & Instrumentos</SelectItem>
                <SelectItem value="LANGUAGES">Línguas Estrangeiras (Inglês, Francês)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="font-medium text-foreground">Descrição Pedagógica</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectivos formativos, competências trabalhadas e metodologia..."
              className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Instrutor(a) / Mestre *</label>
              <input
                type="text"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                placeholder="Nome do treinador/professor"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">Telemóvel do Instrutor</label>
              <input
                type="text"
                value={instructorPhone}
                onChange={(e) => setInstructorPhone(e.target.value)}
                placeholder="+244 923 000 000"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Dias de Treino / Oficinas</label>
              <input
                type="text"
                value={scheduleDays}
                onChange={(e) => setScheduleDays(e.target.value)}
                placeholder="Ex: Segundas e Quartas"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">Horário</label>
              <input
                type="text"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                placeholder="Ex: 15:30 - 17:00"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium text-foreground">Local / Espaço Físico</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Sala de Expressão, Campo Sintético"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-foreground">Lotação Máxima (Vagas)</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="25"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Criar Clube
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
