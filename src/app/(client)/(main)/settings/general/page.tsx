import {
  DefSetup,
  Separator,
  SidebarTrigger,
  DinamicBreadcrumb,
} from "@/components";

export default function Page() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <DinamicBreadcrumb routeLabel="Definições" subRoute="Geral" />
        </div>
      </header>
      <div className="flex flex-col flex-1">
        <div className="@container/main flex flex-1 p-4 flex-col gap-2">
          <DefSetup disabledTabs={["tab-6"]}/>
        </div>
      </div>
    </div>
  );
}
