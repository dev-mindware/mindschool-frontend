"use client";

import { useDashboardRoleStore } from "@/stores/dashboard";
import { useAuth } from "@/hooks/auth/use-auth";
import { Role } from "@/types";
import { MINDSCHOOL_ROLES, ROLE_LABELS } from "@/constants/roles";
import { Badge, Button, Icon } from "@/components";

export function DashboardRolePreviewSwitcher() {
  const { user } = useAuth();
  const { activeRoleOverride, setRoleOverride, resetRoleOverride } =
    useDashboardRoleStore();

  const currentRole: Role =
    activeRoleOverride ?? (user?.role as Role) ?? "DIRECTOR_GENERAL";
  const isSimulated = activeRoleOverride !== null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-card border shadow-none text-xs">
      <div className="flex items-center gap-1.5 font-medium text-foreground mr-1">
        <Icon name="Eye" className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">Perfil Activo:</span>
        <Badge
          className={
            isSimulated
              ? "bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
              : "bg-primary text-primary-foreground font-semibold text-xs"
          }
        >
          {ROLE_LABELS[currentRole] ?? currentRole}
        </Badge>
        {isSimulated && (
          <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Simulado
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <select
          value={currentRole}
          onChange={(e) => setRoleOverride(e.target.value as Role)}
          className="h-7 px-2 py-0 text-xs rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          aria-label="Simular Perfil no Dashboard"
        >
          <optgroup label="Simular Perfil Escolar">
            {MINDSCHOOL_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </optgroup>
        </select>

        {isSimulated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetRoleOverride}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Repor papel do utilizador autenticado"
          >
            <Icon name="RotateCcw" className="w-3.5 h-3.5 mr-1" />
            Repor
          </Button>
        )}
      </div>
    </div>
  );
}
