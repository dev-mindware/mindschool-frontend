"use client"

import { forwardRef, useId, useState } from "react"
import { Input, Icon } from "@/components"

import type { InputHTMLAttributes } from "react"

export const InputPassword = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, placeholder = "Password", ...props }, ref) => {
  const id = useId()
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          ref={ref}
          className={`pe-9 ps-9 ${className ?? ""}`}
          placeholder={placeholder}
          type={isVisible ? "text" : "password" as any}
          {...props}
        />
        <div className="absolute inset-y-0 flex items-center justify-center pointer-events-none text-muted-foreground/80 start-0 ps-3 peer-disabled:opacity-50">
          <Icon name="Lock" size={16} aria-hidden="true" />
        </div>
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls={id}
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVisible ? (
            <Icon name="EyeOff" size={16} aria-hidden="true" />
          ) : (
            <Icon name="Eye" size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
})

InputPassword.displayName = "InputPassword"
