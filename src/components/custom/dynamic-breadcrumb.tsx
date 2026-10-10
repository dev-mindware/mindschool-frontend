import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface Props {
  routePath?: string;
  routeLabel?: string;
  subRoute?: string;
  showSeparator?: boolean;
  segments?: BreadcrumbSegment[];
}

export function DinamicBreadcrumb({
  routePath,
  routeLabel,
  subRoute,
  showSeparator = true,
  segments,
}: Props) {
  if (segments && segments.length > 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap gap-1.5 sm:gap-2">
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            return (
              <span key={idx} className="inline-flex items-center gap-1.5 sm:gap-2">
                <BreadcrumbItem className={!isLast ? "hidden sm:inline-flex" : "inline-flex"}>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {seg.label}
                    </BreadcrumbPage>
                  ) : seg.href ? (
                    <BreadcrumbLink
                      href={seg.href}
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                    >
                      {seg.label}
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground font-medium text-sm">
                      {seg.label}
                    </span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden sm:inline-flex" />}
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // «Financeiro › Financeiro»: nunca repetir a mesma etiqueta.
  const showRoute = Boolean(routeLabel) && routeLabel !== subRoute;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap gap-1.5 sm:gap-2">
        {showRoute && (
          <>
            <BreadcrumbItem className="hidden sm:inline-flex items-center">
              {routePath ? (
                <BreadcrumbLink
                  href={routePath}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  {routeLabel}
                </BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground font-medium text-sm">
                  {routeLabel}
                </span>
              )}
            </BreadcrumbItem>
            {showSeparator && subRoute && (
              <BreadcrumbSeparator className="hidden sm:inline-flex" />
            )}
          </>
        )}
        {subRoute && (
          <BreadcrumbItem className="inline-flex items-center">
            <BreadcrumbPage className="font-medium text-foreground">
              {subRoute}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
