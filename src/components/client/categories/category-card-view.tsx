"use client";
import { Category } from "@/types";
import { formatDateTime } from "@/utils";
import { useCategoryActions } from "@/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  ButtonOnlyAction,
  Icon,
} from "@/components";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCardView({ category }: CategoryCardProps) {
  const { handlerEditCategory, handlerDetailsCategory, toggleStatusCategory } =
    useCategoryActions();

  return (
    <Card className="relative overflow-hidden transition-shadow duration-200 border border-border bg-card hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Icon name="Tag" className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                Criado em {formatDateTime(category.createdAt)}
              </p>
            </div>
          </div>
          <ButtonOnlyAction
            data={category}
            actions={[
              { label: "Ver detalhes", onClick: handlerDetailsCategory },
              { label: "Editar", onClick: handlerEditCategory },
              {
                label: `${category.isActive ? "Desactivar" : "Activar"}`,
                onClick: toggleStatusCategory,
              },
            ]}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {category.description && (
          <p className="text-sm text-muted-foreground">
            {category.description.length > 40
              ? category.description.substring(0, 35) + "..."
              : category.description}
          </p>
        )}
        <p className="text-xs">
          Status:{" "}
          <span
            className={`font-medium ${
              category.isActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {category.isActive ? "Activa" : "Inactiva"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Última actualização: {formatDateTime(category.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}
