import { Skeleton } from "@/components/ui";
import { Card, CardContent, CardHeader } from "@/components";

export function SupplierDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PillSkeleton labelWidth="w-32" valueWidth="w-48" />
            <PillSkeleton labelWidth="w-28" valueWidth="w-52" />
            <PillSkeleton labelWidth="w-20" valueWidth="w-36" />
            <PillSkeleton labelWidth="w-10" valueWidth="w-28" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-full max-w-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PillSkeleton({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string;
  valueWidth: string;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-4 ${labelWidth}`} />
      <Skeleton className={`h-5 ${valueWidth}`} />
    </div>
  );
}
