"use client";

import { formatIsoDay } from "@/utils/format-date";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student } from "@/types";
import { SchoolStatusBadge } from "@/components/common/school-status-badge";
import { Button } from "@/components/ui/button";
import { Icon, Separator } from "@/components";
import { formatDate } from "@/utils";

interface StudentDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onEdit?: (student: Student) => void;
  onOpenCard?: (student: Student) => void;
}

export function StudentDetailsSheet({
  isOpen,
  onClose,
  student,
  onEdit,
  onOpenCard,
}: StudentDetailsSheetProps) {
  if (!student) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between pr-8">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {student.studentNumber}
            </span>
            <SchoolStatusBadge status={student.status} />
          </div>
          <SheetTitle className="text-xl font-bold pt-2">{student.fullName}</SheetTitle>
          <SheetDescription>
            {[student.currentClassLevel, student.currentSectionName].filter(Boolean).join(" • ") || "Sem matrícula"}
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <Tabs defaultValue="identification" className="w-full flex-1">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="identification">Identificação</TabsTrigger>
            <TabsTrigger value="guardian">Encarregado</TabsTrigger>
            <TabsTrigger value="academic">Matrícula</TabsTrigger>
          </TabsList>

          {/* Identificação */}
          <TabsContent value="identification" className="space-y-3">
            <div className="rounded-xs bg-muted/30 p-3 space-y-2.5">
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Número de Processo</span>
                <span className="font-semibold">{student.studentNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Género</span>
                <span className="font-medium">
                  {student.gender === "MALE" ? "Masculino" : "Feminino"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Data de Nascimento</span>
                <span className="font-medium">{formatIsoDay(student.birthDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Documento</span>
                <span className="font-medium">
                  {student.idDocumentType === "IDENTITY_CARD"
                    ? "Bilhete de Identidade"
                    : "Cédula / Certidão"}
                </span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">N.º do Documento</span>
                <span className="font-mono font-medium">{student.idDocumentNumber}</span>
              </div>
            </div>
          </TabsContent>

          {/* Encarregado */}
          <TabsContent value="guardian" className="space-y-3">
            <div className="rounded-xs bg-muted/30 p-3 space-y-2.5">
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-semibold">{student.guardianName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Grau de Parentesco</span>
                <span className="font-medium">{student.guardianRelationship}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">Contacto Telefónico</span>
                <span className="font-medium text-primary flex items-center gap-1">
                  <Icon name="Phone" className="w-3.5 h-3.5" />
                  {student.guardianPhone}
                </span>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-xs text-xs text-muted-foreground flex items-center gap-2">
              <Icon name="Info" className="w-4 h-4 text-primary shrink-0" />
              <span>
                O encarregado recebe notificações de faltas e propinas através do canal
                preferencial configurado.
              </span>
            </div>
          </TabsContent>

          {/* Matrícula */}
          <TabsContent value="academic" className="space-y-3">
            <div className="rounded-xs bg-muted/30 p-3 space-y-2.5">
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Ano Letivo</span>
                <span className="font-semibold">{student.academicYear || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Classe Atual</span>
                <span className="font-medium">{student.currentClassLevel || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Turma Atribuída</span>
                <span className="font-medium">{student.currentSectionName || "—"}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">Cadastrado em</span>
                <span className="font-medium">{student.createdAt ? formatDate(student.createdAt) : "—"}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter>
          {onOpenCard && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenCard(student);
              }}
              className="gap-1.5"
            >
              <Icon name="CreditCard" className="w-4 h-4 text-primary" />
              Cartão de Estudante
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="gap-1.5"
            >
              <Icon name="Pencil" className="w-4 h-4" />
              Editar Dados
            </Button>
          )}
          <Button size="sm" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
