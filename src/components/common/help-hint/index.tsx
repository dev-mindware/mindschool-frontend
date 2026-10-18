"use client";

import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@/components/common/icon";
import { GLOSSARY, type GlossaryKey } from "@/constants/glossary";

type HelpHintProps =
  | { term: GlossaryKey; title?: never; children?: never }
  | { term?: never; title: string; children: ReactNode };

/**
 * Ícone «?» que abre uma explicação curta, ao lado de siglas, indicadores e campos.
 * Com `term` usa o glossário único (`constants/glossary.ts`); com `title` + filhos serve para texto específico de um campo.
 */
export function HelpHint(props: HelpHintProps) {
  const entry = props.term ? GLOSSARY[props.term] : null;
  const title = entry?.title ?? props.title;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`O que é: ${title}`}
          className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="CircleHelp" className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-1 p-3 text-xs" align="start">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="text-muted-foreground">{entry ? entry.text : props.children}</div>
      </PopoverContent>
    </Popover>
  );
}
