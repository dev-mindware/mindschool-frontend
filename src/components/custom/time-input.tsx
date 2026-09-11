"use client"

import { ClockIcon } from "lucide-react"
import { DateInput, TimeField } from "@/components/ui/datefield-rac"

interface TimeInputProps {
  id?: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function TimeInput({
  id,
  className,
  ...rest
}: TimeInputProps) {
  return (
    <TimeField className={className ?? "*:not-first:mt-2"} {...rest}>
      <div className="relative">
        <DateInput id={id ?? ""} />
        <div className="absolute inset-y-0 z-10 flex items-center justify-center pointer-events-none text-muted-foreground/80 end-0 pe-3">
          <ClockIcon size={16} aria-hidden="true" />
        </div>
      </div>
    </TimeField>
  )
}
