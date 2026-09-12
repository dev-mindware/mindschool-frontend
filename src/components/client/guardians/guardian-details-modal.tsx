"use client";

import React from "react";
import { Guardian } from "@/types";
import {
  GlobalModal,
  Button,
  Badge,
  DetailRow,
  Icon,
} from "@/components";

interface GuardianDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardian: Guardian | null;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  FATHER: "Pai",
  MOTHER: "Mãe",
  UNCLE: "Tio(a)",
  GRANDPARENT: "Avô/Avó",
  LEGAL_GUARDIAN: "Tutor(a) Legal",
  TUTOR: "Encarregado Indicado",
  OTHER: "Outro",
};

const CHANNEL_LABELS: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  SMS: "SMS",
  EMAIL: "E-mail",
  PHONE_CALL: "Chamada Telefónica",
};

export function GuardianDetailsModal({
  isOpen,
  onClose,
  guardian,
}: GuardianDetailsModalProps) {
  if (!guardian || !isOpen) return null;

  const phoneClean = guardian.phonePrimary.replace(/[^0-9]/g, "");

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="UserCheck" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {guardian.fullName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                BI: {guardian.idDocumentNumber || "Não informado"}
              </span>
              <Badge variant="outline" className="text-xs">
                {CHANNEL_LABELS[guardian.preferredContactChannel] || guardian.preferredContactChannel}
              </Badge>
            </div>
          </div>
        </div>
      }
      className="!max-h-[85vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
      footer={
        <div className="flex justify-between items-center w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/${phoneClean}`, "_blank")}
            className="text-emerald-600 gap-1.5"
          >
            <Icon name="MessageSquare" className="h-4 w-4" />
            Abrir WhatsApp
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Informações Pessoais e Profissionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-card border">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Identificação & Residência
            </h4>
            <DetailRow label="Nome Completo" value={guardian.fullName} />
            <DetailRow label="Documento (BI)" value={guardian.idDocumentNumber} />
            <DetailRow label="Morada / Residência" value={guardian.address} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Profissão & Trabalho
            </h4>
            <DetailRow label="Profissão / Função" value={guardian.profession} />
            <DetailRow label="Local de Trabalho" value={guardian.workplace} />
            <DetailRow
              label="Canal Notificação"
              value={CHANNEL_LABELS[guardian.preferredContactChannel]}
            />
          </div>
        </div>

        {/* Contactos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border">
          <div>
            <span className="text-xs text-muted-foreground block">Telefone Principal</span>
            <span className="text-sm font-semibold">{guardian.phonePrimary}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Telefone Alternativo</span>
            <span className="text-sm font-semibold">{guardian.phoneSecondary || "—"}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Correio Electrónico</span>
            <span className="text-sm font-semibold truncate block">{guardian.email || "—"}</span>
          </div>
        </div>

        {/* Educandos a Cargo (Wards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="GraduationCap" className="h-4 w-4 text-primary" />
              Educandos a Cargo ({guardian.wards?.length || 0})
            </h4>
            <span className="text-xs text-muted-foreground">
              Alunos associados a este encarregado
            </span>
          </div>

          {guardian.wards && guardian.wards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guardian.wards.map((ward) => (
                <div
                  key={ward.studentId}
                  className="p-3.5 rounded-xl border bg-card hover:bg-muted/20 transition flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                      {ward.studentName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {RELATIONSHIP_LABELS[ward.relationship] || ward.relationship}
                      </Badge>
                      {ward.isPrimaryContact && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-medium">
                          Contacto Principal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon name="User" className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
              Nenhum educando vinculado a este encarregado actualmente.
            </div>
          )}
        </div>
      </div>
    </GlobalModal>
  );
}
