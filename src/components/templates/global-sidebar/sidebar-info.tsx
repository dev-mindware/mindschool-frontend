"use client";
import { useEffect } from "react";
import {
  Icon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  LoaderStoresSkeleton,
} from "@/components";
import { useAuth } from "@/hooks/auth";
import { useGetStores, useSwitchStore } from "@/hooks/entities";
import { currentStoreStore } from "@/stores/store/current-store-store";
import { Role } from "@/types";

export function SidebarCompanyInfo() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const isCashier = user?.role === "CASHIER";
  const { currentStore } = currentStoreStore();
  const { mutate: switchStore } = useSwitchStore();
  const {
    refetch,
    storesData,
    isLoading: loadingStores,
    error: storesError,
  } = useGetStores(user?.role as Role);

  if (loadingStores) return <LoaderStoresSkeleton />;

  if (storesError) {
    return <StoresErrorState onRetry={refetch} />;
  }

  if (isCashier) {
    return (
      <SidebarMenu className="group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground aspect-square size-8">
              <Icon name="Building2" className="size-4" />
            </div>
            <div className="grid flex-1 text-sm leading-tight text-left">
              <span className="font-medium truncate">
                {currentStore?.name || user.company?.name || "Empresa"}
              </span>
              <span className="text-xs truncate text-muted-foreground">
                Visualização
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground aspect-square size-8">
                <Icon name="Building2" className="size-4" />
              </div>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">
                  {currentStore?.name || "Empresa"}
                </span>
                <span className="text-xs truncate">
                  {currentStore ? "Loja seleccionada" : "Seleccione uma loja"}
                </span>
              </div>
              <Icon name="ChevronsUpDown" className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Lojas
            </DropdownMenuLabel>

            {storesData?.map((store) => (
              <DropdownMenuItem
                key={store.id}
                onClick={() => switchStore(store)}
                className="gap-2 p-2"
              >
                <div className="flex items-center justify-center border rounded-md size-6">
                  <Icon name="Building2" className="size-3.5 shrink-0" />
                </div>
                {store.name}
              </DropdownMenuItem>
            ))}

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function StoresErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 border border-destructive rounded-lg text-sm text-destructive space-y-2">
      <p>Erro ao carregar lojas.</p>
      <button onClick={onRetry} className="text-xs underline hover:opacity-80">
        Tentar novamente
      </button>
    </div>
  );
}
