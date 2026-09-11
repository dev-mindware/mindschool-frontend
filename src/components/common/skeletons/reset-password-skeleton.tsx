import { Skeleton } from "@/components/ui";

export function ResetPasswordSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto mb-24 sm:mb-0">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <Skeleton className="size-20 rounded-full" />
        </div>
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="flex justify-center mt-2">
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}
