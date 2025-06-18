"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Plus, 
  Trash2, 
  ArrowLeft,
  PlayCircle,
  FileText,
  Video,
  Download,
  Clock,
  GripVertical,
  Eye
} from "lucide-react"

// Función para extraer texto limpio del HTML
const extractTextFromHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    // En el servidor, usar regex simple para limpiar HTML
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
  }
  
  // En el cliente, usar DOMParser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body.textContent || doc.body.innerText || ''
}

interface ModuleManagementProps {
  course: {
    id: string
    title: string
  }
  module: {
    id: string
    title: string
    description: string
    order: number
    lessons: Array<{
      id: string
      title: string
      type: string
      order: number
      duration?: number | null
      content?: string | null
      videoUrl?: string | null
      attachments?: string | null
    }>
  }
}

const lessonTypeIcons = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: PlayCircle,
  ASSIGNMENT: Download
}

const lessonTypeLabels = {
  VIDEO: "Video",
  TEXT: "Texto",
  QUIZ: "Quiz",
  ASSIGNMENT: "Tarea"
}

export function ModuleManagement({ course, module }: ModuleManagementProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const handleDeleteModule = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/modules/${module.id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el módulo")
      }

      router.push(`/dashboard/instructor/courses/${course.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${course.id}/modules/${module.id}/lessons/${lessonId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la lección")
      }

      router.refresh()
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Sin duración"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/instructor/courses/${course.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Curso
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
            <p className="text-gray-600">{course.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar Módulo
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteModule}
            className="text-red-600 hover:text-red-700"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Módulo
          </Button>
        </div>
      </div>

      {/* Información del módulo */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
              <p className="text-gray-600">{module.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Orden</h4>
                <Badge variant="outline">Módulo {module.order}</Badge>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lecciones</h4>
                <p className="text-lg font-bold text-gray-900">{module.lessons.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lecciones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lecciones del Módulo</CardTitle>
            <CardDescription>
              {module.lessons.length} lecciones
            </CardDescription>
          </div>
          <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}/lessons/create`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Lección
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {module.lessons.length === 0 ? (
            <div className="text-center py-12">
              <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay lecciones todavía
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza añadiendo la primera lección a este módulo
              </p>
              <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}/lessons/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Lección
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {module.lessons.map((lesson, index) => {
                const IconComponent = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] || FileText
                
                return (
                  <div key={lesson.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {lesson.order}. {lesson.title}
                            </h4>
                            <Badge variant="outline">
                              {lessonTypeLabels[lesson.type as keyof typeof lessonTypeLabels] || lesson.type}
                            </Badge>
                            {lesson.duration && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lesson.duration)}
                              </div>
                            )}
                          </div>                          {lesson.content && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {extractTextFromHTML(lesson.content).substring(0, 150)}...
                            </p>
                          )}
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                        <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}/preview`}>
                          <Button size="sm" variant="outline" title="Vista previa">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}/edit`}>
                          <Button size="sm" variant="outline" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(lesson.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">¿Eliminar lección?</CardTitle>
              <CardDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente la lección
                y todo su contenido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteLesson(showDeleteConfirm)}
                  disabled={loading}
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
