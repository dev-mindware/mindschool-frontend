import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 cursor-pointer text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 leading-normal transition-all duration-300 backdrop-blur-md shadow-[inset_0_0_2px_rgba(255,255,255,0.4),0_0_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_2px_rgba(255,255,255,0.1),0_0_8px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-destructive-border bg-destructive-muted text-destructive hover:bg-destructive/15",
        outline:
          "border-border bg-background text-foreground hover:bg-muted",
        success:
          "border-success-border bg-success-muted text-success hover:bg-success/20",
        pending:
          "border-warning-border bg-warning-muted text-warning hover:bg-warning/20",
        warning:
          "border-warning-border bg-warning-muted text-warning hover:bg-warning/20",
        info:
          "border-info-border bg-info-muted text-info hover:bg-info/20",
        special:
          "border-special-border bg-special-muted text-special hover:bg-special/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
