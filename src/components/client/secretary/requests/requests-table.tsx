"use client";

import React, { useState } from "react";
import { useSecretaryRequestStore } from "@/stores/school/secretary-request-store";
import { SecretaryRequest, RequestStatus } from "@/types";
import { Button, Icon } from "@/components";
import { Badge } from "@/components/ui/badge";
import { SearchHandlerWrapper } from "@/components/common";
import { FilterPopover } from "@/components/shared";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { RequestDetailsModal } from "./request-details-modal";
import { ProtocolSlipModal } from "./protocol-slip-modal";

interface RequestsTableProps {
  onOpenNewModal: () => void;
}

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "Todos os Estados" },
  { value: "PENDING_DIRECTOR", label: "Aguardando Despacho" },
  { value: "READY_FOR_PICKUP", label: "Pronto para Entrega" },
  { value: "APPROVED", label: "Deferidos" },
  { value: "UNDER_REVIEW", label: "Em Análise" },
  { value: "COMPLETED", label: "Concluídos" },
  { value: "REJECTED", label: "Indeferidos" },
];

export function RequestsTable({ onOpenNewModal }: RequestsTableProps) {
  const {
    requests,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
  } = useSecretaryRequestStore();

  const [selectedRequest, setSelectedRequest] = useState<SecretaryRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [slipRequest, setSlipRequest] = useState<SecretaryRequest | null>(null);

  const hasFilter = Boolean(searchQuery.trim() || (statusFilter && statusFilter !== "ALL"));

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  const filteredRequests = requests.filter((r) => {
    // Status Filter
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchProtocol = r.protocolNumber.toLowerCase().includes(q);
      const matchStudent = r.studentName.toLowerCase().includes(q);
      const matchGuardian = r.guardianName.toLowerCase().includes(q);
      const matchType = r.typeLabel.toLowerCase().includes(q);
      return matchProtocol || matchStudent || matchGuardian || matchType;
    }

    return true;
  });

  const handleOpenDetails = (req: SecretaryRequest) => {
    setSelectedRequest(req);
    setDetailsModalOpen(true);
  };

  const handleOpenSlip = (req: SecretaryRequest) => {
    setSlipRequest(req);
    setSlipModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* MindGest Standard Filters Bar */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={setSearchQuery}
          placeholder="Pesquisar por protocolo, aluno ou serviço..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter === "ALL" ? null : statusFilter}
            onChange={(val) => setStatusFilter((val as RequestStatus) ?? "ALL")}
          />

          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="w-36 px-4 py-3">Protocolo</th>
                <th className="min-w-[200px] px-4 py-3">Estudante / Turma</th>
                <th className="min-w-[220px] px-4 py-3">Serviço Solicitado</th>
                <th className="w-32 px-4 py-3 text-center">Data Limite (SLA)</th>
                <th className="w-28 px-4 py-3 text-center">Taxa</th>
                <th className="w-36 px-4 py-3 text-center">Estado</th>
                <th className="w-24 px-4 py-3 text-right">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    Nenhum requerimento encontrado para esta pesquisa.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => handleOpenDetails(req)}
                    className="hover:bg-muted/10 cursor-pointer transition-colors"
                  >
                    {/* Protocol */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-primary">
                          {req.protocolNumber}
                        </span>
                        {req.priority === "URGENT" && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {req.submittedAt.slice(0, 10)}
                      </div>
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {req.studentName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {req.studentNumber} • {req.className}
                      </div>
                    </td>

                    {/* Service Type */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {req.typeLabel}
                      </div>
                      {req.purpose && (
                        <div className="text-[10px] text-muted-foreground line-clamp-1 italic">
                          {req.purpose}
                        </div>
                      )}
                    </td>

                    {/* SLA Date */}
                    <td className="px-4 py-3 text-center font-mono">
                      <div>{new Date(req.targetDate).toLocaleDateString("pt-PT")}</div>
                      <span className="text-[10px] text-muted-foreground">
                        {req.slaDays}d prazo
                      </span>
                    </td>

                    {/* Fee */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-medium">
                        {req.feeAmountKz > 0 ? `${req.feeAmountKz.toLocaleString("pt-AO")} Kz` : "Grátis"}
                      </span>
                      <div className="text-[9px] text-muted-foreground font-medium">
                        {req.isPaid ? "Taxa Liquidada" : "Pendente"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <SchoolStatusBadge status={req.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSlip(req);
                        }}
                        className="inline-flex p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Imprimir Comprovativo de Protocolo"
                      >
                        <Icon name={"Printer" as any} className="size-4" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <RequestDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        request={selectedRequest}
        onPrintSlip={(r) => {
          setSlipRequest(r);
          setSlipModalOpen(true);
        }}
      />

      {/* Protocol Slip Modal */}
      <ProtocolSlipModal
        open={slipModalOpen}
        onOpenChange={setSlipModalOpen}
        request={slipRequest}
      />
    </div>
  );
}
