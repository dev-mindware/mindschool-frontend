"use client";
import {
  Icon,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components";
import { useAuth, useLogout } from "@/hooks/auth";
import { usePwaInstallPrompt } from "@/hooks/common/use-pwa-install-prompt";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** `compact`: só o avatar (rail de módulos); o menu abre ao lado com os mesmos itens. */
export function UserInfo({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { handleLogout } = useLogout();
  const { canInstall, promptInstall } = usePwaInstallPrompt();
  const pathname = usePathname();
  const isPos = pathname?.startsWith("/pos");
  const appearanceHref = isPos ? "/pos/settings?tab=appearance" : "/settings?tab=appearance";

  if (!user) return null;

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {compact ? (
              <button type="button" aria-label="Conta" className="flex size-10 items-center justify-center rounded-xs transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 data-[state=open]:bg-white/15">
                <Avatar className="size-8 rounded-full">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="rounded-full bg-white/20 text-white">{user.name[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-muted-foreground"
              >
                <Avatar className="w-8 h-8 rounded-full">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="rounded-full">
                    {user.name[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-medium truncate">{user.name}</span>
                  <span className="text-xs truncate">{user.email}</span>
                </div>
                <Icon name="ChevronsUpDown" className="ml-auto size-4" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={compact ? "w-60 rounded-xs" : "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xs"}
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-full">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback className="rounded-full">
                    {user.name[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-medium truncate">{user.name}</span>
                  <span className="text-xs truncate">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* A subscrição é da escola: encarregados e alunos não a gerem. */}
            {user.role !== "GUARDIAN" && user.role !== "STUDENT" && (
              <>
                <DropdownMenuGroup>
                  <Link href="/settings?tab=subscription">
                    <DropdownMenuItem>
                      <Icon name="Sparkles" />
                      Fazer Upgrade
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuGroup>
              <Link href={appearanceHref}>
              <DropdownMenuItem>
                <Icon name="SquarePen" />
                Aparência
              </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            {canInstall && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={promptInstall}>
                  <Icon name="Download" />
                  Instalar MindSchool
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={handleLogout}>
              <Icon name="LogOut" className="text-red-500" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
