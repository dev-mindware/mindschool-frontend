"use client";

import { useAuthStore } from "@/stores/auth/auth-store";
import { MINDSCHOOL_ROLES, ROLE_LABELS } from "@/constants/roles";
import { Role } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components";
import { toast } from "sonner";

export function RoleSimulator() {
  const { user, setUser } = useAuthStore();

  if (!user) return null;

  // Habilitado em desenvolvimento ou para papéis executivos de teste
  const isEnabled =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
    user.role === "OWNER" ||
    user.role === "SYSTEM_ADMIN" ||
    user.role === "DIRECTOR_GENERAL";

  if (!isEnabled) return null;

  const handleRoleChange = (newRole: string) => {
    const targetRole = newRole as Role;
    setUser({
      ...user,
      role: targetRole,
    });
    toast.info(`Simulação de papel ativa: ${ROLE_LABELS[targetRole] || targetRole}`);
  };

  return (
    <div className="px-3 py-2 border-t border-border/40 bg-sidebar-accent/20 rounded-b-lg space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Icon name="ShieldCheck" className="w-3 h-3 text-primary" />
          Simulador RBAC
        </span>
        <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono border-primary/30 text-primary">
          DEV
        </Badge>
      </div>

      <Select value={user.role} onValueChange={handleRoleChange}>
        <SelectTrigger className="h-7 text-xs bg-background/80 border-border/60">
          <SelectValue placeholder="Selecionar Papel" />
        </SelectTrigger>
        <SelectContent>
          {MINDSCHOOL_ROLES.map((role) => (
            <SelectItem key={role} value={role} className="text-xs">
              {ROLE_LABELS[role] || role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
