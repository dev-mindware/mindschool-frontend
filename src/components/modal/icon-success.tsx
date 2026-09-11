import { cn } from "@/lib/utils";
import { Icon } from "@/components";

export function IconCheckSucessfull({ className }: { className?: string }) {
  return (
    <div className={cn("w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3", {
      className
    })}>
      <Icon name="Check" className="w-8 h-8 text-green-600 dark:text-green-500" />
    </div>
  );
}
