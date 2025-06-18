"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCallback } from "react"

export function StudentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchTerm = searchParams.get('search') || ""

  const handleSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Buscar estudiantes por nombre o email..."
        defaultValue={searchTerm}
        className="pl-10 w-full sm:w-80"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
