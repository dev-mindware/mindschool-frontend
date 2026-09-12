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
import { useCircularStore } from "@/stores/school/circular-store";
import { CircularType, AudienceType, SchoolCircular } from "@/types";
import { toast } from "sonner";

interface NewCircularModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newCirc: SchoolCircular) => void;
}

export function NewCircularModal({ open, onOpenChange, onSuccess }: NewCircularModalProps) {
  const { publishCircular } = useCircularStore();

  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [type, setType] = useState<CircularType>("MEETING_CONVOCATION");
  const [audience, setAudience] = useState<AudienceType>("ALL_SCHOOL");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [rsvpEnabled, setRsvpEnabled] = useState<boolean>(true);

  // Meeting / Event details
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [eventTime, setEventTime] = useState<string>("09:30");
  const [eventLocation, setEventLocation] = useState<string>("Salão Nobre do Colégio");
  const [agenda, setAgenda] = useState<string>("");

  const [authorName, setAuthorName] = useState<string>("Dr. Alberto Manuel Domingos");
  const [authorRole, setAuthorRole] = useState<string>("Director Geral");

  const getTypeLabel = (t: CircularType) => {
    switch (t) {
      case "MEETING_CONVOCATION":
        return "Convocatória de Reunião de Pais";
      case "ACADEMIC_NOTICE":
        return "Circular Pedagógica";
      case "ADMINISTRATIVE_NOTICE":
        return "Aviso Administrativo";
      case "URGENT_ALERT":
        return "Alerta Urgente da Direcção";
      case "EVENT_ACTIVITY":
        return "Evento ou Actividade Cultural";
    }
  };

  const getAudienceLabel = (a: AudienceType) => {
    switch (a) {
      case "ALL_SCHOOL":
        return "Toda a Comunidade Escolar";
      case "PRIMARY":
        return "Ensino Primário";
      case "FIRST_CYCLE":
        return "I Ciclo do Ensino Secundário";
      case "SECOND_CYCLE":
        return "II Ciclo Geral / Técnico";
      case "SPECIFIC_CLASS":
        return "Turma Específica";
      case "TEACHERS_ONLY":
        return "Apenas Corpo Docente";
      case "GUARDIANS_ONLY":
        return "Apenas Encarregados de Educação";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Preencha o título e o conteúdo da circular.");
      return;
    }

    const agendaItems = agenda.trim()
      ? agenda.split("\n").filter((l) => l.trim().length > 0)
      : undefined;

    const newCirc = publishCircular({
      title,
      subtitle: subtitle || undefined,
      content,
      type,
      typeLabel: getTypeLabel(type),
      audience,
      audienceLabel: getAudienceLabel(audience),
      isUrgent,
      eventDate: type === "MEETING_CONVOCATION" || type === "EVENT_ACTIVITY" ? eventDate : undefined,
      eventTime: type === "MEETING_CONVOCATION" || type === "EVENT_ACTIVITY" ? eventTime : undefined,
      eventLocation: type === "MEETING_CONVOCATION" || type === "EVENT_ACTIVITY" ? eventLocation : undefined,
      agendaItems,
      rsvpEnabled: type === "MEETING_CONVOCATION" ? rsvpEnabled : false,
      authorName,
      authorRole,
      totalRecipients: audience === "ALL_SCHOOL" ? 420 : 120,
    });

    toast.success(`Circular ${newCirc.circularNumber} publicada e difundida com sucesso!`);
    onOpenChange(false);
    if (onSuccess) onSuccess(newCirc);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name={"Megaphone" as any} className="size-4 text-primary" />
            Redigir e Publicar Circular Oficial
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title and Subtitle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Título da Circular:
            </label>
            <Input
              placeholder="Ex: Convocatória para Assembleia Geral de Pais e Encarregados..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Subtítulo / Ementa Institucional:
            </label>
            <Input
              placeholder="Ex: Apresentação dos Resultados Pedagógicos do 2º Trimestre"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          {/* Type and Audience */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Classificação / Tipo:
              </label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEETING_CONVOCATION">Convocatória de Reunião de Pais</SelectItem>
                  <SelectItem value="ACADEMIC_NOTICE">Circular Pedagógica (Avaliações)</SelectItem>
                  <SelectItem value="ADMINISTRATIVE_NOTICE">Aviso Administrativo</SelectItem>
                  <SelectItem value="URGENT_ALERT">Alerta Urgente da Direcção</SelectItem>
                  <SelectItem value="EVENT_ACTIVITY">Evento ou Actividade Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Público-Alvo / Destinatários:
              </label>
              <Select value={audience} onValueChange={(val: any) => setAudience(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_SCHOOL">Toda a Comunidade Escolar</SelectItem>
                  <SelectItem value="PRIMARY">Ensino Primário (1ª à 6ª)</SelectItem>
                  <SelectItem value="FIRST_CYCLE">I Ciclo do Ensino Secundário</SelectItem>
                  <SelectItem value="SECOND_CYCLE">II Ciclo Geral / Técnico</SelectItem>
                  <SelectItem value="GUARDIANS_ONLY">Apenas Encarregados de Educação</SelectItem>
                  <SelectItem value="TEACHERS_ONLY">Apenas Corpo Docente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting / Event fields if applicable */}
          {(type === "MEETING_CONVOCATION" || type === "EVENT_ACTIVITY") && (
            <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Icon name={"Calendar" as any} className="size-3.5" />
                Dados do Encontro / Reunião
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Data:</label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Hora:</label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Local:</label>
                  <Input
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">
                  Ponto de Ordem / Agenda da Sessão (1 por linha):
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background p-2 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[60px]"
                  placeholder="1. Abertura e boas-vindas&#10;2. Balanço pedagógico&#10;3. Diversos"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                />
              </div>

              {type === "MEETING_CONVOCATION" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rsvpCheck"
                    checked={rsvpEnabled}
                    onChange={(e) => setRsvpEnabled(e.target.checked)}
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="rsvpCheck" className="text-xs text-foreground cursor-pointer font-medium">
                    Activar Confirmação Obrigatória de Presença pelos Encarregados (RSVP)
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Body Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Texto Integral da Circular:
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[110px]"
              placeholder="Redija aqui os parágrafos do comunicado oficial..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Author info & Urgent tag */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subscrito por (Direcção):
              </label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="urgentCheck"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="size-4 rounded border-border text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="urgentCheck" className="text-xs text-rose-600 font-semibold cursor-pointer">
                Marcar como Alerta Urgente (Destaque Vermelho)
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Publicar Circular
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
