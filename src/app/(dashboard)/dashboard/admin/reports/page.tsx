"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { formatPrice } from "@/lib/utils"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BookOpen,
  Download,
  Calendar,
  Filter
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ReportData {
  summary: {
    totalUsers: number
    totalCourses: number
    totalRevenue: number
    totalEnrollments: number
    growthMetrics: {
      usersGrowth: number
      coursesGrowth: number
      revenueGrowth: number
      enrollmentsGrowth: number
    }
  }
  userAnalytics: {
    period: string
    students: number
    instructors: number
    newUsers: number
  }[]
  courseAnalytics: {
    courseId: string
    title: string
    instructor: string
    enrollments: number
    revenue: number
    rating: number
    category: string
  }[]
  revenueAnalytics: {
    period: string
    revenue: number
    enrollments: number
  }[]
  topCategories: {
    category: string
    coursesCount: number
    enrollmentsCount: number
    revenue: number
  }[]
}

export default function AdminReportsPage() {
  const { data: session } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchReportData()
    }
  }, [session, selectedPeriod])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }
  const handleExportReport = async (type: 'users' | 'courses' | 'enrollments' | 'reviews' | 'general') => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}&period=${selectedPeriod}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `reporte_${type}_${selectedPeriod}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Error al exportar reporte')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
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
          <h1 className="text-3xl font-bold">Reportes y Analytics</h1>
          <p className="text-muted-foreground">
            Análisis completo de la plataforma y métricas de negocio
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
          <button
            onClick={() => setSelectedPeriod('1y')}
            className={`px-3 py-2 text-sm rounded-lg ${
              selectedPeriod === '1y' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 año
          </button>
        </div>
      </div>

      {/* Métricas de Resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.summary.totalUsers || 0}</div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500">
                +{reportData?.summary.growthMetrics.usersGrowth || 0}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Total Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reportData?.summary.totalCourses || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500">
                +{reportData?.summary.growthMetrics.coursesGrowth || 0}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
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
              {formatPrice(reportData?.summary.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500">
                +{reportData?.summary.growthMetrics.revenueGrowth || 0}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Total Inscripciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reportData?.summary.totalEnrollments || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500">
                +{reportData?.summary.growthMetrics.enrollmentsGrowth || 0}%
              </span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones de Exportación */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Exportar Reportes</h3>            <div className="flex gap-2">
              <button
                onClick={() => handleExportReport('general')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar General
              </button>
              <button
                onClick={() => handleExportReport('users')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Usuarios
              </button>
              <button
                onClick={() => handleExportReport('courses')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Cursos
              </button>
              <button
                onClick={() => handleExportReport('enrollments')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Inscripciones
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cursos Más Populares */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos Más Populares</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData?.courseAnalytics && reportData.courseAnalytics.length > 0 ? (
            <div className="space-y-4">
              {reportData.courseAnalytics.slice(0, 10).map((course, index) => (
                <div key={course.courseId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">por {course.instructor}</p>
                      <Badge variant="outline" className="mt-1">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-bold">{course.enrollments}</div>
                        <div className="text-muted-foreground">inscripciones</div>
                      </div>
                      <div>
                        <div className="font-bold">{formatPrice(course.revenue)}</div>
                        <div className="text-muted-foreground">ingresos</div>
                      </div>
                      <div>
                        <div className="font-bold">{course.rating.toFixed(1)} ⭐</div>
                        <div className="text-muted-foreground">rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos de cursos
              </h3>
              <p className="text-gray-500">
                Los datos aparecerán cuando haya cursos publicados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorías Más Populares */}
      {reportData?.topCategories && reportData.topCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorías Más Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportData.topCategories.map((category, index) => (
                <div key={category.category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cursos:</span>
                      <span className="font-medium">{category.coursesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inscripciones:</span>
                      <span className="font-medium">{category.enrollmentsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ingresos:</span>
                      <span className="font-medium">{formatPrice(category.revenue)}</span>
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
