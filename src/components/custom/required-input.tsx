"use client"

import { useId } from "react"
import { Input, Label } from "@/components"
import { cn } from "@/lib/utils"
import type { InputHTMLAttributes, ReactNode } from "react"

interface LabeledInputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
}

export default function RequiredInput({
  label,
  icon,
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
          className={cn("ps-9", className)}
          {...props}
        />
        <div className="absolute inset-y-0 left-0 flex items-center justify-center pointer-events-none ps-3 text-muted-foreground/80">
          {icon}
        </div>
      </div>
    </div>
  )
}
