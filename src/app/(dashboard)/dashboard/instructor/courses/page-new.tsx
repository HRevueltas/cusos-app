"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Plus, Users, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  level: string
  price: number
  isFree: boolean
  isPublished: boolean
  createdAt: string
  _count: {
    enrollments: number
    modules: number
    reviews: number
  }
  averageRating: number
}

export default function InstructorCoursesPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "INSTRUCTOR") {
      fetchCourses()
    }
  }, [session])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/instructor/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCourses(courses.filter(course => course.id !== courseId))
      } else {
        alert("Error al eliminar el curso")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Error al eliminar el curso")
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "BEGINNER": return "Principiante"
      case "INTERMEDIATE": return "Intermedio"  
      case "ADVANCED": return "Avanzado"
      default: return level
    }
  }

  const getLevelVariant = (level: string) => {
    switch (level) {
      case "BEGINNER": return "default"
      case "INTERMEDIATE": return "secondary"
      case "ADVANCED": return "outline"
      default: return "default"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona tus cursos y contenido educativo
          </p>
        </div>
        <Link href="/dashboard/instructor/courses/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Crear Nuevo Curso
          </Button>
        </Link>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Publicados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {courses.filter(c => c.isPublished).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {courses.reduce((acc, course) => acc + course._count.enrollments, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(courses.reduce((acc, course) => acc + (course.isFree ? 0 : course.price * course._count.enrollments), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cursos */}
      <div className="grid gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                          {course.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Publicado
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Borrador
                            </>
                          )}
                        </Badge>
                        <Badge variant={getLevelVariant(course.level) as any}>
                          {getLevelLabel(course.level)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {course.isFree ? 'Gratis' : formatPrice(course.price)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          {course._count.enrollments} estudiantes
                        </div>
                        <div className="flex items-center text-gray-600">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course._count.modules} módulos
                        </div>
                        <div className="flex items-center text-gray-600">
                          ⭐ {course.averageRating.toFixed(1)} ({course._count.reviews} reseñas)
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="text-right text-sm text-gray-500 mb-2">
                      Creado: {new Date(course.createdAt).toLocaleDateString('es-ES')}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/instructor/courses/${course.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Gestionar
                        </Button>
                      </Link>
                      
                      <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </Link>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tienes cursos creados
                </h3>
                <p className="text-gray-500 mb-6">
                  Comparte tu conocimiento creando tu primer curso
                </p>
                <Link href="/dashboard/instructor/courses/create">
                  <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Crear mi primer curso
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
