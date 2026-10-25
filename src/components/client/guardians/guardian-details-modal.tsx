"use client";

import { RELATIONSHIP_LABELS } from "@/constants/labels";
import React from "react";
import { Guardian } from "@/types";
import {
  Button,
  Badge,
  DetailRow,
  Icon,
} from "@/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface GuardianDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardian: Guardian | null;
}


export function GuardianDetailsModal({
  isOpen,
  onClose,
  guardian,
}: GuardianDetailsModalProps) {
  if (!guardian || !isOpen) return null;

  const phoneClean = guardian.phonePrimary.replace(/[^0-9]/g, "");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="UserCheck" className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg font-bold">{guardian.fullName}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">BI: {guardian.idDocumentNumber || "Não informado"}</span>
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Informações Pessoais e Profissionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-card border">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Identificação
            </h4>
            <DetailRow label="Nome Completo" value={guardian.fullName} />
            <DetailRow label="N.º do documento (identifica o encarregado na escola)" value={guardian.idDocumentNumber} />
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
              Nenhum educando vinculado a este encarregado atualmente.
            </div>
          )}
        </div>
      </div>
      </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => window.open(`https://wa.me/${phoneClean}`, "_blank")}>
            <Icon name="MessageSquare" className="h-4 w-4" />
            Abrir WhatsApp
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
