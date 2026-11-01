import { Separator } from "@/components/ui";

interface TitleListProps {
  title?: string;
  suTitle?: string;
  separator?: boolean;
  children?: React.ReactNode;
}

export function TitleList({
  title,
  suTitle,
  separator,
  children,
}: TitleListProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4" data-tour="page-title">
      <div className="min-w-0">
        {title && (
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-start text-foreground">{title}</h2>
        )}
        {suTitle && (
          <p className="text-start text-xs sm:text-sm text-muted-foreground mt-0.5">
            {suTitle}
          </p>
        )}
      </div>
      {separator && <Separator />}
      {children && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
