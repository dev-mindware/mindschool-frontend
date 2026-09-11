"use client";
import { useModal } from "@/stores";
import { Icon, Button, GlobalModal, Badge } from "@/components";
import { formatDateTime } from "@/utils";
import { AuditTrailResponse } from "@/types";
import { ACTION_BADGES, ENTITY_LABELS } from "./constants";
import { AuditDiffTable, getEntityIdentifier } from "./audit-diff-table";

export function AuditDetailModal() {
  const { closeModal, open, modalData } = useModal();
  const isOpen = open["view-audit"];
  const auditItem = modalData["view-audit"] as AuditTrailResponse;

  if (!auditItem || !isOpen) return null;

  const actionInfo = ACTION_BADGES[auditItem.action] || {
    variant: "default",
    label: auditItem.action,
    icon: "Activity",
  };

  return (
    <GlobalModal
      canClose
      id="view-audit"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-14 h-14 bg-primary/10 mb-3">
            <Icon name={actionInfo.icon as any} className="w-6 h-6 text-primary" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">Detalhes da Auditoria</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
              <Badge variant="outline">{ENTITY_LABELS[auditItem.entity] || auditItem.entity}</Badge>
            </div>
          </div>
        </>
      }
      className="!max-w-2xl !w-[95vw] md:!w-full max-h-[90vh] overflow-y-auto"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeModal("view-audit")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {/* Metadata Details Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/40 rounded-lg border">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Autor da acção
            </h4>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{auditItem.user?.name || "N/A"}</p>
              <p className="text-xs text-muted-foreground">{auditItem.user?.email || "ID: " + auditItem.userId}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Registo técnico
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Data/Hora:</span>{" "}
                {formatDateTime(auditItem.createdAt)}
              </p>
              {auditItem.ipAddress && (
                <p>
                  <span className="font-semibold text-foreground">Endereço IP:</span> {auditItem.ipAddress}
                </p>
              )}
              {getEntityIdentifier(auditItem) && (
                <p>
                  <span className="font-semibold text-foreground">Identificador:</span>{" "}
                  {getEntityIdentifier(auditItem)}
                </p>
              )}
              <p>
                <span className="font-semibold text-foreground">Entidade ID:</span> {auditItem.entityId}
              </p>
            </div>
          </div>

          {auditItem.userAgent && (
            <div className="col-span-1 sm:col-span-2 pt-2 border-t">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Dispositivo / User Agent
              </h4>
              <p className="text-xs font-mono text-muted-foreground truncate" title={auditItem.userAgent}>
                {auditItem.userAgent}
              </p>
            </div>
          )}
        </div>

        {/* Changes comparative table */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-foreground">Dados Alterados</h3>
          <AuditDiffTable
            action={auditItem.action}
            changes={auditItem.changes}
            oldValues={auditItem.oldValues}
            newValues={auditItem.newValues}
          />
        </div>
      </div>
    </GlobalModal>
  );
}
