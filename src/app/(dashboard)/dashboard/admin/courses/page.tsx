"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { BookOpen, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface Course {
  id: string
  title: string
  description: string
  level: string
  price: number
  isFree: boolean
  isPublished: boolean
  createdAt: string
  instructor: {
    name: string
    email: string
  }
  _count: {
    enrollments: number
    modules: number
  }
}

export default function CoursesManagementPage() {
  const { data: session } = useSession()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [levelFilter, setLevelFilter] = useState("ALL")

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchCourses()
    }
  }, [session])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/courses")
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || 
                         (statusFilter === "PUBLISHED" && course.isPublished) ||
                         (statusFilter === "DRAFT" && !course.isPublished)
    const matchesLevel = levelFilter === "ALL" || course.level === levelFilter
    return matchesSearch && matchesStatus && matchesLevel
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cursos</h1>
          <p className="text-muted-foreground">
            Administra y modera todos los cursos de la plataforma
          </p>
        </div>
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
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {courses.filter(c => !c.isPublished).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cursos Gratis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {courses.filter(c => c.isFree).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por título o instructor..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="PUBLISHED">Publicados</option>
                <option value="DRAFT">Borradores</option>
              </select>
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="ALL">Todos los niveles</option>
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cursos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Cursos ({filteredCourses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-gray-600">por {course.instructor.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {course._count.enrollments} estudiantes • {course._count.modules} módulos
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Creado: {new Date(course.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {course.isFree ? 'Gratis' : formatPrice(course.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={course.isPublished ? "success" : "warning"}>
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
                        <Badge variant={getLevelBadgeVariant(course.level) as any}>
                          {getLevelLabel(course.level)}
                        </Badge>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron cursos
                </h3>
                <p className="text-gray-500">
                  Ajusta los filtros de búsqueda para ver más resultados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
