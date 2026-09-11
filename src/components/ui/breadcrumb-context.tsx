// components/breadcrumb-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

const BreadcrumbTitleContext = createContext<{
  setTitle: (title: string) => void
} | null>(null)

export function useBreadcrumbTitle() {
  const ctx = useContext(BreadcrumbTitleContext)
  if (!ctx) throw new Error("useBreadcrumbTitle must be used inside BreadcrumbProvider")
  return ctx
}

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState<string>("")

  useEffect(() => {
    if (title) {
      document.title = title 
    }
  }, [title])

  return (
    <BreadcrumbTitleContext.Provider value={{ setTitle }}>
      {children}
    </BreadcrumbTitleContext.Provider>
  )
}
