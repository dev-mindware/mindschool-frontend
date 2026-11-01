"use client";

import Link from "next/link";
import { Icon } from "@/components/common/icon";
import type { NavLink, NavModule } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface MobileModulePagesDropdownProps {
  id: string;
  module: NavModule;
  currentUrl?: string;
  onClose: () => void;
  onSelectPage: () => void;
}

/**
 * Painel flutuante superior da Navbar Mobile:
 * Apresenta as secções e páginas disponíveis no módulo seleccionado, com destaque da página activa.
 */
export function MobileModulePagesDropdown({
  id,
  module,
  currentUrl,
  onClose,
  onSelectPage,
}: MobileModulePagesDropdownProps) {
  return (
    <section
      id={id}
      role="region"
      aria-label={`Páginas do módulo ${module.label}`}
      className="max-h-[min(68svh,26rem)] overflow-y-auto rounded-xs border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-150"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-popover px-3.5 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
            <Icon name={module.icon} className="size-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
              {module.label}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {module.pageCount}{" "}
              {module.pageCount === 1
                ? "página disponível"
                : "páginas disponíveis"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu do módulo"
          className="flex size-8 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon name="X" className="size-4" />
        </button>
      </div>

      <div className="divide-y divide-border/50 p-2">
        {module.sections.map((section) => (
          <div key={section.id} className="py-1.5 first:pt-0 last:pb-0">
            {section.label && (
              <div className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </div>
            )}
            <ul className="space-y-0.5" role="list">
              {section.links.map((link) => (
                <ModulePageLink
                  key={link.key}
                  link={link}
                  isCurrent={link.url === currentUrl}
                  onSelect={onSelectPage}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModulePageLink({
  link,
  isCurrent,
  onSelect,
}: {
  link: NavLink;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <Link
        href={link.url}
        onClick={onSelect}
        aria-current={isCurrent ? "page" : undefined}
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-xs px-2.5 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isCurrent
            ? "bg-primary/10 font-semibold text-primary"
            : "font-medium text-foreground/85 hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon
          name={link.icon}
          className={cn(
            "size-4 shrink-0",
            isCurrent ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span className="flex-1 truncate">{link.name}</span>
        {link.showUpgrade && (
          <Icon
            name="Lock"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
        )}
        {isCurrent && (
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full bg-primary"
          />
        )}
      </Link>
    </li>
  );
}

