"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ClearSearchButtonProps {
  searchTerm: string
}

export function ClearSearchButton({ searchTerm }: ClearSearchButtonProps) {
  const router = useRouter()

  const handleClearSearch = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    router.push(url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''))
  }

  if (!searchTerm) return null

  return (
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={handleClearSearch}
    >
      Limpiar búsqueda
    </Button>
  )
}
