import { Icon } from "@/components/common";
import { Button } from "@/components/ui";
import { ViewMode as ViewModeType } from "@/types";

type Props = {
  viewMode: ViewModeType;
  setViewMode: (viewMode: ViewModeType) => void;
};

export function ViewMode({ setViewMode, viewMode }: Props) {
  return (
    <div className="sm:flex self-center gap-2 p-1 rounded-md shrink-0 bg-sidebar border">
      <Button
        variant={viewMode === "card" ? "default" : "ghost"}
        className={`h-8 w-8 ${
          viewMode === "card" ? "bg-sidebar border hover:bg-sidebar" : ""
        }`}
        onClick={() => setViewMode("card")}
      >
        <Icon
          name="LayoutGrid"
          size={16}
          className={`text-muted-foreground ${
            viewMode === "card" ? "text-primary" : ""
          }`}
        />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        className={`h-8 w-8 ${
          viewMode === "table" ? "bg-sidebar border hover:bg-sidebar" : ""
        }`}
        onClick={() => setViewMode("table")}
      >
        <Icon
          name="Grid3x3"
          size={16}
          className={`text-muted-foreground ${
            viewMode === "table" ? "text-primary" : ""
          }`}
        />
      </Button>
    </div>
  );
}
