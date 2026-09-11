import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Icon } from "@/components";
import { cn } from "@/lib/utils";
import { icons } from "lucide-react";

interface OverviewSectionCardProps {
    title: string;
    icon: keyof typeof icons;
    /** Link do "Ver todos". Omitir esconde a acção. */
    href?: string;
    actionLabel?: string;
    className?: string;
    children: React.ReactNode;
}

/**
 * Cartão de secção do dashboard: cabeçalho com ícone, título e link "Ver todos".
 * Usado pelos blocos de Clientes, Contas a Receber, Stock e Actividade Recente.
 */
export function OverviewSectionCard({
    title,
    icon,
    href,
    actionLabel = "Ver todos",
    className,
    children,
}: OverviewSectionCardProps) {
    return (
        <Card className={cn("flex flex-col h-full gap-0 py-4", className)}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon name={icon} className="size-4" />
                    </span>
                    {title}
                </CardTitle>

                {href && (
                    <Link
                        href={href}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                        {actionLabel}
                        <Icon name="ArrowRight" className="size-3.5" />
                    </Link>
                )}
            </CardHeader>

            <CardContent className="flex-1 px-4">{children}</CardContent>
        </Card>
    );
}
