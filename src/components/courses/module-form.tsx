"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ModuleFormData {
  title: string
  description: string
  order: number
}

interface ModuleFormProps {
  courseId: string
  initialData?: Partial<ModuleFormData>
  moduleId?: string
  mode?: "create" | "edit"
  existingModules?: Array<{ id: string; order: number; title: string }>
}

export function ModuleForm({ courseId, initialData, moduleId, mode = "create", existingModules = [] }: ModuleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<ModuleFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    order: initialData?.order || (existingModules.length + 1)
  })

  const handleInputChange = (field: keyof ModuleFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio"
    } else if (formData.title.length > 100) {
      newErrors.title = "El título no puede exceder 100 caracteres"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria"
    } else if (formData.description.length > 300) {
      newErrors.description = "La descripción no puede exceder 300 caracteres"
    }

    if (formData.order < 1) {
      newErrors.order = "El orden debe ser mayor a 0"
    }

    // Verificar orden duplicado
    const orderExists = existingModules.some(module => 
      module.order === formData.order && module.id !== moduleId
    )
    if (orderExists) {
      newErrors.order = "Ya existe un módulo con este orden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const url = mode === "create" 
        ? `/api/courses/${courseId}/modules` 
        : `/api/courses/${courseId}/modules/${moduleId}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Errores de validación de Zod
          const zodErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            zodErrors[error.path[0]] = error.message
          })
          setErrors(zodErrors)
        } else {
          throw new Error(data.error || "Error al guardar el módulo")
        }
        return
      }

      // Redirigir al detalle del curso
      router.push(`/dashboard/instructor/courses/${courseId}`)
      router.refresh()

    } catch (error) {
      console.error("Error:", error)
      setErrors({ submit: "Error al guardar el módulo. Por favor, intenta de nuevo." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Crear Nuevo Módulo" : "Editar Módulo"}
          </CardTitle>
          <CardDescription>
            {mode === "create" 
              ? "Añade un nuevo módulo a tu curso"
              : "Actualiza la información del módulo"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título del Módulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Introducción a los Conceptos Básicos"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe qué se cubrirá en este módulo..."
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-sm text-gray-600">
                {formData.description.length}/300 caracteres
              </p>
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Orden */}
            <div className="space-y-2">
              <Label htmlFor="order">Orden del Módulo *</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 1)}
                className={errors.order ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-600">
                Define el orden en que aparecerá este módulo en el curso
              </p>
              {errors.order && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.order}
                </p>
              )}
            </div>

            {/* Módulos existentes para referencia */}
            {existingModules.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Módulos Existentes:</h4>
                <div className="space-y-1">
                  {existingModules
                    .sort((a, b) => a.order - b.order)
                    .map((module) => (
                      <div key={module.id} className="text-sm text-gray-600">
                        {module.order}. {module.title}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : (mode === "create" ? "Crear Módulo" : "Actualizar Módulo")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
