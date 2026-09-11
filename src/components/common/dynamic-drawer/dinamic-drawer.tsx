"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DynamicDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
}

export function DynamicDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    className,
    side = "right",
}: DynamicDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={side} className={cn("w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 gap-0", className)}>
                {(title || description) && (
                    <SheetHeader className="p-6 pb-4 border-b">
                        {title && <SheetTitle className="text-lg font-bold">{title}</SheetTitle>}
                        {description && <SheetDescription className="text-xs text-muted-foreground">{description}</SheetDescription>}
                    </SheetHeader>
                )}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </SheetContent>
        </Sheet>
    );
}
