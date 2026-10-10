"use client";

import Link from "next/link";
import { Icon, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator, useSidebar } from "@/components";
import type { NavigationModel } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const isActive = (pathname: string, url: string) => pathname === url || pathname.startsWith(`${url}/`);

/** Coluna única com rótulos de grupo (encarregado/aluno): sem rail, sem acordeões. */
export function GroupedNav({ model, pathname }: { model: NavigationModel; pathname: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <>
      {model.modules.map((m, i) => (
        <SidebarGroup key={m.id}>
          {i > 0 && <SidebarSeparator className="hidden group-data-[collapsible=icon]:block" />}
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wide">{m.label}</SidebarGroupLabel>
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            {m.links.map((l) => {
              const current = isActive(pathname, l.url);
              return (
                <SidebarMenuItem key={l.url}>
                  <SidebarMenuButton asChild tooltip={l.name} isActive={current} onClick={() => isMobile && setOpenMobile(false)}
                    className={cn("font-medium transition-colors", current ? "bg-primary/10 text-primary" : "text-sidebar-foreground/90 hover:bg-sidebar-accent")}>
                    <Link href={l.url} aria-current={current ? "page" : undefined}>
                      <Icon name={l.icon} className="size-4" />
                      <span className="truncate">{l.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
