"use client"
import { DinamicBreadcrumb } from "@/components/custom";
import { NotificationDropdown, ChatbotSheet, TutorialsModal } from "@/components/shared";
import {
  Separator,
  SidebarTrigger,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useQueryState } from "nuqs";
import { Icon, Input, Avatar, AvatarFallback, AvatarImage } from "@/components";
import { useAuth } from "@/hooks/auth";
import { OnboardingTourButton } from "@/components/common/onboarding-tour-button";
import type { OnboardingTourId } from "@/constants/onboarding-tours";

type Props = {
  routePath?: string;
  routeLabel?: string;
  subRoute: string;
  showSeparator?: boolean;
  children: React.ReactNode;
  variant?: "default" | "counter";
  onboardingTourId?: OnboardingTourId;
};

export function PageWrapper({
  routePath,
  routeLabel,
  subRoute,
  showSeparator = true,
  children,
  variant = "default",
  onboardingTourId,
}: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
  });

  return (
    <div className="bg-background">
      <header className="flex h-16 sticky top-0 z-50 shrink-0 bg-sidebar border-b items-center gap-2 transition-[width,height] ease-linear justify-between">
        {/* Default Variant Left side */}
        {variant === "default" && (
          <div className="flex items-center gap-2 px-4 text-center">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DinamicBreadcrumb
              routePath={routePath}
              routeLabel={routeLabel}
              subRoute={subRoute}
              showSeparator={showSeparator}
            />
          </div>
        )}

        {/* Counter Variant Header Content */}
        {variant === "counter" && (
          <div className="flex items-center gap-4 w-full justify-between px-4">
            <div className="relative w-96">
              <Icon name="Search" className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar no Menu..."
                className="pl-8 bg-muted/50 border-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-tour="pos-product-search"
              />
            </div>
          </div>
        )}

        {/* DESKTOP ACTIONS: Inline Row (Hidden on Mobile) */}
        <div className="hidden md:flex items-center mr-4 space-x-3">
          <TutorialsModal />
          {onboardingTourId && <OnboardingTourButton tourId={onboardingTourId} />}
          <ChatbotSheet />
          <NotificationDropdown />
          {variant === "counter" && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.name} />
                  <AvatarFallback className="text-xs">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-start overflow-hidden">
                  <span
                    className="text-xs font-semibold truncate max-w-[120px]"
                    title={user?.name}
                  >
                    {user?.name}
                  </span>
                  <span
                    className="text-[10px] text-muted-foreground truncate"
                    title={user?.role}
                  >
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE ACTIONS: Grouped Dropdown Menu (Hidden on Desktop) */}
        <div className="flex md:hidden items-center mr-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl border border-border/60 bg-card/80 hover:bg-accent"
                aria-label="Menu de Ações Rápidas"
              >
                <Icon name="SlidersHorizontal" className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 p-2 rounded-2xl shadow-xl border-border/80 bg-card/95 backdrop-blur-xl space-y-1 z-50"
              sideOffset={8}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 py-1">
                Ações Rápidas
              </div>
              <DropdownMenuSeparator className="my-1" />

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors">
                <span className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Icon name="Bell" className="w-4 h-4 text-primary" /> Notificações
                </span>
                <NotificationDropdown />
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors">
                <span className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Icon name="Sparkles" className="w-4 h-4 text-primary" /> Assistente MIND
                </span>
                <ChatbotSheet />
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors">
                <span className="text-xs font-medium text-foreground flex items-center gap-2">
                  <Icon name="Video" className="w-4 h-4 text-primary" /> Tutoriais
                </span>
                <TutorialsModal />
              </div>

              {onboardingTourId && (
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors">
                  <span className="text-xs font-medium text-foreground flex items-center gap-2">
                    <Icon name="CircleHelp" className="w-4 h-4 text-primary" /> Tour Guiado
                  </span>
                  <OnboardingTourButton tourId={onboardingTourId} />
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className={`flex flex-col flex-1 ${variant === "counter" ? "w-full max-w-[98%]" : "w-full"} mx-auto space-y-4 md:space-y-6`}>
        <div className={`@container/main flex flex-1 ${variant === "counter" ? "p-2 md:p-4" : "p-4 md:p-8 lg:p-12"} flex-col gap-2`}>
          {children}
        </div>
      </div>
    </div>
  );
}
