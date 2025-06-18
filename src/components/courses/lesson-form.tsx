"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Función para convertir URLs de YouTube a formato embebido
const getYouTubeEmbedUrl = (url: string): string => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(youtubeRegex)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}

// Función para convertir URLs de Vimeo a formato embebido
const getVimeoEmbedUrl = (url: string): string => {
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/
  const match = url.match(vimeoRegex)
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`
  }
  return url
}

// Función para detectar el tipo de video y obtener la URL embebida
const getEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return getYouTubeEmbedUrl(url)
  } else if (url.includes('vimeo.com')) {
    return getVimeoEmbedUrl(url)
  }
  // Para otros proveedores o videos directos, intentar usar la URL tal como está
  return url
}
import { AlertCircle, FileText, Video, File, HelpCircle, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"
import { QuizForm } from "./quiz-form"
import { SimpleEditor } from "@/components/ui/simple-editor"

interface QuizQuestion {
  id?: string
  question: string
  order: number
  options: Array<{
    id?: string
    text: string
    isCorrect: boolean
    order: number
  }>
}

interface LessonFormData {
  title: string
  content: string
  type: "TEXT" | "VIDEO" | "PDF" | "QUIZ"
  videoUrl?: string
  fileUrl?: string
  order: number
  questions?: QuizQuestion[]
}

interface LessonFormProps {
  courseId: string
  moduleId: string
  initialData?: Partial<LessonFormData>
  lessonId?: string
  mode?: "create" | "edit"
  existingLessons?: Array<{ id: string; title: string; order: number }>
  courseName?: string
  moduleName?: string
}

const lessonTypes = [
  { value: "TEXT", label: "Texto", icon: FileText, description: "Contenido de texto con formato" },
  { value: "VIDEO", label: "Video", icon: Video, description: "Lección en video" },
  { value: "PDF", label: "PDF", icon: File, description: "Documento PDF" },
  { value: "QUIZ", label: "Quiz", icon: HelpCircle, description: "Cuestionario o evaluación" }
] as const

export function LessonForm({ 
  courseId, 
  moduleId, 
  initialData, 
  lessonId, 
  mode = "create",
  existingLessons = [],
  courseName,
  moduleName
}: LessonFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<LessonFormData>({
    title: initialData?.title || "",
    content: initialData?.content || "",
    type: initialData?.type || "TEXT",
    videoUrl: initialData?.videoUrl || "",
    fileUrl: initialData?.fileUrl || "",
    order: initialData?.order || (existingLessons.length + 1),
    questions: initialData?.questions || []
  })

  const handleInputChange = (field: keyof LessonFormData, value: string | number | QuizQuestion[]) => {
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

    if (!formData.content.trim()) {
      newErrors.content = "El contenido es obligatorio"
    }

    if (formData.order <= 0) {
      newErrors.order = "El orden debe ser mayor a 0"
    }

    // Validar orden único (solo en modo crear o si cambió el orden)
    if (mode === "create" || formData.order !== initialData?.order) {
      const orderExists = existingLessons.some(lesson => 
        lesson.order === formData.order && lesson.id !== lessonId
      )
      if (orderExists) {
        newErrors.order = "Ya existe una lección con ese orden"
      }
    }    // Validaciones específicas por tipo
    if (formData.type === "VIDEO" && formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = "La URL del video no es válida"
    }

    if (formData.type === "PDF" && formData.fileUrl && !isValidUrl(formData.fileUrl)) {
      newErrors.fileUrl = "La URL del archivo no es válida"
    }

    // Validaciones para quiz
    if (formData.type === "QUIZ") {
      if (!formData.questions || formData.questions.length === 0) {
        newErrors.questions = "El quiz debe tener al menos una pregunta"
      } else {
        // Validar cada pregunta
        const questionErrors = formData.questions.some(question => {
          if (!question.question.trim()) return true
          
          const validOptions = question.options.filter(option => option.text.trim())
          if (validOptions.length < 2) return true
          
          const correctOptions = question.options.filter(option => option.isCorrect && option.text.trim())
          if (correctOptions.length === 0) return true
          
          return false
        })
        
        if (questionErrors) {
          newErrors.questions = "Algunas preguntas tienen errores. Por favor revísalas."
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        videoUrl: formData.type === "VIDEO" ? formData.videoUrl : "",
        fileUrl: formData.type === "PDF" ? formData.fileUrl : "",
        questions: formData.type === "QUIZ" ? formData.questions : []
      }

      const url = mode === "create" 
        ? `/api/courses/${courseId}/modules/${moduleId}/lessons`
        : `/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`
      const method = mode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Errores de validación de Zod
          const zodErrors: Record<string, string> = {}
          data.details.forEach((error: { path: string[]; message: string }) => {
            zodErrors[error.path[0]] = error.message
          })
          setErrors(zodErrors)
        } else {
          throw new Error(data.error || "Error al guardar la lección")
        }
        return
      }

      // Redirigir al módulo
      router.push(`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`)
      router.refresh()

    } catch (error) {
      console.error("Error:", error)
      setErrors({ submit: "Error al guardar la lección. Por favor, intenta de nuevo." })    } finally {
      setLoading(false)
    }
  }

  const renderPreviewContent = () => {
    if (!formData.title || !formData.content) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Completa el título y contenido para ver la preview</p>
        </div>
      )
    }

    switch (formData.type) {      case "VIDEO":
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{formData.title}</h1>
            {formData.videoUrl && (
              <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={getEmbedUrl(formData.videoUrl)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={formData.title}
                />
              </div>
            )}
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        )

      case "PDF":
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{formData.title}</h1>
            {formData.fileUrl && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <File className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">Archivo PDF</p>
                <a 
                  href={formData.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {formData.fileUrl}
                </a>
              </div>
            )}
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        )

      case "QUIZ":
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">{formData.title}</h1>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
            
            {formData.questions && formData.questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Preguntas del Quiz</h3>
                {formData.questions.map((question, index) => (
                  <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {index + 1}. {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex}
                            className={`p-3 rounded-lg border ${
                              option.isCorrect 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                option.isCorrect 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {option.isCorrect && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <span className={option.isCorrect ? 'font-medium' : ''}>
                                {option.text}
                              </span>
                              {option.isCorrect && (
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                  Correcta
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{formData.title}</h1>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.content }}
            />
          </div>
        )
    }
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case "VIDEO":
        return (
          <div className="space-y-2">
            <Label htmlFor="videoUrl">URL del Video</Label>
            <Input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={errors.videoUrl ? "border-red-500" : ""}
            />
            {errors.videoUrl && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.videoUrl}
              </p>
            )}
            <p className="text-sm text-gray-600">
              Soporta YouTube, Vimeo y otros servicios de video
            </p>
          </div>
        )

      case "PDF":
        return (
          <div className="space-y-2">
            <Label htmlFor="fileUrl">URL del Archivo PDF</Label>
            <Input
              id="fileUrl"
              type="url"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange("fileUrl", e.target.value)}
              placeholder="https://ejemplo.com/archivo.pdf"
              className={errors.fileUrl ? "border-red-500" : ""}
            />
            {errors.fileUrl && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.fileUrl}
              </p>
            )}            <p className="text-sm text-gray-600">
              URL directa al archivo PDF
            </p>
          </div>
        )

      case "QUIZ":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Preguntas del Quiz *</Label>
              <p className="text-sm text-gray-600">
                Crea las preguntas para el cuestionario. Cada pregunta debe tener al menos 2 opciones y una respuesta correcta.
              </p>
              {errors.questions && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.questions}
                </p>
              )}
            </div>
            <QuizForm
              questions={formData.questions || []}
              onChange={(questions) => handleInputChange("questions", questions)}
            />
          </div>
        )

      default:
        return null
    }
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/dashboard/instructor/courses/${courseId}/modules/${moduleId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="text-sm text-muted-foreground">
              {courseName && moduleName && (
                <>
                  {courseName} / {moduleName}
                </>
              )}
            </div>
          </div>
          <CardTitle>
            {mode === "create" ? "Crear Nueva Lección" : "Editar Lección"}
          </CardTitle>
          <CardDescription>
            {mode === "create" 
              ? "Añade una nueva lección al módulo"
              : "Actualiza la información de la lección"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Lección *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Ej: Introducción a React Hooks"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Tipo de lección */}
            <div className="space-y-4">
              <Label>Tipo de Lección *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lessonTypes.map((type) => (
                  <div
                    key={type.value}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("type", type.value)}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <type.icon className={`h-8 w-8 ${
                        formData.type === type.value ? "text-blue-600" : "text-gray-400"
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orden */}
            <div className="space-y-2">
              <Label htmlFor="order">Orden *</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 1)}
                className={errors.order ? "border-red-500" : ""}
              />
              {errors.order && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.order}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Orden de la lección dentro del módulo
              </p>
            </div>

            {/* Campos específicos por tipo */}
            {renderTypeSpecificFields()}            {/* Contenido */}
            <div className="space-y-2">
              <Label htmlFor="content">Contenido *</Label>
              <SimpleEditor
                value={formData.content}
                onChange={(value) => handleInputChange("content", value)}
                placeholder="Describe el contenido de la lección..."
                className={errors.content ? "border-red-500" : ""}
              />
              {errors.content && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.content}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Usa el editor para dar formato al contenido. Soporta Markdown.
              </p>
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
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                disabled={loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? "Ocultar Preview" : "Ver Preview"}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : (mode === "create" ? "Crear Lección" : "Actualizar Lección")}
              </Button>
            </div>          </form>
        </CardContent>
      </Card>
      
      {/* Preview */}
      {showPreview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa de la Lección
            </CardTitle>
            <CardDescription>
              Así es como se verá esta lección para los estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderPreviewContent()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
