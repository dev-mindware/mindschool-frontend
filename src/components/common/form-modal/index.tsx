"use client";

import { useId, useState, type ReactNode, type FormEvent } from "react";
import { Button, ButtonSubmit, Input, Label, Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { Icon } from "@/components/common/icon";
import { GlobalModal } from "@/components/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useModal } from "@/stores/modal/use-modal-store";
import { cn } from "@/lib/utils";

import { PrintDownloadDropdown } from "@/components/common/print-download-dropdown";

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
  printContentId?: string;
  pdfFilename?: string;
  pdfOrientation?: "portrait" | "landscape";
}

const SIZE = { sm: "md", md: "xl", lg: "3xl", xl: "5xl" } as const;

/**
 * Modal de formulário padrão (MindGest): todo o formulário vive num `GlobalModal` aberto por id, com botões
 * Cancelar / Guardar (`ButtonSubmit`). Os campos usam `Input`, `FormSelect`, `FormTextarea` e `DatePicker`.
 */
export function FormModal({
  id,
  title,
  description,
  submitLabel = "Guardar",
  isLoading,
  onSubmit,
  onClose,
  children,
  size = "md",
  readOnly,
  keepOpen,
  disabled,
  printContentId,
  pdfFilename,
  pdfOrientation = "portrait",
}: FormModalProps) {
  const { open, closeModal } = useModal();
  const formId = useId();
  // «Cancelar» num formulário já mexido pede confirmação (os dados perdiam-se sem aviso)
  const [dirty, setDirty] = useState(false);
  const [askDiscard, setAskDiscard] = useState(false);
  if (!open[id]) return null;

  const close = () => { setDirty(false); setAskDiscard(false); onClose?.(); closeModal(id); };
  const cancel = () => (dirty && !readOnly ? setAskDiscard(true) : close());
  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    try {
      await onSubmit();
      // um modal só de leitura não "submete": os botões de ação lá dentro não o fecham (e não apagam o que se escreveu)
      if (!keepOpen && !readOnly) close();
    } catch {
      /* o erro já é mostrado pela mutação (toast); o modal mantém-se aberto */
    }
  };

  const isPdfDownloadModal = Boolean(
    printContentId ||
    submitLabel?.toLowerCase().includes("imprimir") ||
    submitLabel?.toLowerCase().includes("baixar")
  );

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
          <Button type="button" variant="outline" onClick={cancel}>{readOnly ? "Fechar" : "Cancelar"}</Button>
          {!readOnly && (
            isPdfDownloadModal ? (
              <PrintDownloadDropdown
                elementId={printContentId || formId}
                filename={pdfFilename || `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf`}
                orientation={pdfOrientation}
                disabled={disabled}
                label="Baixar PDF"
              />
            ) : (
              <ButtonSubmit form={formId} isLoading={Boolean(isLoading)} disabled={disabled}>{submitLabel}</ButtonSubmit>
            )
          )}
        </>
      }
    >
      <form id={formId} onSubmit={submit} onInput={() => setDirty(true)} className="grid gap-4 sm:grid-cols-2">{children}</form>
      <AlertDialog open={askDiscard} onOpenChange={setAskDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar os dados preenchidos?</AlertDialogTitle>
            <AlertDialogDescription>Os dados que já escreveu neste formulário perdem-se.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar a preencher</AlertDialogCancel>
            <AlertDialogAction onClick={close}>Descartar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
      <Label>{label}</Label>
      <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full" aria-label={label || placeholder}><SelectValue placeholder={placeholder} /></SelectTrigger>
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
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormMultiComboboxProps {
  label: string;
  values: string[];
  onValuesChange: (v: string[]) => void;
  options: Array<{ value: string; label: string; hint?: string }>;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Escolha múltipla com pesquisa: o botão resume a escolha e a lista longa (com «Todas» e «Limpar») vive num popover,
 * por isso o modal que a contém não precisa de scroll.
 */
export function FormMultiCombobox({ label, values, onValuesChange, options, placeholder = "Seleccione", searchPlaceholder = "Pesquisar...", error, disabled, className }: FormMultiComboboxProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const [q, setQ] = useState("");
  const shown = options.filter((o) => !q || `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  const chosen = options.filter((o) => values.includes(o.value));
  const summary = chosen.length === 0 ? placeholder : chosen.length <= 2 ? chosen.map((o) => o.label).join(", ") : `${chosen.length} seleccionadas`;
  const toggle = (v: string) => onValuesChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled} className="w-full justify-between font-normal">
            <span className={cn("truncate", chosen.length === 0 && "text-muted-foreground")}>{summary}</span>
            <Icon name="ChevronsUpDown" className="size-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-2 space-y-2" align="start">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} startIcon="Search" />
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-muted-foreground">{values.length} seleccionada(s)</span>
            <span className="flex gap-1">
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => onValuesChange(Array.from(new Set([...values, ...shown.map((o) => o.value)])))}>Todas</Button>
              <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => onValuesChange([])}>Limpar</Button>
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {shown.length === 0 && <p className="p-2 text-sm text-muted-foreground">Sem resultados.</p>}
            {shown.map((o) => {
              const on = values.includes(o.value);
              return (
                <Button
                  key={o.value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(o.value)}
                  className={cn("flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-sm font-normal", on && "bg-primary/10 font-medium")}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-sm border", on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")}>
                      {on && <Icon name="Check" className="size-3" />}
                    </span>
                    <span className="truncate">{o.label}</span>
                  </span>
                  {o.hint && <span className="shrink-0 text-xs text-muted-foreground">{o.hint}</span>}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
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
      <Label>{label}</Label>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled} className="w-full justify-between font-normal">
            <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.label ?? placeholder}</span>
            <Icon name="ChevronsUpDown" className="size-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] min-w-64 p-2 space-y-2" align="start">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} startIcon="Search" />
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {shown.length === 0 && <p className="p-2 text-sm text-muted-foreground">Sem resultados.</p>}
            {shown.map((o) => (
              <Button
                key={o.value}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { onValueChange(o.value); setOpenPopover(false); setQ(""); }}
                className={cn("flex h-auto w-full flex-col items-start px-2 py-1.5 text-left text-sm font-normal", o.value === value && "bg-muted font-medium")}
              >
                <span>{o.label}</span>
                {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
