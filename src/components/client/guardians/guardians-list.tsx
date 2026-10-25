"use client";

import React, { useState } from "react";
import { Can, DataList, type Column } from "@/components";
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
import { InviteCredentialsModal } from "@/components/client/shared/invite-credentials-modal";
import { useGuardians } from "@/hooks/school/use-guardians";
import { RELATIONSHIP_LABELS } from "@/constants/labels";

interface GuardiansListProps {
  guardians: Guardian[];
  isLoading?: boolean;
  isError?: boolean;
}

export function GuardiansList({ guardians, isLoading, isError }: GuardiansListProps) {
  const { inviteGuardian } = useGuardians();
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingGuardian, setViewingGuardian] = useState<Guardian | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [invitingGuardian, setInvitingGuardian] = useState<Guardian | null>(null);

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
        </div>
      ),
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
                {w.studentName} ({RELATIONSHIP_LABELS[w.relationship] ?? w.relationship})
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
<Can permission="guardian:write">
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => setInvitingGuardian(item)}
            >
              <Icon name="Mail" className="h-4 w-4" />
              Convidar (Acesso)
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => handleEdit(item)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
              Editar Dados
            </DropdownMenuItem>
</Can>
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
      <DataList<Guardian>
        prefix="encarregados"
        rows={guardians}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        pageSize={10}
        searchPlaceholder="Pesquisar por nome, telefone, BI, e-mail ou educando"
        searchText={(g) => `${g.fullName} ${g.phonePrimary} ${g.phoneSecondary ?? ""} ${g.idDocumentNumber ?? ""} ${g.email ?? ""} ${g.profession ?? ""} ${g.wards.map((w) => w.studentName).join(" ")}`}
        filters={[
          { key: "educandos", label: "Educandos", icon: "GraduationCap", options: [{ value: "com", label: "Com educandos" }, { value: "sem", label: "Sem educandos" }, { value: "varios", label: "2 ou mais" }], match: (g, v) => (v === "com" ? g.wards.length > 0 : v === "sem" ? g.wards.length === 0 : g.wards.length >= 2) },
          { key: "email", label: "E-mail", icon: "Mail", options: [{ value: "sim", label: "Com e-mail" }, { value: "nao", label: "Sem e-mail" }], match: (g, v) => (v === "sim" ? Boolean(g.email) : !g.email) },
          { key: "bi", label: "Documento", icon: "IdCard", options: [{ value: "sim", label: "Com BI" }, { value: "nao", label: "Sem BI" }], match: (g, v) => (v === "sim" ? Boolean(g.idDocumentNumber) : !g.idDocumentNumber) },
        ]}
        dateFilters={[{ key: "registo", label: "Registo", getDate: (g) => g.createdAt }]}
        sorts={[
          { value: "nome", label: "Nome", compare: (a, b) => a.fullName.localeCompare(b.fullName, "pt") },
          { value: "registo", label: "Data de registo", compare: (a, b) => a.createdAt.localeCompare(b.createdAt) },
          { value: "educandos", label: "N.º de educandos", compare: (a, b) => a.wards.length - b.wards.length },
        ]}
        emptyTitle="Nenhum encarregado encontrado"
        emptyDescription="Ajuste os filtros ou cadastre um encarregado."
        emptyIcon="Users"
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

      {invitingGuardian && (
        <InviteCredentialsModal
          isOpen={Boolean(invitingGuardian)}
          onClose={() => setInvitingGuardian(null)}
          targetName={invitingGuardian.fullName}
          targetRole="Encarregado de Educação"
          currentEmail={invitingGuardian.email}
          onSend={async (email) => {
            await inviteGuardian.mutateAsync({ id: invitingGuardian.id, email });
          }}
        />
      )}
    </>
  );
}
