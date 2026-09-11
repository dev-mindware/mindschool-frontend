  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../ui";

  interface Props {
    routePath?: string;
    routeLabel?: string;  
    subRoute: string;     
    showSeparator?: boolean;
  }

  export function DinamicBreadcrumb({
    routePath,
    routeLabel,
    subRoute,
    showSeparator = true,
  }: Props) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {routePath && routeLabel && (
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={routePath}>{routeLabel}</BreadcrumbLink>
            </BreadcrumbItem>
          )}
          {showSeparator && routePath && (
            <BreadcrumbSeparator className="hidden md:block" />
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{subRoute}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }
