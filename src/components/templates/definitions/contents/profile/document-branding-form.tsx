"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Textarea } from "@/components";
import {
  getSettingValue,
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/settings";
import { ErrorMessage, SucessMessage } from "@/utils";

const DEFAULT_NOTES = "Obrigado pela sua preferência!";

export function DocumentBrandingForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState(DEFAULT_NOTES);
  const [receiptFooter, setReceiptFooter] = useState(DEFAULT_NOTES);

  const { data: settings, isLoading } = useCompanySettings();
  const { mutateAsync: updateSettings, isPending } =
    useUpdateCompanySettings();

  useEffect(() => {
    if (!settings) return;
    setInvoiceNotes(getSettingValue(settings, "invoiceNotes", DEFAULT_NOTES));
    setReceiptFooter(getSettingValue(settings, "receiptFooter", DEFAULT_NOTES));
  }, [settings]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    await updateSettings(
      {
        invoiceNotes: invoiceNotes.trim() || DEFAULT_NOTES,
        receiptFooter: receiptFooter.trim() || DEFAULT_NOTES,
      },
      {
        onSuccess: () => {
          SucessMessage("Textos dos documentos actualizados com sucesso!");
          setIsEditing(false);
        },
        onError: (error: any) => {
          ErrorMessage(
            error?.response?.data?.message ||
              "Não foi possível actualizar os textos dos documentos",
          );
        },
      },
    );
  }

  function handleCancel() {
    setInvoiceNotes(getSettingValue(settings, "invoiceNotes", DEFAULT_NOTES));
    setReceiptFooter(getSettingValue(settings, "receiptFooter", DEFAULT_NOTES));
    setIsEditing(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-lg border p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h3 className="font-semibold text-lg">Textos dos Documentos</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Notas padrão usadas nas facturas quando o campo de notas fica vazio.
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Button
            type="button"
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) handleCancel();
              else setIsEditing(true);
            }}
            disabled={isLoading || isPending}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Textarea
          label="Notas padrão da factura"
          value={invoiceNotes}
          onChange={(event) => setInvoiceNotes(event.target.value)}
          placeholder={DEFAULT_NOTES}
          rows={3}
          disabled={!isEditing || isPending}
          className="bg-background shadow-none"
        />
        <Textarea
          label="Rodapé do recibo"
          value={receiptFooter}
          onChange={(event) => setReceiptFooter(event.target.value)}
          placeholder={DEFAULT_NOTES}
          rows={3}
          disabled={!isEditing || isPending}
          className="bg-background shadow-none"
        />
      </div>

      {isEditing && (
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isPending || isLoading}>
            {isPending ? "A guardar..." : "Guardar alterações"}
          </Button>
        </div>
      )}
    </form>
  );
}
