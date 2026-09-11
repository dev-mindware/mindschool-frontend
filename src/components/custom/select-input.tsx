import { cn } from "@/lib/utils"
import { Icon } from "../common"
import { icons } from "lucide-react"

export interface Option {
  value: string
  label: string
  icon?: keyof typeof icons
}

interface QuizSelectProps {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function QuizSelect({
  options,
  value,
  onChange,
  className,
}: QuizSelectProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-all text-left",
            value === option.value
              ? "border-primary bg-background"
              : "border-transparent bg-sidebar",
            "hover:border-muted-foreground/20"
          )}
        >
          {option.icon && <Icon name={option.icon} className="w-5 h-5 text-foreground" />}
          <span className="text-sm text-muted-foreground">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
