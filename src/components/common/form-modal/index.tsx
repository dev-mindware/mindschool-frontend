"use client";

import { useId, useState, type ReactNode, type FormEvent } from "react";
import { Button, ButtonSubmit, Input, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { Icon } from "@/components/common/icon";
import { GlobalModal } from "@/components/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useModal } from "@/stores/modal/use-modal-store";
import { cn } from "@/lib/utils";

interface FormModalProps {
  /** Id do modal na `useModal` store (abrir com `openModal(id, data)`). */
  id: string;
  title: string;
  description?: string;
  submitLabel?: string;
  isLoading?: boolean;
  /** Devolve uma promessa; o modal fecha quando resolve (a menos que `keepOpen`). */
  onSubmit: () => void | Promise<unknown>;
  onClose?: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Esconde o botão de guardar (modais só de consulta). */
  readOnly?: boolean;
  keepOpen?: boolean;
  disabled?: boolean;
}

const SIZE = { sm: "md", md: "xl", lg: "3xl", xl: "5xl" } as const;

/**
 * Modal de formulário padrão (MindGest): todo o formulário vive num `GlobalModal` aberto por id, com botões
 * Cancelar / Guardar (`ButtonSubmit`). Os campos usam `Input`, `FormSelect`, `FormTextarea` e `DatePicker`.
 */
export function FormModal({ id, title, description, submitLabel = "Guardar", isLoading, onSubmit, onClose, children, size = "md", readOnly, keepOpen, disabled }: FormModalProps) {
  const { open, closeModal } = useModal();
  const formId = useId();
  if (!open[id]) return null;

  const close = () => { onClose?.(); closeModal(id); };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit();
      if (!keepOpen) close();
    } catch {
      /* o erro já é mostrado pela mutação (toast); o modal mantém-se aberto */
    }
  };

  return (
    <GlobalModal
      id={id}
      canClose
      preventOutsideClose
      title={title}
      description={description}
      size={SIZE[size]}
      footer={
        <>
          <Button type="button" variant="outline" className="w-max" onClick={close}>{readOnly ? "Fechar" : "Cancelar"}</Button>
          {!readOnly && <ButtonSubmit form={formId} className="w-max" isLoading={Boolean(isLoading)} disabled={disabled}>{submitLabel}</ButtonSubmit>}
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{children}</form>
    </GlobalModal>
  );
}

interface FormSelectProps {
  label: string;
  value?: string;
  onValueChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/** Select com rótulo e erro, no estilo dos campos do MindGest (substitui `<select>` nativos). */
export function FormSelect({ label, value, onValueChange, options, placeholder = "Seleccione", error, disabled, className }: FormSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium">{label}</label>
      <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-10 w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormTextareaProps { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; error?: string; className?: string }

export function FormTextarea({ label, value, onChange, placeholder, rows = 3, error, className }: FormTextareaProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 sm:col-span-2", className)}>
      <label className="text-sm font-medium">{label}</label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormComboboxProps {
  label: string;
  value?: string;
  onValueChange: (v: string) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/** Selector com pesquisa para listas longas (alunos, professores, obras): Popover + pesquisa + lista com scroll. */
export function FormCombobox({ label, value, onValueChange, options, placeholder = "Seleccione", searchPlaceholder = "Pesquisar...", error, disabled, className }: FormComboboxProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.value === value);
  const shown = options.filter((o) => !q || `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium">{label}</label>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled} className="h-10 w-full justify-between font-normal">
            <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
            <Icon name="ChevronsUpDown" className="size-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-2 space-y-2" align="start">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} startIcon="Search" />
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {shown.length === 0 && <p className="p-2 text-sm text-muted-foreground">Sem resultados.</p>}
            {shown.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onValueChange(o.value); setOpenPopover(false); setQ(""); }}
                className={cn("flex w-full flex-col items-start rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted", o.value === value && "bg-muted font-medium")}
              >
                <span>{o.label}</span>
                {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
