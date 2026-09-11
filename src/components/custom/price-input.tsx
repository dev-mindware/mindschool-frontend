import { useId } from "react"

import { Input } from "@/components/ui/input"

interface PriceInputProps {
  id?: string
  placeholder?: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any 
}

export default function PriceInput({
  id,
  placeholder = "0.00",
  className,
  ...rest
}: PriceInputProps) {
  const generatedId = useId()

  return (
    <div className="*:not-first:mt-2">
      <div className="relative flex rounded-md shadow-xs">
        <span className="absolute inset-y-0 flex items-center justify-center text-sm pointer-events-none text-muted-foreground start-0 ps-4">
          kz
        </span>
        <Input
          id={id ?? generatedId}
          className={`shadow-none -me-px rounded-e-none ps-8 ${className ?? ""}`}
          placeholder={placeholder}
          type="text"
          {...rest}
        />
        <span className="inline-flex items-center px-3 text-sm border border-input bg-background text-muted-foreground -z-10 rounded-e-md">
          AOA
        </span>
      </div>
    </div>
  )
}
