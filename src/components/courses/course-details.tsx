"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Edit, 
  Eye, 
  EyeOff, 
  Plus, 
  Star, 
  Users, 
  BookOpen, 
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2,
  Settings
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CourseDetailsProps {
  course: {
    id: string
    title: string
    description: string
    category: string
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    price: number
    isFree: boolean
    image?: string | null
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
    modules: Array<{
      id: string
      title: string
      description: string
      order: number
      lessons: Array<{
        id: string
        title: string
        type: string
        order: number
      }>
    }>
    _count: {
      enrollments: number
      reviews: number
    }
    reviews: Array<{
      id: string
      rating: number
      comment: string
      user: {
        name: string
      }
    }>
    totalLessons: number
    averageRating: number
  }
}

const levelLabels = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado"
}

const levelColors = {
  BEGINNER: "bg-green-100 text-green-800",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800",
  ADVANCED: "bg-red-100 text-red-800"
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handlePublishToggle = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isPublished: !course.isPublished
        })
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el curso")
      }

      router.refresh()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el curso")
      }

      router.push("/dashboard/instructor/courses")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">
            Creado el {new Date(course.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button 
            variant={course.isPublished ? "outline" : "default"}
            size="sm"
            onClick={handlePublishToggle}
            disabled={loading}
          >
            {course.isPublished ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Despublicar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status y estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado</p>
                <div className="mt-1">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Publicado" : "Borrador"}
                  </Badge>
                </div>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{course._count.enrollments}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lecciones</p>
                <p className="text-2xl font-bold text-gray-900">{course.totalLessons}</p>
              </div>
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-gray-900">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">({course._count.reviews})</span>
                </div>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del curso */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-600">{course.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Categoría</h4>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nivel</h4>
                  <Badge className={levelColors[course.level]}>
                    {levelLabels[course.level]}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Precio</h4>
                <p className="text-lg font-bold text-gray-900">
                  {course.isFree ? "Gratuito" : formatPrice(course.price)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Módulos y lecciones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contenido del Curso</CardTitle>
                <CardDescription>
                  {course.modules.length} módulos, {course.totalLessons} lecciones
                </CardDescription>
              </div>
              <Link href={`/dashboard/instructor/courses/${course.id}/modules/create`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Módulo
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {course.modules.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay módulos todavía
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza añadiendo el primer módulo a tu curso
                  </p>
                  <Link href={`/dashboard/instructor/courses/${course.id}/modules/create`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Módulo
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {index + 1}. {module.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {module.lessons.length} lecciones
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}`}>
                              <Settings className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                      
                      {module.lessons.length > 0 && (
                        <div className="space-y-2">
                          {module.lessons.slice(0, 3).map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              <span>{lessonIndex + 1}. {lesson.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                          ))}
                          {module.lessons.length > 3 && (
                            <div className="text-sm text-gray-500">
                              + {module.lessons.length - 3} lecciones más
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Imagen del curso */}
          {course.image && (
            <Card>
              <CardContent className="p-4">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              </CardContent>
            </Card>
          )}

          {/* Reseñas recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Reseñas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {course.reviews.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No hay reseñas todavía
                </p>
              ) : (
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.user.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/instructor/courses/${course.id}/analytics`}>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver Analíticas
                </Button>
              </Link>
              
              <Link href={`/dashboard/instructor/courses/${course.id}/students`}>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Estudiantes
                </Button>
              </Link>

              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Curso
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">¿Eliminar curso?</CardTitle>
              <CardDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el curso
                y todo su contenido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
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
