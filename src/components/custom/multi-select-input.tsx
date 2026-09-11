import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface QuizSelectProps {
  options: Option[]
  value: string[] // múltiplas seleções
  onChange: (value: string[]) => void
  className?: string
}

export function MultiQuizSelect({
  options,
  value,
  onChange,
  className,
}: QuizSelectProps) {
  const handleSelect = (val: string) => {
    const isSelected = value.includes(val)

    if (isSelected) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {options.map((opt) => {
        const isSelected = value.includes(opt.value)
        const Icon = opt.icon

        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-left transition-all border",
              isSelected
                ? "border-primary bg-background ring-2 ring-primary/50"
                : "bg-sidebar border-transparent hover:border-muted-foreground/20 text-muted-foreground"
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  "w-5 h-5",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              />
            )}
            <span
              className={cn(
                "text-sm font-normal",
                isSelected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
