"use client";

import React, { useState } from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Guardian } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GuardianModal } from "./guardian-modal";
import { GuardianDetailsModal } from "./guardian-details-modal";

interface GuardiansListProps {
  guardians: Guardian[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function GuardiansList({
  guardians,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
}: GuardiansListProps) {
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingGuardian, setViewingGuardian] = useState<Guardian | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleEdit = (guardian: Guardian) => {
    setSelectedGuardian(guardian);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (guardian: Guardian) => {
    setViewingGuardian(guardian);
    setIsDetailsModalOpen(true);
  };

  const columns: Column<Guardian>[] = [
    {
      key: "fullName",
      header: "Nome do Encarregado",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{item.fullName}</span>
          <span className="text-xs text-muted-foreground">
            BI: {item.idDocumentNumber || "Não informado"}
          </span>
        </div>
      ),
    },
    {
      key: "phonePrimary",
      header: "Contacto Principal",
      render: (_, item) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-foreground font-medium">
            {item.phonePrimary}
          </span>
          {item.preferredContactChannel === "WHATSAPP" && (
            <span
              title="Contacto preferencial com WhatsApp activo"
              className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-semibold"
            >
              WA
            </span>
          )}
        </div>
      ),
    },
    {
      key: "preferredContactChannel",
      header: "Canal Preferencial",
      render: (_, item) => {
        const channelMap = {
          WHATSAPP: { label: "WhatsApp", variant: "default" as const, color: "bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-300" },
          SMS: { label: "SMS", variant: "secondary" as const, color: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300" },
          EMAIL: { label: "E-mail", variant: "outline" as const, color: "bg-purple-500/10 text-purple-700 border-purple-300 dark:text-purple-300" },
          PHONE_CALL: { label: "Chamada", variant: "outline" as const, color: "bg-zinc-500/10 text-zinc-700 border-zinc-300 dark:text-zinc-300" },
        };
        const conf = channelMap[item.preferredContactChannel] || channelMap.SMS;
        return (
          <Badge variant="outline" className={`text-xs font-medium border ${conf.color}`}>
            {conf.label}
          </Badge>
        );
      },
    },
    {
      key: "wards",
      header: "Educandos (Alunos)",
      render: (_, item) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {item.wards && item.wards.length > 0 ? (
            item.wards.map((w, idx) => (
              <span
                key={idx}
                className="text-xs bg-muted px-2 py-0.5 rounded-full text-foreground"
              >
                {w.studentName} ({w.relationship})
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Nenhum aluno associado
            </span>
          )}
        </div>
      ),
    },
    {
      key: "profession",
      header: "Profissão / Trabalho",
      render: (_, item) => (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span className="text-foreground font-medium">
            {item.profession || "—"}
          </span>
          <span>{item.workplace || ""}</span>
        </div>
      ),
    },
    {
      key: "id",
      header: "Ações",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="EllipsisVertical" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleViewDetails(item)}
            >
              <Icon name="Eye" className="h-4 w-4 text-muted-foreground" />
              Ver Ficha Completa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Dados
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-emerald-600"
              onClick={() => {
                const phoneClean = item.phonePrimary.replace(/[^0-9]/g, "");
                window.open(`https://wa.me/${phoneClean}`, "_blank");
              }}
            >
              <Icon name="MessageSquare" className="h-4 w-4" />
              Enviar Mensagem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        data={guardians}
        total={total}
        page={currentPage}
        totalPages={totalPages}
        setPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        emptyMessage="Nenhum encarregado encontrado com os filtros actuais."
      />

      <GuardianModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGuardian(null);
        }}
        guardianToEdit={selectedGuardian}
      />

      <GuardianDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingGuardian(null);
        }}
        guardian={viewingGuardian}
      />
    </>
  );
}
