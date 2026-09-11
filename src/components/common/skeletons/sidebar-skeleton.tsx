import { cn } from "@/lib/utils";

interface SidebarSkeletonProps {
  className?: string;
}

const widths = [
  "w-16",
  "w-24",
  "w-12",
  "w-20",
  "w-20",
  "w-32",
  "w-14",
  "w-28",
  "w-24",
];

export function SidebarSkeleton({ className }: SidebarSkeletonProps) {
  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border",
        className
      )}
    >
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-accent animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-sidebar-accent rounded animate-pulse" />
          <div className="h-3 w-16 bg-sidebar-accent rounded animate-pulse" />
        </div>
        <div className="h-4 w-4 bg-sidebar-accent rounded animate-pulse" />
      </div>

      <div className="flex-1 p-2 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-primary/10">
          <div className="h-4 w-4 bg-sidebar-primary rounded animate-pulse" />
          <div className="h-4 w-20 bg-sidebar-primary rounded animate-pulse" />
        </div>

        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2 rounded-md"
          >
            <div className="h-4 w-4 bg-sidebar-accent rounded animate-pulse" />
            <div className="flex-1 flex items-center justify-between">
              <div
                className={cn(
                  "h-4 bg-sidebar-accent rounded animate-pulse",
                  widths[index] || "w-24"
                )}
              />
              {index === 4 && (
                <div className="h-3 w-3 bg-sidebar-accent rounded animate-pulse" />
              )}
            </div>
            {index === 0 && (
              <div className="h-4 w-8 bg-sidebar-accent rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent animate-pulse flex items-center justify-center">
            <div className="h-3 w-3 bg-sidebar-accent-foreground/20 rounded animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-4 w-28 bg-sidebar-accent rounded animate-pulse" />
            <div className="h-3 w-36 bg-sidebar-accent rounded animate-pulse" />
          </div>
          <div className="h-4 w-4 bg-sidebar-accent rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}