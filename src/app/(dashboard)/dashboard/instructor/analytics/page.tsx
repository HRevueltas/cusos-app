"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { formatPrice } from "@/lib/utils"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Clock,
  Star,
  BookOpen
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalyticsData {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  averageRating: number
  coursesData: {
    courseId: string
    title: string
    studentsCount: number
    revenue: number
    averageRating: number
    completionRate: number
    viewsCount: number
    enrollmentsThisMonth: number
  }[]
  monthlyStats: {
    month: string
    enrollments: number
    revenue: number
  }[]
  topPerformingCourses: {
    courseId: string
    title: string
    metric: number
    metricType: 'students' | 'revenue' | 'rating'
  }[]
}

export default function InstructorAnalyticsPage() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (session?.user?.role === "INSTRUCTOR") {
      fetchAnalytics()
    }
  }, [session, selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/instructor/analytics?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold">Analytics e Insights</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tus cursos y estudiantes
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('7d')}
            className={`px-3 py-2 text-sm rounded-lg ${
              selectedPeriod === '7d' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setSelectedPeriod('30d')}
            className={`px-3 py-2 text-sm rounded-lg ${
              selectedPeriod === '30d' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => setSelectedPeriod('90d')}
            className={`px-3 py-2 text-sm rounded-lg ${
              selectedPeriod === '90d' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            90 días
          </button>
        </div>
      </div>

      {/* Métricas Generales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Total Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">cursos creados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">estudiantes únicos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(analyticsData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">ingresos generados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rating Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analyticsData?.averageRating?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">calificación general</p>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por Curso */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Curso</CardTitle>
        </CardHeader>
        <CardContent>          {analyticsData?.coursesData && analyticsData.coursesData.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.coursesData.map((course, index) => (
                <div key={`course-detail-${course.courseId}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.studentsCount} estudiantes
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatPrice(course.revenue)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {course.averageRating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {course.viewsCount} vistas
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.round(course.completionRate)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        completado
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tasa de Finalización</span>
                      <span className="font-medium">{Math.round(course.completionRate)}%</span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                    
                    {course.enrollmentsThisMonth > 0 && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        +{course.enrollmentsThisMonth} nuevas inscripciones este mes
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos de analytics
              </h3>
              <p className="text-gray-500">
                Crea y publica cursos para ver estadísticas detalladas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cursos con Mejor Rendimiento */}
      {analyticsData?.topPerformingCourses && analyticsData.topPerformingCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cursos con Mejor Rendimiento</CardTitle>
          </CardHeader>
          <CardContent>            <div className="space-y-3">
              {analyticsData.topPerformingCourses.map((course, index) => (
                <div key={`top-course-${course.courseId}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.metricType === 'students' && 'Más estudiantes'}
                        {course.metricType === 'revenue' && 'Mayores ingresos'}
                        {course.metricType === 'rating' && 'Mejor valorado'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {course.metricType === 'students' && `${course.metric} estudiantes`}
                      {course.metricType === 'revenue' && formatPrice(course.metric)}
                      {course.metricType === 'rating' && `${course.metric.toFixed(1)} ⭐`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
