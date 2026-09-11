import { icons } from "lucide-react";
import { Icon } from "../icon";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ProtectedAction } from "@/components/guards";

type ActionVariant = "default" | "destructive" | "outline";

type ActionItem<T> = {
  label: string;
  onClick: (data: T) => void;
  icon?: keyof typeof icons;
  variant?: ActionVariant;
  className?: string;
  isProtected?: boolean; // Permite forçar ou remover a proteção manualmente
};

type SeparatorItem = {
  type: "separator";
};

type Action<T> = ActionItem<T> | SeparatorItem;

type Props<T> = {
  data: T;
  actions: Action<T>[];
};

const variantStyles: Record<ActionVariant, string> = {
  default: "",
  destructive: "text-destructive focus:text-destructive focus:bg-destructive/15 bg-destructive/5",
  outline: "text-muted-foreground opacity-60",
};

function isSeparator<T>(action: Action<T>): action is SeparatorItem {
  return "type" in action && action.type === "separator";
}

export function ButtonOnlyAction<T>({ data, actions }: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full shadow-none"
          aria-label="Open actions menu"
        >
          <Icon name="Ellipsis" size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {actions.map((action, index) => {
          if (isSeparator(action)) {
            return <DropdownMenuSeparator key={`separator-${index}`} />;
          }

          const variant = action.variant || "default";
          const itemKey = action.label + index;

          // Verifica se o rótulo indica uma acção crítica, excepto quando isProtected já estiver definido.
          const isCritical =
            action.isProtected ??
            /criar|novo|editar|apagar|excluir|remover|deletar|gerar|cancelar|clonar|converter|emitir/i.test(
              action.label
            );

          const menuItemContent = (
            <>
              {action.icon && (
                <Icon
                  name={action.icon}
                  size={18}
                  className="mr-2 [&>svg]:text-current"
                  aria-hidden="true"
                />
              )}
              {action.label}
            </>
          );

          if (isCritical) {
            return (
              <ProtectedAction key={itemKey}>
                <DropdownMenuItem
                  onClick={() => action.onClick(data)}
                  className={cn(variantStyles[variant], action.className)}
                >
                  {menuItemContent}
                </DropdownMenuItem>
              </ProtectedAction>
            );
          }

          return (
            <DropdownMenuItem
              key={itemKey}
              onClick={() => action.onClick(data)}
              className={cn(variantStyles[variant], action.className)}
            >
              {menuItemContent}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


/* import { Icon } from "../icon";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

type Action<T> = {
  label: string;
  onClick: (data: T) => void;
  className?: string;
};

type Props<T> = {
  data: T;
  actions: Action<T>[];
};

export function ButtonOnlyAction<T>({ data, actions }: Props<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full shadow-none"
          aria-label="Open actions menu"
        >
          <Icon name="Ellipsis" size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={action.label + index}
            onClick={() => action.onClick(data)}
            className={action.className}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
 */
