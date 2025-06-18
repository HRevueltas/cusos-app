"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Filter } from "lucide-react"

interface FilterSidebarProps {
  categories: string[]
}

const levelOptions = [
  { value: "BEGINNER", label: "Principiante" },
  { value: "INTERMEDIATE", label: "Intermedio" },
  { value: "ADVANCED", label: "Avanzado" }
]

const priceOptions = [
  { value: "free", label: "Gratuito" },
  { value: "paid", label: "De pago" }
]

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentCategory = searchParams.get('category')
  const currentLevel = searchParams.get('level')
  const currentPrice = searchParams.get('price')

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filtering
    params.delete('page')
    
    router.push(`/courses?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('level')
    params.delete('price')
    params.delete('page')
    router.push(`/courses?${params.toString()}`)
  }

  const hasActiveFilters = currentCategory || currentLevel || currentPrice

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categorías */}
        <div>
          <h3 className="font-medium text-sm text-gray-900 mb-3">Categoría</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={currentCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => 
                  updateFilter('category', currentCategory === category ? null : category)
                }
                className="w-full justify-start"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Nivel */}
        <div>
          <h3 className="font-medium text-sm text-gray-900 mb-3">Nivel</h3>
          <div className="space-y-2">
            {levelOptions.map((level) => (
              <Button
                key={level.value}
                variant={currentLevel === level.value ? "default" : "ghost"}
                size="sm"
                onClick={() => 
                  updateFilter('level', currentLevel === level.value ? null : level.value)
                }
                className="w-full justify-start"
              >
                {level.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Precio */}
        <div>
          <h3 className="font-medium text-sm text-gray-900 mb-3">Precio</h3>
          <div className="space-y-2">
            {priceOptions.map((price) => (
              <Button
                key={price.value}
                variant={currentPrice === price.value ? "default" : "ghost"}
                size="sm"
                onClick={() => 
                  updateFilter('price', currentPrice === price.value ? null : price.value)
                }
                className="w-full justify-start"
              >
                {price.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Filtros activos</h3>
              <div className="flex flex-wrap gap-2">
                {currentCategory && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('category', null)}>
                    {currentCategory}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {currentLevel && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('level', null)}>
                    {levelOptions.find(l => l.value === currentLevel)?.label}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {currentPrice && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter('price', null)}>
                    {priceOptions.find(p => p.value === currentPrice)?.label}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
