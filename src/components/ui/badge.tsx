import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"


const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 cursor-pointer text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 leading-normal transition-all duration-300 backdrop-blur-md backdrop-saturate-150 shadow-[inset_0_0_2px_rgba(255,255,255,0.4),0_0_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_2px_rgba(255,255,255,0.1),0_0_8px_rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        
        default:
          "border-primary/30 bg-primary/20 text-primary-foreground/90 hover:bg-primary/30 hover:text-primary-foreground dark:bg-primary/15 dark:hover:bg-primary/25 dark:border-primary/40 dark:text-primary-foreground/80",
        secondary:
          "border-secondary/30 bg-secondary/20 text-secondary-foreground/90 hover:bg-secondary/30 hover:text-secondary-foreground dark:bg-secondary/15 dark:hover:bg-secondary/25 dark:border-secondary/40 dark:text-secondary-foreground/80",
        destructive:
          "border-red-500/40 bg-red-500/20 text-red-600 hover:bg-red-500/30 hover:text-red-500 dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20",
        outline:
          "border-black/30 bg-black/5 text-foreground/80 hover:bg-black/20 hover:text-foreground  dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/90",
        success:
          "border-green-500/40 bg-green-500/20 text-green-600 hover:bg-green-500/30 hover:text-green-500 dark:border-green-400/40 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20",
        pending:
          "border-amber-500/40 bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 hover:text-amber-500 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20",
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
