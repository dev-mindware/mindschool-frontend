"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    // Sincroniza também com o sumário/conteúdo no backend se a função for fornecida
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
        "rounded-xl border p-4 sm:p-5 transition-colors space-y-4 shadow-xs",
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
            className="text-sm font-semibold border-none bg-transparent shadow-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "h-8 w-8 rounded-full",
              isPinned
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isPinned ? "Fixado na agenda de hoje" : "Fixar na agenda de hoje"}
          >
            <Icon name="Pin" className={cn("w-4 h-4", isPinned && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Mini Editor de Notas */}
      <div className="space-y-1.5">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escreva aqui as suas anotações rápidas, tópicos-chave da aula ou orientações pedagógicas..."
          className="min-h-[90px] text-xs resize-y border-none bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg p-3 leading-relaxed"
        />
      </div>

      {/* Checklist Dinâmica do Google Keep */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-foreground/80">
          <span className="flex items-center gap-1.5">
            <Icon name="CheckSquare" className="w-3.5 h-3.5 text-primary" />
            Roteiro da Aula (Checklist de Tarefas)
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {checklist.filter((c) => c.done).length}/{checklist.length} concluídos
          </span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-background/40 group transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Checkbox
                  checked={item.done}
                  onCheckedChange={() => handleToggleItem(item.id)}
                  id={`chk-${item.id}`}
                  className="rounded"
                />
                <label
                  htmlFor={`chk-${item.id}`}
                  className={cn(
                    "text-xs cursor-pointer select-none truncate transition-all",
                    item.done
                      ? "line-through text-muted-foreground opacity-60"
                      : "text-foreground"
                  )}
                >
                  {item.text}
                </label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive rounded"
              >
                <Icon name="X" className="w-3 h-3" />
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
            className="h-8 text-xs bg-background/50 border-none shadow-none rounded-md px-2.5 focus-visible:ring-1 focus-visible:ring-primary/40"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddChecklistItem}
            className="h-8 px-2.5 text-xs shrink-0"
          >
            Adicionar
          </Button>
        </div>
      </div>

      {/* TPC / Tarefa para Casa */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
          <Icon name="BookOpen" className="w-3.5 h-3.5 text-primary" />
          Trabalho de Casa (TPC) / Leituras
        </label>
        <Input
          value={homework}
          onChange={(e) => setHomework(e.target.value)}
          placeholder="ex: Resolver exercícios da página 45 a 48 do manual escolar"
          className="h-8 text-xs bg-background/50 border-none shadow-none rounded-md px-2.5 focus-visible:ring-1 focus-visible:ring-primary/40"
        />
      </div>

      {/* Barra Inferior com Cores do Keep e Salvar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Seletor de Cores */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground mr-1">Cor:</span>
          {(Object.keys(KEEP_COLOR_MAP) as KeepColor[]).map((cKey) => {
            const item = KEEP_COLOR_MAP[cKey];
            const isSelected = color === cKey;
            return (
              <button
                key={cKey}
                type="button"
                onClick={() => setColor(cKey)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-all",
                  item.dot,
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 scale-110"
                    : "opacity-80 hover:opacity-100 hover:scale-105"
                )}
                title={item.label}
              />
            );
          })}
        </div>

        {/* Botão Salvar */}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          className="h-8 px-3.5 text-xs font-medium gap-1.5"
        >
          <Icon name="Save" className="w-3.5 h-3.5" />
          Guardar no Keep
        </Button>
      </div>
    </div>
  );
}
