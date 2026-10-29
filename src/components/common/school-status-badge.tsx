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
        <Badge variant="success" className={className}>
          {status === "ENROLLED" ? "Matriculado" : status === "BOARDED" ? "A Bordo" : "Ativo"}
        </Badge>
      );
    case "READY_FOR_PICKUP":
      return (
        <Badge variant="success" className={className}>
          Pronto para Entrega
        </Badge>
      );
    case "PENDING":
    case "PENDING_DIRECTOR":
    case "WAITLIST":
    case "ABSENT_NOTIFIED":
      return (
        <Badge variant="warning" className={className}>
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
        <Badge variant="info" className={className}>
          {status === "APPROVED" ? "Deferido" : "Em Análise"}
        </Badge>
      );
    case "COMPLETED":
    case "DROPPED_OFF":
      return (
        <Badge variant="secondary" className={className}>
          {status === "DROPPED_OFF" ? "Desembarcado" : "Concluído"}
        </Badge>
      );
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return (
        <Badge variant="destructive" className={className}>
          {status === "REJECTED" ? "Indeferido" : status === "NO_SHOW" ? "Não Compareceu" : "Anulado"}
        </Badge>
      );
    case "TRANSFERRED":
      return (
        <Badge variant="secondary" className={className}>
          Transferido
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="outline" className={className}>
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
