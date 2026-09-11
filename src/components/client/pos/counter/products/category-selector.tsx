"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components";
import { Button } from "@/components/ui/button";
import { Category } from "@/types";
import { EmptyState } from "@/components/common/empty-state";

interface CategorySectionProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategorySelector = React.memo<CategorySectionProps>(
  ({ categories, activeCategory, onSelectCategory }) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    if (categories.length === 0) {
      return (
        <EmptyState
          icon="LayoutGrid"
          title="Nenhuma categoria encontrada"
          description="Adicione categorias para começar a vender."
        />
      );
    }

    return (
      <div className="w-full mb-6 relative group" data-tour="pos-categories">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full hidden md:flex"
            onClick={() => scroll("left")}
          >
            <Icon name="ChevronLeft" className="h-4 w-4" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto scrollbar-hide pb-4 -mb-4 flex space-x-4 p-1 scroll-smooth"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "group flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-300 min-w-[160px] shrink-0 text-left relative overflow-hidden",
                  activeCategory === category.id
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-card hover:bg-muted/50 border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {activeCategory === category.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                )}

                <div className="flex items-center justify-between w-full relative z-10">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg transition-colors duration-300",
                      activeCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    <Icon
                      name={activeCategory === category.id ? "LayoutGrid" : "LayoutGrid"}
                      size={20}
                    />
                  </div>
                  {activeCategory === category.id && (
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>

                <div className="space-y-1 relative z-10 w-full">
                  <span className={cn(
                    "font-bold text-sm block truncate w-full transition-colors",
                    activeCategory === category.id ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                  )}>
                    {category.name}
                  </span>
                  <div className="flex items-center justify-between text-xs w-full">
                    <span className="text-muted-foreground truncate max-w-[80px]">
                      {category.description || "Sem descrição"}
                    </span>
                    <span className={cn(
                      "font-medium px-1.5 py-0.5 rounded text-[10px]",
                      activeCategory === category.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {category.itemsCount || 0}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full hidden md:flex"
            onClick={() => scroll("right")}
          >
            <Icon name="ChevronRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);
