"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload, X } from "lucide-react"

interface CourseFormData {
  title: string
  description: string
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  price: number
  isFree: boolean
  image?: string
  imagePublicId?: string
}

interface CourseFormProps {
  initialData?: Partial<CourseFormData>
  courseId?: string
  mode?: "create" | "edit"
}

const categories = [
  "Programación",
  "Diseño",
  "Marketing",
  "Negocios",
  "Desarrollo Personal",
  "Idiomas",
  "Matemáticas",
  "Ciencias",
  "Arte",
  "Música"
]

const levels = [
  { value: "BEGINNER", label: "Principiante" },
  { value: "INTERMEDIATE", label: "Intermedio" },
  { value: "ADVANCED", label: "Avanzado" }
] as const

export function CourseForm({ initialData, courseId, mode = "create" }: CourseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    level: initialData?.level || "BEGINNER",
    price: initialData?.price || 0,
    isFree: initialData?.isFree || false,
    image: initialData?.image || "",
    imagePublicId: initialData?.imagePublicId || ""
  })

  // Sincronizar imagePreview con formData.image
  useEffect(() => {
    setImagePreview(formData.image || null)
  }, [formData.image])

  // Actualizar formData cuando cambien los initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        level: initialData.level || "BEGINNER",
        price: initialData.price || 0,
        isFree: initialData.isFree || false,
        image: initialData.image || "",
        imagePublicId: initialData.imagePublicId || ""
      })
    }
  }, [initialData])
  const handleInputChange = (field: keyof CourseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: "El archivo debe ser una imagen" }))
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: "La imagen no puede superar los 5MB" }))
      return
    }    try {
      setUploadingImage(true)
      setErrors(prev => ({ ...prev, image: "" }))

      // Subir directamente a Cloudinary sin preview local
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen')
      }

      // Actualizar formData con la URL y publicId de Cloudinary
      setFormData(prev => ({ 
        ...prev, 
        image: data.url,
        imagePublicId: data.publicId 
      }))

      // Mostrar preview solo después de que Cloudinary procese la imagen
      setImagePreview(data.url)

      console.log('Image uploaded successfully:', { url: data.url, publicId: data.publicId })

    } catch (error) {
      console.error('Error uploading image:', error)
      setErrors(prev => ({ ...prev, image: "Error al subir la imagen. Intenta de nuevo." }))
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }
  const removeImage = async () => {
    if (formData.imagePublicId) {
      try {
        // Opcional: eliminar imagen de Cloudinary
        await fetch('/api/upload/image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ publicId: formData.imagePublicId })
        })
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    }

    setImagePreview(null)
    setFormData(prev => ({ ...prev, image: "", imagePublicId: "" }))
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
    } else if (formData.description.length > 500) {
      newErrors.description = "La descripción no puede exceder 500 caracteres"
    }

    if (!formData.category) {
      newErrors.category = "La categoría es obligatoria"
    }

    if (!formData.isFree && formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0 para cursos pagos"
    }    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevenir envío si se está subiendo una imagen
    if (uploadingImage) {
      setErrors({ submit: "Por favor espera a que se complete la subida de la imagen." })
      return
    }
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        price: formData.price,
        isFree: formData.isFree,
        image: formData.image,
        imagePublicId: formData.imagePublicId
      }

      console.log('Current formData state:', formData)
      console.log('Submitting course data:', submitData)

      const url = mode === "create" ? "/api/courses" : `/api/courses/${courseId}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {        if (data.details) {
          // Errores de validación de Zod
          const zodErrors: Record<string, string> = {}
          data.details.forEach((error: { path: string[]; message: string }) => {
            zodErrors[error.path[0]] = error.message
          })
          setErrors(zodErrors)
        } else {
          throw new Error(data.error || "Error al guardar el curso")
        }
        return
      }

      // Redirigir al dashboard de instructor
      router.push("/dashboard/instructor/courses")
      router.refresh()

    } catch (error) {
      console.error("Error:", error)
      setErrors({ submit: "Error al guardar el curso. Por favor, intenta de nuevo." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Crear Nuevo Curso" : "Editar Curso"}
          </CardTitle>
          <CardDescription>
            {mode === "create" 
              ? "Completa la información básica de tu curso"
              : "Actualiza la información de tu curso"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título del Curso *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Introducción a React y Next.js"
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
                placeholder="Describe qué aprenderán los estudiantes en este curso..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-sm text-gray-600">
                {formData.description.length}/500 caracteres
              </p>
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Nivel */}
            <div className="space-y-2">
              <Label>Nivel de Dificultad *</Label>
              <div className="flex gap-3">
                {levels.map(level => (
                  <label key={level.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="level"
                      value={level.value}
                      checked={formData.level === level.value}
                      onChange={(e) => handleInputChange("level", e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Badge variant={formData.level === level.value ? "default" : "outline"}>
                      {level.label}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => handleInputChange("isFree", e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="isFree">Curso gratuito</Label>
              </div>

              {!formData.isFree && (                <div className="space-y-2">
                  <Label htmlFor="price">Precio (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                    placeholder="99.99"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.price}
                    </p>
                  )}
                </div>
              )}
            </div>            {/* Imagen */}
            <div className="space-y-4">
              <Label>Imagen del Curso</Label>
                {uploadingImage && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <p className="text-blue-700 text-sm font-medium">Procesando imagen en Cloudinary...</p>
                      <p className="text-blue-600 text-xs">Por favor espera mientras optimizamos tu imagen</p>
                    </div>
                  </div>
                </div>
              )}
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Preview del curso"
                    width={640}
                    height={360}
                    className="w-80 h-45 object-cover rounded-lg border shadow-md"
                    style={{ aspectRatio: '16/9' }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={uploadingImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Selecciona una imagen para tu curso</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={uploadingImage}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {uploadingImage ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Subiendo...
                      </div>
                    ) : (
                      "Seleccionar Imagen"
                    )}
                  </Button>
                </div>
              )}
              
              {/* Error de imagen */}
              {errors.image && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading || uploadingImage}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploadingImage}>
                {uploadingImage ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subiendo imagen...
                  </div>
                ) : loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </div>
                ) : (
                  mode === "create" ? "Crear Curso" : "Actualizar Curso"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
