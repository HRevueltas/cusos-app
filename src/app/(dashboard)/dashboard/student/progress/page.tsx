"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Clock, TrendingUp, Target, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface CourseProgress {
  courseId: string
  courseTitle: string
  courseLevel: string
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  lastActivity: string
  estimatedTimeLeft: string
}

interface ProgressStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLessons: number
  completedLessons: number
  overallProgress: number
  weeklyProgress: number
  monthlyProgress: number
  courses: CourseProgress[]
}

export default function StudentProgressPage() {
  const { data: session } = useSession()
  const [progressData, setProgressData] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "STUDENT") {
      fetchProgressData()
    }
  }, [session])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/progress")
      if (response.ok) {
        const data = await response.json()
        setProgressData(data)
      }
    } catch (error) {
      console.error("Error fetching progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "BEGINNER": return "success"
      case "INTERMEDIATE": return "warning" 
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
      <div>
        <h1 className="text-3xl font-bold">Mi Progreso de Aprendizaje</h1>
        <p className="text-muted-foreground">
          Revisa tu progreso detallado y estadísticas de aprendizaje
        </p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Progreso General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData?.overallProgress || 0}%</div>
            <div className="mt-2">
              <Progress value={progressData?.overallProgress || 0} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Cursos Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {progressData?.completedCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              de {progressData?.totalCourses || 0} cursos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Lecciones Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {progressData?.completedLessons || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              de {progressData?.totalLessons || 0} lecciones
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progreso Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              +{progressData?.weeklyProgress || 0}%
            </div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso por Curso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Curso</CardTitle>
        </CardHeader>
        <CardContent>
          {progressData?.courses && progressData.courses.length > 0 ? (
            <div className="space-y-4">
              {progressData.courses.map((course) => (
                <div key={course.courseId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getLevelBadgeVariant(course.courseLevel) as any}>
                          {getLevelLabel(course.courseLevel)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {course.completedLessons} de {course.totalLessons} lecciones
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.round(course.progressPercentage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        completado
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={course.progressPercentage} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Última actividad: {new Date(course.lastActivity).toLocaleDateString('es-ES')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Tiempo estimado: {course.estimatedTimeLeft}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos de progreso
              </h3>
              <p className="text-gray-500">
                Inscríbete a un curso para comenzar a ver tu progreso
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
