import React from "react";
import { Badge } from "@/components/ui/badge";
import { StudentStatus, EnrollmentStatus } from "@/types";

interface SchoolStatusBadgeProps {
  status: StudentStatus | EnrollmentStatus | string;
  className?: string;
}

export function SchoolStatusBadge({ status, className }: SchoolStatusBadgeProps) {
  switch (status) {
    case "ENROLLED":
    case "ACTIVE":
    case "BOARDED":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium ${className || ""}`}
        >
          {status === "ENROLLED" ? "Matriculado" : status === "BOARDED" ? "A Bordo" : "Activo"}
        </Badge>
      );
    case "READY_FOR_PICKUP":
      return (
        <Badge
          variant="outline"
          className={`border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium ${className || ""}`}
        >
          Pronto para Entrega
        </Badge>
      );
    case "PENDING":
    case "PENDING_DIRECTOR":
    case "WAITLIST":
    case "ABSENT_NOTIFIED":
      return (
        <Badge
          variant="outline"
          className={`border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium ${className || ""}`}
        >
          {status === "PENDING_DIRECTOR"
            ? "Aguardando Despacho"
            : status === "WAITLIST"
            ? "Lista de Espera"
            : status === "ABSENT_NOTIFIED"
            ? "Falta Justificada"
            : "Pendente"}
        </Badge>
      );
    case "UNDER_REVIEW":
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className={`border-primary/30 bg-primary/10 text-primary font-medium ${className || ""}`}
        >
          {status === "APPROVED" ? "Deferido" : "Em Análise"}
        </Badge>
      );
    case "COMPLETED":
    case "DROPPED_OFF":
      return (
        <Badge variant="secondary" className={`font-normal text-muted-foreground ${className || ""}`}>
          {status === "DROPPED_OFF" ? "Desembarcado" : "Concluído"}
        </Badge>
      );
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return (
        <Badge
          variant="outline"
          className={`border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium ${className || ""}`}
        >
          {status === "REJECTED" ? "Indeferido" : status === "NO_SHOW" ? "Não Compareceu" : "Anulado"}
        </Badge>
      );
    case "TRANSFERRED":
      return (
        <Badge
          variant="outline"
          className={`border-border bg-muted/50 text-muted-foreground font-medium ${className || ""}`}
        >
          Transferido
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="outline" className={`font-normal ${className || ""}`}>
          Submetido
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
  }
}
