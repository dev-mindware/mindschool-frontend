"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  KeepColor,
  KEEP_COLOR_MAP,
  LessonKeepNote,
  saveLessonKeepNote,
  getLessonKeepNote,
} from "./use-lesson-keep";
import { SucessMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";
import type { ApiLesson } from "@/services/lessons-service";

interface LessonKeepEditorProps {
  lesson: ApiLesson;
  onSaveSuccess?: () => void;
  onSyncRemote?: (data: { content: string; objectives?: string; homework?: string }) => void;
}

export function LessonKeepEditor({
  lesson,
  onSaveSuccess,
  onSyncRemote,
}: LessonKeepEditorProps) {
  const existingNote = getLessonKeepNote(lesson.id);

  const [title, setTitle] = useState(
    existingNote?.title || `${lesson.subject.name}: Plano de Aula`
  );
  const [content, setContent] = useState(existingNote?.content || "");
  const [homework, setHomework] = useState(existingNote?.homework || "");
  const [color, setColor] = useState<KeepColor>(existingNote?.color || "amber");
  const [isPinned, setIsPinned] = useState(existingNote?.isPinned ?? true);
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>(
    existingNote?.checklist || [
      { id: "1", text: "Verificação de presenças / chamada", done: false },
      { id: "2", text: "Correção das tarefas anteriores", done: false },
      { id: "3", text: "Exposição do novo tema da aula", done: false },
      { id: "4", text: "Exercícios práticos em sala", done: false },
    ]
  );
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    const loaded = getLessonKeepNote(lesson.id);
    if (loaded) {
      setTitle(loaded.title);
      setContent(loaded.content);
      setHomework(loaded.homework);
      setColor(loaded.color);
      setIsPinned(loaded.isPinned);
      setChecklist(loaded.checklist);
    }
  }, [lesson.id]);

  function handleAddChecklistItem() {
    if (!newItemText.trim()) return;
    setChecklist((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newItemText.trim(), done: false },
    ]);
    setNewItemText("");
  }

  function handleToggleItem(id: string) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }

  function handleRemoveItem(id: string) {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    const noteData: LessonKeepNote = {
      lessonId: lesson.id,
      title: title.trim() || `${lesson.subject.name} - Plano`,
      content: content.trim(),
      homework: homework.trim(),
      color,
      isPinned,
      checklist,
      updatedAt: new Date().toISOString(),
    };

    saveLessonKeepNote(noteData);

    if (onSyncRemote) {
      const summaryText = [
        content.trim(),
        checklist.length > 0
          ? `\nRoteiro da Aula:\n` +
            checklist.map((c) => `${c.done ? "[x]" : "[ ]"} ${c.text}`).join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      onSyncRemote({
        content: summaryText || "Aula leccionada conforme plano.",
        objectives: title.trim(),
        homework: homework.trim(),
      });
    }

    SucessMessage("Plano e notas gravados com sucesso!");
    onSaveSuccess?.();
  }

  const activeTheme = KEEP_COLOR_MAP[color] || KEEP_COLOR_MAP.amber;

  return (
    <div
      className={cn(
        "space-y-4 rounded-xs border p-4 shadow-xs transition-colors sm:p-5",
        activeTheme.bg,
        activeTheme.border
      )}
    >
      {/* Barra Superior estilo Google Keep */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do Plano da Aula..."
            className="border-none bg-transparent px-0 text-sm font-semibold shadow-none placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "size-8 rounded-full",
              isPinned
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isPinned ? "Fixado na agenda de hoje" : "Fixar na agenda de hoje"}
          >
            <Icon name="Pin" className={cn("size-4", isPinned && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Mini Editor de Notas */}
      <div className="space-y-1.5">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva aqui as suas anotações rápidas, tópicos-chave da aula ou orientações pedagógicas..."
          className="min-h-[90px] resize-y rounded-xs border-none bg-background/50 p-3 text-xs leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/40"
        />
      </div>

      {/* Checklist Dinâmica do Google Keep */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-foreground/80">
          <span className="flex items-center gap-1.5">
            <Icon name="CheckSquare" className="size-3.5 text-primary" />
            Roteiro da Aula (Checklist de Tarefas)
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {checklist.filter((c) => c.done).length}/{checklist.length} concluídos
          </span>
        </div>

        <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between gap-2 rounded-xs p-1.5 transition-colors hover:bg-background/40"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => handleToggleItem(item.id)}
                  id={`chk-${item.id}`}
                  className="rounded"
                />
                <Label
                  htmlFor={`chk-${item.id}`}
                  className={cn(
                    "cursor-pointer select-none truncate text-xs font-normal transition-all",
                    item.done
                      ? "text-muted-foreground line-through opacity-60"
                      : "text-foreground"
                  )}
                >
                  {item.text}
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
                className="size-6 rounded text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
              >
                <Icon name="X" className="size-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Input para adicionar item à checklist */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddChecklistItem();
              }
            }}
            placeholder="+ Adicionar item ao roteiro..."
            className="h-8 rounded-xs border-none bg-background/50 px-2.5 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddChecklistItem}
            className="h-8 shrink-0 px-2.5 text-xs"
          >
            Adicionar
          </Button>
        </div>
      </div>

      {/* TPC / Tarefa para Casa */}
      <div className="space-y-1">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
          <Icon name="BookOpen" className="size-3.5 text-primary" />
          Trabalho de Casa (TPC) / Leituras
        </Label>
        <Input
          value={homework}
          onChange={(e) => setHomework(e.target.value)}
          placeholder="ex: Resolver exercícios da página 45 a 48 do manual escolar"
          className="h-8 rounded-xs border-none bg-background/50 px-2.5 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
        />
      </div>

      {/* Barra Inferior com Cores do Keep e Salvar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-[11px] text-muted-foreground">Cor:</span>
          {(Object.keys(KEEP_COLOR_MAP) as KeepColor[]).map((cKey) => {
            const item = KEEP_COLOR_MAP[cKey];
            const isSelected = color === cKey;
            return (
              <Button
                key={cKey}
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setColor(cKey)}
                className={cn(
                  "size-5 rounded-full border p-0 transition-all",
                  item.dot,
                  isSelected
                    ? "scale-110 ring-2 ring-primary ring-offset-2"
                    : "opacity-80 hover:scale-105 hover:opacity-100"
                )}
                title={item.label}
              />
            );
          })}
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          className="h-8 gap-1.5 px-3.5 text-xs font-medium"
        >
          <Icon name="Save" className="size-3.5" />
          Guardar no Keep
        </Button>
      </div>
    </div>
  );
}
