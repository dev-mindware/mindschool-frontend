import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceFormSkeleton() {
  return (
    <div className="mt-4 space-y-8 rounded-lg">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-12 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Skeleton className="w-10 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-10 w-full bg-muted/50 rounded-md flex items-center gap-4 px-4">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-1/6 h-4" />
          <Skeleton className="w-1/6 h-4" />
          <Skeleton className="w-1/6 h-4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
          <Skeleton className="w-full h-14" />
        </div>
        <div className="flex justify-end gap-8 pt-4">
          <div className="space-y-2 w-48">
            <div className="flex justify-between">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="w-20 h-5" />
              <Skeleton className="w-20 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-full h-24" />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-40 h-10" />
      </div>
    </div>
  );
}