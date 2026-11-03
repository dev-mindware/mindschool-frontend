"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "@/components";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth, useLogout } from "@/hooks/auth";
import { usePwaInstallPrompt } from "@/hooks/common/use-pwa-install-prompt";
import { useSchool } from "@/providers/school-provider";
import { pickPrimaryRole } from "@/utils/api-roles";
import { cn } from "@/lib/utils";

/**
 * Botão de topo esquerdo exclusivo para mobile (`md:hidden`) que substitui o `SidebarTrigger`
 * (uma vez que a sidebar lateral foi removida em dispositivos móveis em favor da `MobileModuleNavbar`).
 * Abre um dropdown com a Escola Activa (e troca de escola) + Conta do Utilizador (Perfil, Aparência, Subscrição e Sair).
 */
export function MobileHeaderMenu({ className }: { className?: string }) {
  const { user } = useAuth();
  const { handleLogout } = useLogout();
  const { canInstall, promptInstall } = usePwaInstallPrompt();
  const { schools, current, hasMultiple, switchSchool } = useSchool();
  const pathname = usePathname();
  const isPos = pathname?.startsWith("/pos");
  const appearanceHref = isPos
    ? "/pos/settings?tab=appearance"
    : "/settings?tab=appearance";

  const schoolName =
    current?.schoolName || user?.company?.name || "MindSchool";
  const schoolRoleLabel = current
    ? (ROLE_LABELS[pickPrimaryRole(current.roles) ?? "GUARDIAN"] ??
      "Unidade Escolar")
    : "Unidade Escolar";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-sidebar="mobile-trigger"
          data-slot="mobile-header-trigger"
          aria-label="Menu da escola e conta"
          className={cn("size-7 md:hidden", className)}
        >
          <Icon name="PanelLeft" className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-64 rounded-xs z-50"
      >
        {/* Cabeçalho da Escola Activa */}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2.5 px-2 py-2 text-left">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-sidebar-accent/60 p-1 dark:bg-sidebar-accent">
              <MindSchoolLogo size={22} />
            </div>
            <div className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-xs font-semibold text-foreground">
                {schoolName}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {schoolRoleLabel}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        {/* Lista de Troca de Escola (apenas quando o utilizador pertence a mais de uma escola) */}
        {hasMultiple && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              As minhas escolas
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {schools.map((m) => (
                <DropdownMenuItem
                  key={m.schoolId}
                  onClick={() => switchSchool(m.schoolId)}
                  className="cursor-pointer gap-2 p-2"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-xs border">
                    <Icon name="School" className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">
                      {m.schoolName}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {ROLE_LABELS[pickPrimaryRole(m.roles) ?? "GUARDIAN"]}
                      {m.viaGroup ? " · via grupo" : ""}
                    </span>
                  </div>
                  {m.schoolId === current?.schoolId && (
                    <Icon
                      name="Check"
                      className="ml-auto size-4 shrink-0 text-primary"
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}

        {user && (
          <>
            <DropdownMenuSeparator />

            {/* Cabeçalho da Conta do Utilizador */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="rounded-full text-xs">
                    {user.name[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href="/settings?tab=profile">
                <DropdownMenuItem className="cursor-pointer">
                  <Icon name="User" className="size-4" />
                  Perfil
                </DropdownMenuItem>
              </Link>
              <Link href={appearanceHref}>
                <DropdownMenuItem className="cursor-pointer">
                  <Icon name="SquarePen" className="size-4" />
                  Aparência
                </DropdownMenuItem>
              </Link>
              {user.role !== "TEACHER" && user.role !== "GUARDIAN" && user.role !== "STUDENT" && (
                <Link href="/settings?tab=subscription">
                  <DropdownMenuItem className="cursor-pointer">
                    <Icon name="Sparkles" className="size-4" />
                    Fazer Upgrade
                  </DropdownMenuItem>
                </Link>
              )}
              {canInstall && (
                <DropdownMenuItem
                  onClick={promptInstall}
                  className="cursor-pointer"
                >
                  <Icon name="Download" className="size-4" />
                  Instalar MindSchool
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:text-red-500"
              onClick={handleLogout}
            >
              <Icon name="LogOut" className="size-4 text-red-500" />
              Sair
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

