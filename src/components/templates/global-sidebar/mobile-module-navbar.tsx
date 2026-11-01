"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCompactVisibleModules,
  MOBILE_NAV_MAX_VISIBLE,
  type ModuleId,
  type NavModule,
} from "@/constants/navigation";
import { useNavigation } from "@/hooks/common/use-navigation";
import { activeNavUrl } from "@/lib/active-nav";
import { MobileCompactBar } from "./mobile-navbar/mobile-compact-bar";
import { MobileModulePagesDropdown } from "./mobile-navbar/mobile-module-pages-dropdown";
import { MobileModulesExpandedGrid } from "./mobile-navbar/mobile-modules-expanded-grid";

/**
 * Navbar inferior para dispositivos móveis (< 768px) com navegação por módulos:
 * - No estado compacto apresenta até 4 módulos (`MobileCompactBar`).
 * - Clicar num módulo com subpáginas abre o painel flutuante (`MobileModulePagesDropdown`).
 * - Clicar no botão de seta expande a grelha completa de módulos (`MobileModulesExpandedGrid`).
 */
export function MobileModuleNavbar() {
  const router = useRouter();
  const { ready, model, active, pathname } = useNavigation();

  const [openModuleId, setOpenModuleId] = useState<ModuleId | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();
  const expandedPanelId = useId();

  // Fecha o painel de subpáginas e a expansão sempre que a rota muda (sem useEffect em cascata)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenModuleId(null);
    setIsExpanded(false);
  }

  // Fecha ao clicar/tocar fora ou ao premir Escape
  useEffect(() => {
    if (!openModuleId && !isExpanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenModuleId(null);
        setIsExpanded(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenModuleId(null);
        setIsExpanded(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openModuleId, isExpanded]);

  if (!ready || model.modules.length === 0) return null;

  const highlightedModuleId = openModuleId ?? active?.id;
  const compactModules = getCompactVisibleModules(
    model.modules,
    highlightedModuleId,
    MOBILE_NAV_MAX_VISIBLE,
  );
  const canExpand = model.modules.length > MOBILE_NAV_MAX_VISIBLE;

  const openModule = openModuleId
    ? model.modules.find((m) => m.id === openModuleId)
    : undefined;

  const currentUrl = activeNavUrl(
    pathname,
    model.modules.flatMap((m) => m.links.map((l) => l.url)),
  );

  const handleModuleSelect = (mod: NavModule) => {
    if (mod.pageCount <= 1) {
      setOpenModuleId(null);
      setIsExpanded(false);
      router.push(mod.defaultUrl);
      return;
    }

    setIsExpanded(false);
    setOpenModuleId((prev) => (prev === mod.id ? null : mod.id));
  };

  const handleToggleExpand = () => {
    setOpenModuleId(null);
    setIsExpanded((prev) => !prev);
  };

  const closeAll = () => {
    setOpenModuleId(null);
    setIsExpanded(false);
  };

  const hasOpenOverlay = Boolean(openModule || isExpanded);

  return (
    <>
      {hasOpenOverlay && (
        <div
          aria-hidden="true"
          onClick={closeAll}
          className="fixed inset-0 z-30 bg-black/25 transition-opacity duration-150 md:hidden"
        />
      )}

      <div
        ref={containerRef}
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 md:hidden pointer-events-none"
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-2 pointer-events-auto">
          {openModule && (
            <MobileModulePagesDropdown
              id={dropdownId}
              module={openModule}
              currentUrl={currentUrl}
              onClose={() => setOpenModuleId(null)}
              onSelectPage={closeAll}
            />
          )}

          <nav
            aria-label="Navegação por módulos"
            className="overflow-hidden rounded-xs border border-border bg-card text-card-foreground shadow-md transition-all duration-200"
          >
            {isExpanded && canExpand && (
              <MobileModulesExpandedGrid
                id={expandedPanelId}
                modules={model.modules}
                activeModuleId={active?.id}
                openModuleId={openModuleId}
                onSelectModule={handleModuleSelect}
                onCollapse={() => setIsExpanded(false)}
              />
            )}

            <MobileCompactBar
              compactModules={compactModules}
              activeModuleId={active?.id}
              openModuleId={openModuleId}
              canExpand={canExpand}
              isExpanded={isExpanded}
              dropdownId={dropdownId}
              expandedPanelId={expandedPanelId}
              onSelectModule={handleModuleSelect}
              onToggleExpand={handleToggleExpand}
            />
          </nav>
        </div>
      </div>
    </>
  );
}
