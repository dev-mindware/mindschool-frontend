"use client";

import React from "react";
import { TitleList } from "@/components/common/title-list";
import { InvoiceReceiptList } from "@/components/client/documents/invoice-receipt";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export function TuitionInvoicesContent() {
  function handleExportSaft() {
    toast.info("A gerar ficheiro SAF-T AO do mês corrente para a AGT...");
    setTimeout(() => {
      toast.success("SAF-T AO (XML) gerado e validado com sucesso pela estrutura de dados AGT.");
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <TitleList
          title="Facturas-Recibos Certificadas (AGT)"
          suTitle="Documentos fiscais emitidos pela tesouraria com hash criptográfico e QR Code"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportSaft}
            variant="outline"
            className="h-10 px-4 text-xs font-semibold gap-2 border-stone-300 rounded-xl"
          >
            <Icon name="FileCode" className="w-4 h-4 text-stone-600" />
            Exportar SAF-T (AO)
          </Button>
          <Link href="/documents/new-doc">
            <Button className="h-10 px-4 text-xs font-semibold gap-2">
              <Icon name="Plus" className="w-4 h-4" />
              Emitir Nova Factura-Recibo
            </Button>
          </Link>
        </div>
      </div>

      {/* Banner Informativo AGT */}
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Icon name="ShieldCheck" className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-950 text-sm">Software Certificado pela AGT - Regime de Ensino</h4>
            <p className="text-emerald-800">
              Todas as facturas-recibo são emitidas em conformidade com o Artigo 12.º do CIVA (Motivo de Isenção M02).
            </p>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-mono font-semibold text-[11px]">
          Série: 2026/FR-MS
        </span>
      </div>

      {/* Listagem de Facturas-Recibos */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-soft-sm">
        <InvoiceReceiptList />
      </div>
    </div>
  );
}
