import { SidebarMenu, SidebarMenuItem, Skeleton } from "@/components/ui";

export function LoaderStoresSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
