import { ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "../common";
import { cn } from "@/lib/utils";

type Props = {
  isLoading: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  /** id do <form> a submeter (permite pôr o botão no rodapé do modal, fora do <form>). */
  form?: string;
}

export function ButtonSubmit({ isLoading, disabled, children, className, form }: Props) {
  return (
    <Button
      disabled={isLoading || disabled}
      type="submit"
      form={form}
      className={cn("w-full", className)}
    >
      {isLoading && <Icon className="animate-spin" name="LoaderCircle" />}
      {children}
    </Button>
  );
}
