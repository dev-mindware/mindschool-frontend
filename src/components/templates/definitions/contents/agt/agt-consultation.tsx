"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Icon, Input, Label, Separator, Badge } from "@/components";
import {
  getConsultedDocument,
  useAgtActions,
  useConsultAgtInvoice,
  useValidateAgtDocument,
} from "@/hooks/agt";
import {
  consultAgtInvoiceSchema,
  type ConsultAgtInvoiceFormData,
} from "@/schemas/agt-schema";
import type { AgtConsultDocument } from "@/types";
import { formatCurrency } from "@/utils";
import { useSearchParams } from "next/navigation";

export function AgtConsultation() {
  const searchParams = useSearchParams();
  const { clearDocNo } = useAgtActions();
  const docNoFromUrl = searchParams.get("docNo");

  const [docResult, setDocResult] = useState<AgtConsultDocument | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [vatPercentage, setVatPercentage] = useState("100");

  const { mutateAsync: consultInvoice, isPending: isLoading } =
    useConsultAgtInvoice();
  const { mutateAsync: validateDocument, isPending: isValidating } =
    useValidateAgtDocument();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConsultAgtInvoiceFormData>({
    resolver: zodResolver(consultAgtInvoiceSchema),
    defaultValues: { documentNo: "" },
  });

  const documentNo = watch("documentNo");

  async function runConsult(targetDocNo: string) {
    const trimmed = targetDocNo.trim();
    if (!trimmed) return;

    setDocResult(null);
    setIsConfirming(false);

    try {
      const data = await consultInvoice(trimmed);
      const document = getConsultedDocument(data);
      setDocResult(document);
    } catch {
      setDocResult(null);
    }
  }

  useEffect(() => {
    if (!docNoFromUrl) return;

    setValue("documentNo", docNoFromUrl);
    void runConsult(docNoFromUrl);
    clearDocNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to URL docNo
  }, [docNoFromUrl]);

  async function onConsult(data: ConsultAgtInvoiceFormData) {
    await runConsult(data.documentNo);
  }

  async function handleValidate(action: "CONFIRMAR" | "REJEITAR") {
    if (!docResult?.documentNo) return;

    try {
      await validateDocument({
        documentNo: docResult.documentNo,
        action,
        deductibleVATPercentage:
          action === "CONFIRMAR"
            ? Number.parseFloat(vatPercentage)
            : undefined,
      });
      setIsConfirming(false);
      await runConsult(docResult.documentNo);
    } catch {
      // errors handled in mutation
    }
  }

  const isValidDocument =
    docResult?.documentStatus === "V" || docResult?.documentStatus === "N";

  return (
    <div className="justify-start mt-6 space-y-8">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Consulta e validação</h3>
        <p className="text-sm text-muted-foreground">
          Pesquise documentos no repositório fiscal e valide facturas de
          fornecedores.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onConsult)}
        className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
      >
        <div className="grid gap-2">
          <Label htmlFor="agt-document-no">Número do documento</Label>
          <Input
            id="agt-document-no"
            placeholder="Ex: FT FT2024/001"
            {...register("documentNo")}
            error={errors.documentNo?.message}
          />
        </div>

        <Button
          type="submit"
          className="gap-2"
          disabled={isLoading || !documentNo?.trim()}
        >
          {isLoading ? (
            <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
          ) : (
            <Icon name="Search" className="h-4 w-4" />
          )}
          Consultar
        </Button>
      </form>

      {docResult && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {docResult.documentType || "Documento"}
                  </Badge>
                  <Badge variant={isValidDocument ? "secondary" : "outline"}>
                    {isValidDocument
                      ? "Válido"
                      : docResult.documentStatusDescription || "Pendente"}
                  </Badge>
                </div>
                <h4 className="truncate font-mono text-lg font-semibold">
                  {docResult.documentNo}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {docResult.documentDate || "Sem data informada"}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">Total líquido</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(
                    Number.parseFloat(String(docResult.netTotal ?? 0)) || 0,
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Emitente (NIF)"
                value={docResult.taxRegistrationNumber || "-"}
              />
              <InfoItem label="ID do repositório" value={docResult.id || "-"} />
              <InfoItem
                label="Estado fiscal"
                value={
                  docResult.documentStatusDescription ||
                  docResult.documentStatus ||
                  "-"
                }
              />
              <InfoItem
                label="Tipo de documento"
                value={docResult.documentType || "-"}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-semibold">Validação do adquirente</h4>
              <p className="text-sm text-muted-foreground">
                Confirme ou rejeite o documento consultado junto da AGT.
              </p>
            </div>

            <Separator />

            {!isConfirming ? (
              <div className="grid gap-2">
                <Button
                  type="button"
                  className="gap-2"
                  onClick={() => setIsConfirming(true)}
                  disabled={isValidating}
                >
                  <Icon name="CircleCheck" className="h-4 w-4" />
                  Confirmar factura
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => void handleValidate("REJEITAR")}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <Icon name="RefreshCw" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon name="CircleX" className="h-4 w-4" />
                  )}
                  Rejeitar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="agt-vat-percentage">IVA dedutível (%)</Label>
                  <Input
                    id="agt-vat-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={vatPercentage}
                    onChange={(event) => setVatPercentage(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Indique a percentagem do IVA que pretende deduzir
                    fiscalmente.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsConfirming(false)}
                    disabled={isValidating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => void handleValidate("CONFIRMAR")}
                    disabled={isValidating}
                  >
                    {isValidating ? "A validar..." : "Validar"}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Ao confirmar um documento, declara à AGT que aceita a validade
              fiscal desta operação.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value}</p>
    </div>
  );
}
