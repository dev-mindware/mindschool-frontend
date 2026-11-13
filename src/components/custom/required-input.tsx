"use client"

import { useId } from "react"
import { Label } from "@/components"
import { AlertError } from "@/components/common/alert-error"
import { cn } from "@/lib/utils"
import type { InputHTMLAttributes, ReactNode } from "react"

interface LabeledInputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
  error?: string
}

export default function RequiredInput({
  label,
  icon,
  error,
  className,
  ...props
}: LabeledInputWithIconProps) {
  const id = useId()

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </Label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "ps-9 w-full rounded-xs border px-3 py-2 text-sm bg-background outline-none transition-colors",
            error ? "border-red-500 ring-1 ring-red-400" : "border-input focus:border-primary",
            className
          )}
          {...props}
        />
        <div className="absolute inset-y-0 left-0 flex items-center justify-center pointer-events-none ps-3 text-muted-foreground/80">
          {icon}
        </div>
      </div>
      {error && <AlertError id={id} errorMessage={error} />}
    </div>
  )
}
