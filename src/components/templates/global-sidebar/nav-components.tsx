"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Icon,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/constants/menu-items";

export function NavMenu({ items }: { items: MenuItem[] }) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const isUrlActive = useCallback(
    (url: string) => {
      if (!url || url === "#") return false;
      if (pathname === url) return true;
      if (url !== "/" && pathname.startsWith(url + "/")) return true;
      return false;
    },
    [pathname]
  );

  // Auto-expand the collapsible category containing the active subroute
  useEffect(() => {
    const activeItem = items.find(
      (item) => item.items?.some((sub) => isUrlActive(sub.url))
    );
    if (activeItem) {
      setOpenSubmenu(activeItem.name || activeItem.url);
    }
  }, [pathname, items, isUrlActive]);

  const toggleSubmenu = (id: string) =>
    setOpenSubmenu((prev) => (prev === id ? null : id));

  const handleMobileClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarMenu className="group-data-[collapsible=icon]:items-center">
          {items.map((item) => {
            const id = item.name || item.url;
            const hasSubmenu = !!item.items?.length;
            const isOpen = openSubmenu === id;
            const activeMain =
              isUrlActive(item.url) ||
              item.items?.some((sub) => isUrlActive(sub.url));

            return (
              <SidebarMenuItem key={id}>
                {hasSubmenu ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleSubmenu(id)}
                      tooltip={item.name}
                      aria-expanded={isOpen}
                      className={cn(
                        "transition-colors duration-150 font-medium",
                        activeMain
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-sidebar-accent text-sidebar-foreground/90"
                      )}
                    >
                      {item.icon}
                      <span className="truncate">{item.name}</span>
                      <Icon
                        name="ChevronRight"
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      />
                    </SidebarMenuButton>

                    {isOpen && (
                      <SidebarMenuSub className="my-1 border-l border-border/60 ml-3.5 pl-2 space-y-0.5">
                        {item.items!.map((sub) => {
                          const activeSub = isUrlActive(sub.url);
                          return (
                            <SidebarMenuSubItem key={sub.name}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "transition-colors duration-150 text-xs py-1.5",
                                  activeSub
                                    ? "bg-primary/15 text-primary font-medium"
                                    : "hover:bg-sidebar-accent/80 text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <Link
                                  href={sub.url}
                                  onClick={handleMobileClick}
                                  className="flex items-center gap-2"
                                >
                                  {activeSub ? (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                                  )}
                                  <span className="truncate">{sub.name}</span>
                                  {sub.showUpgrade && <Icon name="Lock" className="ml-auto size-3.5 shrink-0 text-muted-foreground" />}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.name}
                      onClick={handleMobileClick}
                      className={cn(
                        "transition-colors duration-150 font-medium",
                        activeMain
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-sidebar-accent text-sidebar-foreground/90"
                      )}
                    >
                      <Link href={item.url}>
                        {item.icon}
                        <span className="truncate">{item.name}</span>
                        {item.showUpgrade && <Icon name="Lock" className="ml-auto size-3.5 shrink-0 text-muted-foreground" />}
                      </Link>
                    </SidebarMenuButton>
                    {item.showMoreIcon && (
                      <SidebarMenuAction>
                        <Icon name="Loader" className="text-primary" />
                      </SidebarMenuAction>
                    )}
                  </>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
