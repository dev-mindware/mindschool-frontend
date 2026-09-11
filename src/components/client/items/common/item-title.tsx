import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { useMemo } from "react";

export const ProductTitle = ({ name }: { name: string }) => {
  const truncatedName = useMemo(() => {
    const maxLength = 23;
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  }, [name]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <h3 className="text-sm font-semibold leading-tight truncate cursor-default text-foreground">
          {truncatedName}
        </h3>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
};