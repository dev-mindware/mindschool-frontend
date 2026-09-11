import { cn } from "@/lib/utils";
import { Icon } from "@/components";

export function IconWarning({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center self-center justify-center px-4 w-14 h-14 rounded-full bg-red-100 text-red-600 shadow-sm",
        className
      )}
    >
      <Icon name="TriangleAlert" className="h-8 w-8" />
    </div>
  );
}
