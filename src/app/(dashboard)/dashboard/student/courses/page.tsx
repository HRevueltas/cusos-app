"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ReviewIndicator } from "@/components/reviews/review-indicator"
import Link from "next/link"

interface CourseEnrollment {
  id: string
  enrolledAt: string
  course: {
    id: string
    title: string
    description: string
    level: string
    instructor: {
      name: string
    }
  }
  progress: {
    completed: number
    total: number
  }
}

export default function StudentCoursesPage() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "STUDENT") {
      fetchEnrollments()
    }
  }, [session])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/courses")
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrollments || [])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }
  const getLevelBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case "BEGINNER": return "secondary"
      case "INTERMEDIATE": return "outline"
      case "ADVANCED": return "destructive"
      default: return "default"
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
            Continúa tu aprendizaje y revisa tu progreso
          </p>
        </div>
        <Link href="/courses">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Explorar Más Cursos
          </button>
        </Link>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {enrollments.filter(e => e.progress.completed > 0 && e.progress.completed < e.progress.total).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {enrollments.filter(e => e.progress.completed === e.progress.total && e.progress.total > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Cursos */}
      <div className="grid gap-6">
        {enrollments.length > 0 ? (
          enrollments.map((enrollment) => {
            const progressPercentage = enrollment.progress.total > 0 
              ? Math.round((enrollment.progress.completed / enrollment.progress.total) * 100)
              : 0
            
            const isCompleted = enrollment.progress.completed === enrollment.progress.total && enrollment.progress.total > 0
            const isInProgress = enrollment.progress.completed > 0 && !isCompleted
            const isNotStarted = enrollment.progress.completed === 0

            return (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{enrollment.course.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{enrollment.course.description}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-gray-500">
                            por {enrollment.course.instructor.name}
                          </span>                          <Badge variant={getLevelBadgeVariant(enrollment.course.level)}>
                            {getLevelLabel(enrollment.course.level)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Inscrito: {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Progreso: {enrollment.progress.completed} de {enrollment.progress.total} lecciones
                            </span>
                            <span className="font-medium">
                              {progressPercentage}%
                            </span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className="h-2"
                            indicatorClassName={
                              isCompleted ? "bg-green-500" :
                              isInProgress ? "bg-blue-500" : "bg-gray-300"
                            }
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="text-right">
                        {isCompleted && (
                          <div className="flex items-center text-green-600 mb-2">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Completado</span>
                          </div>
                        )}
                        {isInProgress && (
                          <div className="flex items-center text-blue-600 mb-2">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">En progreso</span>
                          </div>
                        )}
                        {isNotStarted && (
                          <div className="flex items-center text-gray-500 mb-2">
                            <Play className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Sin iniciar</span>
                          </div>                        )}
                      </div>
                      
                      {/* Review Indicator - Solo para cursos completados */}
                      <ReviewIndicator
                        courseId={enrollment.course.id}
                        courseTitle={enrollment.course.title}
                        isCompleted={isCompleted}
                      />
                      
                      <Link href={`/learn/${enrollment.course.id}`}>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          {isNotStarted ? "Comenzar" : "Continuar"}
                        </button>
                      </Link>
                        {isCompleted && (
                        <Link href={`/learn/${enrollment.course.id}/certificate`}>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Ver Certificado
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tienes cursos inscritos
                </h3>
                <p className="text-gray-500 mb-6">
                  Explora nuestro catálogo y encuentra el curso perfecto para ti
                </p>
                <Link href="/courses">
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Explorar Cursos
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
