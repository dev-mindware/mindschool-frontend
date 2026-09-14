'use client';

import React from 'react';
import { Icon } from '@/components';
import { Badge } from '@/components/ui/badge';
import { PautaAuditEntry } from '@/types/grade';

interface PautasAuditLogProps {
  auditLogs: PautaAuditEntry[];
}

export function PautasAuditLogSection({ auditLogs }: PautasAuditLogProps) {
  if (!auditLogs || auditLogs.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <Icon name="ShieldAlert" className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Livro de Auditoria Pedagógica (Registo de Fechos e Reaberturas)
        </h3>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-medium">
              <th className="py-2 px-3">Data e Hora</th>
              <th className="py-2 px-3">Turma</th>
              <th className="py-2 px-3">Ação</th>
              <th className="py-2 px-3">Responsável</th>
              <th className="py-2 px-3">Justificativa / Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-muted/30">
                <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('pt-AO')}
                </td>
                <td className="py-2 px-3 font-medium text-foreground">
                  {log.sectionName}
                </td>
                <td className="py-2 px-3">
                  <Badge
                    variant={log.action === 'CLOSED' ? 'default' : 'warning'}
                    className="text-[10px] font-normal"
                  >
                    {log.action === 'CLOSED' ? 'Fecho Homologado' : 'Reabertura Auditada'}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-foreground font-medium">{log.userName}</td>
                <td className="py-2 px-3 text-muted-foreground max-w-xs truncate" title={log.reason}>
                  {log.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
