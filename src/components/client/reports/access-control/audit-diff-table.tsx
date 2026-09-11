"use client";
import { AuditTrailAction, AuditTrailResponse } from "@/types";

export function getEntityIdentifier(item: AuditTrailResponse): string | null {
  if (!item) return null;
  const data = item.newValues || item.oldValues || {};
  
  if (data['Número da Fatura']) return data['Número da Fatura'];
  if (data['Nº Nota de Crédito']) return data['Nº Nota de Crédito'];
  if (data['Nome']) return data['Nome'];
  if (data['Plano (ID)']) return `Plano: ${data['Plano (ID)']}`;
  
  if (data.invoiceNumber) return data.invoiceNumber;
  if (data.creditNoteNumber) return data.creditNoteNumber;
  if (data.name) return data.name;
  if (data.title) return data.title;
  if (data.email) return data.email;
  
  return null;
}

interface AuditDiffTableProps {
  action: AuditTrailAction;
  changes: Record<string, { from: any; to: any }> | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
}

// Helper to format values for display
export const formatValue = (val: any): string => {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "boolean") return val ? "Sim" : "Não";
  if (Array.isArray(val)) {
    return val.map((item) => formatValue(item)).join("\n");
  }
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return "[Objeto]";
    }
  }
  return String(val);
};

// Helper to filter out raw database/technical ID fields
export const shouldDisplayField = (key: string): boolean => {
  const lowercaseKey = key.toLowerCase();
  
  if (
    lowercaseKey === "id" ||
    lowercaseKey === "companyid" ||
    lowercaseKey === "userid" ||
    lowercaseKey === "tenantid" ||
    lowercaseKey === "createdat" ||
    lowercaseKey === "updatedat" ||
    lowercaseKey === "deletedat"
  ) {
    return false;
  }
  
  if (lowercaseKey.endsWith("id") && key !== "id") {
    return false;
  }
  
  return true;
};

export function AuditDiffTable({ action, changes, oldValues, newValues }: AuditDiffTableProps) {
  // Separate changes into comparative (with from/to) and flat changes
  const comparativeChanges: [string, { from: any; to: any }][] = [];
  const flatChanges: [string, any][] = [];

  if (changes) {
    Object.entries(changes)
      .filter(([field]) => shouldDisplayField(field))
      .forEach(([field, val]) => {
        if (val && typeof val === "object" && ("from" in val || "to" in val)) {
          comparativeChanges.push([field, val as { from: any; to: any }]);
        } else {
          flatChanges.push([field, val]);
        }
      });
  }

  const displayedNewValues = newValues
    ? Object.entries(newValues).filter(([field]) => shouldDisplayField(field))
    : [];

  const displayedOldValues = oldValues
    ? Object.entries(oldValues).filter(([field]) => shouldDisplayField(field))
    : [];

  const hasComparative = comparativeChanges.length > 0;
  const hasFlat = flatChanges.length > 0;
  const hasNew = displayedNewValues.length > 0;
  const hasOld = displayedOldValues.length > 0;

  if (!hasComparative && !hasFlat && !hasNew && !hasOld) {
    return (
      <div className="p-6 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
        Não foi registada qualquer alteração de valores para esta acção.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Flat changes / reasons (e.g. Motivo, Ação/Tipo) */}
      {hasFlat && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Informações Adicionais
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="p-3 font-semibold text-muted-foreground w-1/3">Campo</th>
                  <th className="p-3 font-semibold text-muted-foreground w-2/3">Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {flatChanges.map(([field, val]) => (
                  <tr key={field} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground capitalize">{field}</td>
                    <td className="p-3 text-foreground whitespace-pre-wrap font-mono">
                      {formatValue(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Comparative changes (Valor Anterior vs Novo) */}
      {hasComparative && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Comparação de Alterações
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="p-3 font-semibold text-muted-foreground w-1/4">Campo</th>
                  <th className="p-3 font-semibold text-muted-foreground w-3/8">Valor Anterior</th>
                  <th className="p-3 font-semibold text-muted-foreground w-3/8">Valor Novo</th>
                </tr>
              </thead>
              <tbody>
                {comparativeChanges.map(([field, diff]) => (
                  <tr key={field} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground capitalize">{field}</td>
                    <td className="p-3 text-red-600 dark:text-red-400 bg-red-500/5 line-through whitespace-pre-wrap font-mono">
                      {formatValue(diff.from)}
                    </td>
                    <td className="p-3 text-green-600 dark:text-green-400 bg-green-500/5 font-semibold whitespace-pre-wrap font-mono">
                      {formatValue(diff.to)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. New Values */}
      {hasNew && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {action === "CREATE" ? "Valores Registados" : "Novos Valores / Valores Finais"}
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="p-3 font-semibold text-muted-foreground w-1/3">Campo</th>
                  <th className="p-3 font-semibold text-muted-foreground w-2/3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {displayedNewValues.map(([field, val]) => (
                  <tr key={field} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground capitalize">{field}</td>
                    <td className="p-3 text-green-600 dark:text-green-400 bg-green-500/5 font-semibold whitespace-pre-wrap font-mono">
                      {formatValue(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Old Values */}
      {hasOld && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {action === "DELETE" ? "Valores Eliminados / Anteriores" : "Valores Iniciais / Anteriores"}
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-muted border-b">
                  <th className="p-3 font-semibold text-muted-foreground w-1/3">Campo</th>
                  <th className="p-3 font-semibold text-muted-foreground w-2/3">Valor</th>
                </tr>
              </thead>
              <tbody>
                {displayedOldValues.map(([field, val]) => (
                  <tr key={field} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium text-foreground capitalize">{field}</td>
                    <td className="p-3 text-red-600 dark:text-red-400 bg-red-500/5 line-through whitespace-pre-wrap font-mono">
                      {formatValue(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
