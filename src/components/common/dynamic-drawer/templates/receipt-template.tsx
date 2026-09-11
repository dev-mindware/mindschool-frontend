import { ReceiptResponse } from "@/types/receipt";
import { formatCurrency, formatDateTime } from "@/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { paymentMethodMap } from "@/constants";
import {
  DocumentStatusBadge,
  DownloadDocumentButton,
} from "@/components/client";

interface ReceiptTemplateProps {
  data: ReceiptResponse;
}

export function ReceiptTemplate({ data }: ReceiptTemplateProps) {
  const clientNif =
    data.client?.taxNumber ||
    (data.client as any)?.nif ||
    (data as any)?.clientNif;
  const clientPhone = data.client?.phone;
  const clientEmail = data.client?.email;
  const clientAddress = data.client?.address;

  const subtotal = Number(data.subtotal || 0);
  const discountAmount = Number(data.discountAmount || 0);
  const taxAmount = Number(data.taxAmount || 0);
  const retentionAmount = Number(data.retentionAmount || 0);
  const total = Number(data.total || 0);
  const receivedValue = Number(data.receivedValue || data.total || 0);

  const paymentMethod =
    data.paymentMethod || data.paymentMethodStr || (data as any)?.payment;
  const paymentLabel = paymentMethod
    ? paymentMethodMap[paymentMethod] || paymentMethod
    : null;

  const hash =
    (data as any).hash || (data as any).hash4 || (data as any).systemSignature;

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold uppercase tracking-wide">Recibo</h2>
            {data.status && <DocumentStatusBadge status={data.status} />}
          </div>
          <p className="text-muted-foreground font-mono font-medium">
            {data.number}
          </p>
          {paymentLabel && (
            <div className="pt-1">
              <Badge variant="outline" className="text-xs">
                Método: {paymentLabel}
              </Badge>
            </div>
          )}
        </div>

        <div className="text-right space-y-1">
          <p className="font-semibold text-xs text-muted-foreground uppercase">
            Data de Emissão
          </p>
          <p className="font-medium">{formatDateTime(data.createdAt)}</p>
        </div>
      </div>

      <Separator />

      {/* Dados do Cliente */}
      <div className="bg-muted/40 p-4 rounded-lg border space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Cliente
            </h3>
            <p className="font-semibold text-base text-foreground mt-0.5">
              {data.client?.name || "Consumidor Final"}
            </p>
          </div>
          {clientNif && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase">
                NIF / Contribuinte
              </span>
              <p className="font-mono font-medium text-foreground">{clientNif}</p>
            </div>
          )}
        </div>

        {(clientPhone || clientEmail || clientAddress) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t text-xs text-muted-foreground">
            {clientPhone && (
              <div>
                <span className="font-medium text-foreground">Tel: </span>
                {clientPhone}
              </div>
            )}
            {clientEmail && (
              <div>
                <span className="font-medium text-foreground">Email: </span>
                {clientEmail}
              </div>
            )}
            {clientAddress && (
              <div className="sm:col-span-2">
                <span className="font-medium text-foreground">Endereço: </span>
                {clientAddress}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detalhes de Pagamento e Documento Original */}
      <div className="bg-card p-4 rounded-lg border space-y-2.5">
        {data.originalInvoiceId && (
          <div className="flex justify-between text-muted-foreground">
            <span>Factura Associada:</span>
            <span className="font-mono font-medium text-foreground">
              {data.originalInvoiceId}
            </span>
          </div>
        )}

        {subtotal > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Desconto:</span>
            <span className="font-mono">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        {taxAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Imposto (IVA):</span>
            <span className="font-mono">+{formatCurrency(taxAmount)}</span>
          </div>
        )}

        {retentionAmount > 0 && (
          <div className="flex justify-between text-red-600 font-medium">
            <span>Retenção na Fonte:</span>
            <span className="font-mono">-{formatCurrency(retentionAmount)}</span>
          </div>
        )}

        <Separator className="my-1.5" />

        <div className="flex justify-between font-bold text-base pt-1">
          <span className="text-foreground">Total Quitado:</span>
          <span className="text-primary font-mono text-lg">
            {formatCurrency(total)}
          </span>
        </div>

        {receivedValue > 0 && receivedValue !== total && (
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Valor Entregue:</span>
            <span className="font-mono">{formatCurrency(receivedValue)}</span>
          </div>
        )}
      </div>

      {/* Assinatura / Hash Fiscal AGT */}
      {hash && (
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/30 p-2.5 rounded border">
          <span className="font-semibold text-foreground">
            Certificação AGT:{" "}
          </span>
          {hash}
        </div>
      )}

      {data.notes && (
        <div className="bg-muted/20 p-3 rounded-lg border">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
            Notas & Observações
          </h3>
          <p className="text-foreground text-xs whitespace-pre-line">
            {data.notes}
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <DownloadDocumentButton
          id={data.id}
          documentType="receipt"
          filenameBase={data.number}
        />
      </div>
    </div>
  );
}
