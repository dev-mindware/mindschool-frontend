import { Icon } from "@/components/common";
import { Card, CardContent } from "@/components/ui";

interface MetricCardProps {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string | number;
  sub?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  sub,
}: MetricCardProps) {
  return (
    <Card className="border shadow-sm rounded-lg">
      <CardContent className="px-4 flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-3">
          <p className="text-2xl font-bold text-foreground leading-none tracking-tight">
            {value}
          </p>
          <div className="p-2 rounded-lg shrink-0 bg-muted/60 text-muted-foreground">
            <Icon name={icon} className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 mt-2">
          <p className="text-sm font-medium text-foreground/90 leading-none">
            {label}
          </p>
          {sub && (
            <p className="text-xs text-muted-foreground/80 line-clamp-1">
              {sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}