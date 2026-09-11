"use client";
import {
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenu as DropdownMenuPrimitive,
  Button,
  Icon,
} from "@/components";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  id: string;
  route: string;
  primaryAction?: string;
  secondaryAction?: string;
  handlerPrimaryAction?: () => void;
  handlerSecondaryAction?: () => void;
};

export function ButtonActionLink({
  id,
  route,
  primaryAction,
  secondaryAction,
  handlerPrimaryAction,
  handlerSecondaryAction,
}: Props) {
  const searchParams = useSearchParams();
  const invoice = searchParams.get("invoice");
    // clients/documents/new

  const getDetailsPath = () => {
    if (!invoice) return `${route}/${id}`;

    return {
      pathname: `/documents/new`,
      query: { invoice },
    };
  };

  return (
    <DropdownMenuPrimitive>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-gray-100"
        >
          <Icon name="Ellipsis" className="w-4 h-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-max">
        <DropdownMenuGroup>
          {primaryAction && (
            <DropdownMenuItem
              className="rounded-md cursor-pointer"
              onClick={handlerPrimaryAction}
            >
              <Icon name="CheckCheck" className="w-4 h-4 text-gray-500" />
              <span>{primaryAction}</span>
            </DropdownMenuItem>
          )}
          {handlerSecondaryAction && (
            <DropdownMenuItem
              className="rounded-md cursor-pointer"
              onClick={handlerSecondaryAction}
            >
              <Icon name="Ban" className="w-4 h-4 text-gray-500" />
              <span>{secondaryAction}</span>
            </DropdownMenuItem>
          )}
          <Link href={getDetailsPath()}>
            <DropdownMenuItem className="rounded-md cursor-pointer">
              <Icon name="Eye" className="w-4 h-4 text-gray-500" />
              <span>Ver detalhes</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}
