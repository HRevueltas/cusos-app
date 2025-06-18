"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Users, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Mail,
  Calendar,
  Award
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface StudentData {
  id: string
  name: string
  email: string
  enrolledAt: string
  courseName: string
  courseId: string
  progress: {
    completed: number
    total: number
    percentage: number
  }
  lastActivity: string
  status: 'active' | 'inactive' | 'completed'
}

export default function InstructorStudentsPage() {
  const { data: session } = useSession()
  const [students, setStudents] = useState<StudentData[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'completed'>('all')
  const [courseFilter, setCourseFilter] = useState<string>('all')

  useEffect(() => {
    if (session?.user?.role === "INSTRUCTOR") {
      fetchStudents()
    }
  }, [session])

  useEffect(() => {
    filterStudents()
  }, [searchTerm, statusFilter, courseFilter, students])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/instructor/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }
  const filterStudents = () => {
    const filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter
      const matchesCourse = courseFilter === 'all' || student.courseId === courseFilter
      
      return matchesSearch && matchesStatus && matchesCourse
    })
    
    setFilteredStudents(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Activo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactivo</Badge>
      case 'completed':
        return <Badge variant="success">Completado</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const uniqueCourses = Array.from(new Set(students.map(s => s.courseId)))
    .map(courseId => ({
      id: courseId,
      name: students.find(s => s.courseId === courseId)?.courseName || ''
    }))

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    completed: students.filter(s => s.status === 'completed').length,
    averageProgress: students.length > 0 
      ? Math.round(students.reduce((acc, s) => acc + s.progress.percentage, 0) / students.length)
      : 0
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
        <h1 className="text-3xl font-bold">Mis Estudiantes</h1>
        <p className="text-muted-foreground">
          Gestiona y revisa el progreso de todos tus estudiantes
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Estudiantes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Progreso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
              <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'completed')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="completed">Completados</option>
            </select>
            
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los cursos</option>
              {uniqueCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Estudiantes */}
      <div className="grid gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card key={`${student.id}-${student.courseId}`} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{student.name}</h3>
                        {getStatusBadge(student.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {student.courseName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Inscrito: {new Date(student.enrolledAt).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Última actividad: {new Date(student.lastActivity).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progreso del curso</span>
                          <span className="font-medium">
                            {student.progress.completed} de {student.progress.total} lecciones ({Math.round(student.progress.percentage)}%)
                          </span>
                        </div>
                        <Progress value={student.progress.percentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {Math.round(student.progress.percentage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        completado
                      </div>
                    </div>
                      <Link 
                      href={`/dashboard/instructor/students/${student.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors inline-block text-center"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {students.length === 0 ? "No tienes estudiantes aún" : "No se encontraron estudiantes"}
                </h3>
                <p className="text-gray-500">
                  {students.length === 0 
                    ? "Cuando los estudiantes se inscriban a tus cursos aparecerán aquí"
                    : "Intenta ajustar los filtros de búsqueda"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
