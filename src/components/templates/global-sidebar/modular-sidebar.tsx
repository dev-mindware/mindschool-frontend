"use client";

import { activeNavUrl } from "@/lib/active-nav";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Icon,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components";
import {
  RAIL_BOTTOM,
  type NavLink,
  type NavModule,
  type NavigationModel,
} from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { SidebarCompanyInfo } from "./sidebar-info";
import { UserInfo } from "./user-info";
import { DesktopModuleRail, RAIL_WIDTH } from "./desktop-module-rail";

/** Rail + painel quando expandida; colapsada o rail desaparece e o painel fica em modo ícones (4 rem). */
const DUAL_WIDTH = "calc(15rem + 4.5rem)";

interface Props {
  model: NavigationModel;
  active: NavModule | undefined;
  pathname: string;
}

/**
 * Rail de módulos + painel com as secções do módulo ativo (exclusivo para Desktop).
 * Ao colapsar o rail desaparece e o painel passa a uma coluna de ícones com as páginas do módulo;
 * a troca de módulo vive então no botão do topo.
 */
export function ModularSidebar({ model, active, pathname }: Props) {
  const router = useRouter();
  const { open: expanded, setOpen, setCollapseLocked } = useSidebar();
  // Módulo de uma só página (Dashboard, Configurações) ou página fora do menu (notificações): sem painel, só o rail.
  const railOnly = (active?.pageCount ?? 0) <= 1;

  // Nesta página não há painel para colapsar: o botão (e o atalho) ficam desativados e o rail aparece sempre.
  useEffect(() => {
    setCollapseLocked(railOnly);
    if (railOnly && !expanded) setOpen(true);
    return () => setCollapseLocked(false);
  }, [railOnly, expanded, setCollapseLocked, setOpen]);

  // Trocar de módulo abre sempre a 1.ª página dele (previsível; sem «última visitada»).
  const open = (m: NavModule) => router.push(m.defaultUrl);

  const top = model.modules.filter((m) => !RAIL_BOTTOM.includes(m.id));
  const bottom = model.modules.filter((m) => RAIL_BOTTOM.includes(m.id));
  // só a página atual fica destacada (não o pai «Visão geral» ao mesmo tempo)
  const currentUrl = activeNavUrl(
    pathname,
    active?.sections.flatMap((s) => s.links.map((l) => l.url)) ?? [],
  );

  // Título do separador: páginas que não o definem ficavam com o genérico «MindSchool | Sistema Integrado…»; usa o nome da página do menu.
  const currentLabel =
    active?.sections
      .flatMap((s) => s.links)
      .find((l) => l.url === currentUrl)?.name ??
    (railOnly ? active?.label : undefined);
  useEffect(() => {
    if (!currentLabel) return;
    const t = window.setTimeout(() => {
      if (
        !document.title.includes("·") ||
        document.title.includes("Sistema Integrado")
      ) {
        document.title = `${currentLabel} · MindSchool`;
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [currentLabel, pathname]);

  return (
    <Sidebar collapsible="icon" width={railOnly ? RAIL_WIDTH : DUAL_WIDTH}>
      <div className="flex h-full min-h-0 w-full">
        <DesktopModuleRail
          top={top}
          bottom={bottom}
          active={active}
          onSelect={open}
        />

        {/* colapsada o painel volta (em ícones), mesmo nos módulos de uma só página */}
        <div
          className={cn(
            "min-w-0 flex-1 flex-col",
            railOnly ? "hidden group-data-[collapsible=icon]:flex" : "flex",
          )}
        >
          <SidebarHeader className="pb-0">
            {/* colapsada o rail não existe: a escola vem para aqui (para mudar de módulo, expandir) */}
            <div className="hidden group-data-[collapsible=icon]:block">
              <SidebarCompanyInfo />
            </div>
            {active && (
              <h2 className="px-3 pb-2 pt-3 text-base font-semibold group-data-[collapsible=icon]:hidden">
                {active.label}
              </h2>
            )}
          </SidebarHeader>

          <SidebarContent className="gap-0 group-data-[collapsible=icon]:items-center">
            {active?.sections.map((section, i) => (
              <SidebarGroup key={section.id} className="py-1">
                {i > 0 && <SidebarSeparator className="mx-0 mb-2 mt-1" />}
                {section.label && (
                  <SidebarGroupLabel className="h-7 px-3 text-xs font-normal text-muted-foreground">
                    {section.label}
                  </SidebarGroupLabel>
                )}
                <SidebarMenu className="gap-0.5 group-data-[collapsible=icon]:items-center">
                  {section.links.map((l) => (
                    <PanelLink
                      key={l.key}
                      link={l}
                      current={l.url === currentUrl}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* com rail, a conta vive no fundo do rail; sem rail (colapsada) vem para aqui */}
          <SidebarFooter className="hidden group-data-[collapsible=icon]:flex">
            <UserInfo />
          </SidebarFooter>
        </div>
      </div>
    </Sidebar>
  );
}

function PanelLink({
  link,
  current,
}: {
  link: NavLink;
  current: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={link.name}
        isActive={current}
        className={cn(
          "h-10 gap-3 rounded-xs px-3 text-sm transition-colors",
          current
            ? "bg-sidebar-accent font-medium text-foreground"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60",
        )}
      >
        <Link
          href={link.url}
          aria-label={link.name}
          aria-current={current ? "page" : undefined}
        >
          <Icon
            name={link.icon}
            className={cn("size-[18px]", current && "text-primary")}
          />
          <span className="truncate">{link.name}</span>
          {link.showUpgrade && (
            <Icon
              name="Lock"
              className="ml-auto size-3.5 shrink-0 text-muted-foreground"
            />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
