"use client";

import { useState, useEffect, useCallback } from "react";

export type KeepColor = "amber" | "sky" | "emerald" | "violet" | "rose" | "neutral";

export interface KeepChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface LessonKeepNote {
  lessonId: string;
  title: string;
  content: string;
  homework: string;
  color: KeepColor;
  isPinned: boolean;
  checklist: KeepChecklistItem[];
  updatedAt: string;
}

const STORAGE_PREFIX = "mindschool_keep_note_";

export const KEEP_COLOR_MAP: Record<
  KeepColor,
  { bg: string; border: string; text: string; label: string; dot: string }
> = {
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800/40",
    text: "text-amber-900 dark:text-amber-200",
    label: "Amarelo Suave",
    dot: "bg-amber-400",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/20",
    border: "border-sky-200 dark:border-sky-800/40",
    text: "text-sky-900 dark:text-sky-200",
    label: "Azul Céu",
    dot: "bg-sky-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
    text: "text-emerald-900 dark:text-emerald-200",
    label: "Verde Esmeralda",
    dot: "bg-emerald-400",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800/40",
    text: "text-violet-900 dark:text-violet-200",
    label: "Violeta",
    dot: "bg-violet-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-800/40",
    text: "text-rose-900 dark:text-rose-200",
    label: "Rosa Pastel",
    dot: "bg-rose-400",
  },
  neutral: {
    bg: "bg-card dark:bg-muted/30",
    border: "border-border",
    text: "text-foreground",
    label: "Padrão",
    dot: "bg-muted-foreground",
  },
};

export function getLessonKeepNote(lessonId: string): LessonKeepNote | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${lessonId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLessonKeepNote(note: LessonKeepNote): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${note.lessonId}`, JSON.stringify(note));
    window.dispatchEvent(new CustomEvent("mindschool-keep-updated", { detail: { lessonId: note.lessonId } }));
  } catch {
    // silent fail
  }
}

export function useLessonKeep(lessonId?: string) {
  const [note, setNote] = useState<LessonKeepNote | null>(() =>
    lessonId ? getLessonKeepNote(lessonId) : null
  );

  const reload = useCallback(() => {
    if (!lessonId) return;
    setNote(getLessonKeepNote(lessonId));
  }, [lessonId]);

  useEffect(() => {
    reload();
    function onStorage(e: StorageEvent | CustomEvent) {
      reload();
    }
    window.addEventListener("storage", onStorage as EventListener);
    window.addEventListener("mindschool-keep-updated", onStorage as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage as EventListener);
      window.removeEventListener("mindschool-keep-updated", onStorage as EventListener);
    };
  }, [lessonId, reload]);

  return { note, save: saveLessonKeepNote, reload };
}
