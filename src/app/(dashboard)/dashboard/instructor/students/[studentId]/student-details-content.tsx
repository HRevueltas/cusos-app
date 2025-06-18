"use client"

import { useState, useEffect } from "react"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Award,
  PlayCircle,
  FileText,
  Video,
  HelpCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface StudentDetails {
  student: {
    id: string
    name: string
    email: string
    avatar: string | null
    createdAt: string
  }
  stats: {
    totalCourses: number
    completedCourses: number
    overallProgress: number
    totalLessons: number
    completedLessons: number
  }
  courses: Array<{
    id: string
    title: string
    slug: string
    progress: number
    enrolledAt: string
    completedAt: string | null
    status: 'active' | 'completed' | 'paused'
    modules: Array<{
      id: string
      title: string
      order: number
      progress: number
      lessons: Array<{
        id: string
        title: string
        type: 'video' | 'text' | 'quiz'
        duration: number | null
        completed: boolean
        completedAt: string | null
      }>
    }>
  }>
  recentActivity: Array<{
    id: string
    type: 'lesson_completed' | 'module_completed' | 'course_enrolled' | 'course_completed'
    description: string
    timestamp: string
    courseTitle?: string
    lessonTitle?: string
    moduleTitle?: string
  }>
}

interface StudentDetailsContentProps {
  params: Promise<{ studentId: string }>
}

export default function StudentDetailsContent({ params }: StudentDetailsContentProps) {
  const [studentData, setStudentData] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudentDetails() {
      try {
        const { studentId } = await params
        const response = await fetch(`/api/instructor/students/${studentId}`)
        
        if (!response.ok) {
          throw new Error('Error al cargar los detalles del estudiante')
        }
        
        const data = await response.json()
        setStudentData(data)
      } catch (error) {
        console.error('Error fetching student details:', error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentDetails()
  }, [params])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
          <Link
            href="/dashboard/instructor/students"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista de estudiantes
          </Link>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-gray-600">No se encontraron datos del estudiante</div>
          <Link
            href="/dashboard/instructor/students"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista de estudiantes
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Pausado</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson_completed':
        return <PlayCircle className="h-4 w-4 text-green-600" />
      case 'module_completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'course_enrolled':
        return <BookOpen className="h-4 w-4 text-purple-600" />
      case 'course_completed':
        return <Award className="h-4 w-4 text-yellow-600" />
      default:
        return <HelpCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-red-600" />
      case 'text':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-purple-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <Link
          href="/dashboard/instructor/students"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a estudiantes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Detalles del Estudiante</h1>
      </div>

      <div className="space-y-6">
        {/* Student Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-lg font-semibold">{studentData.student.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg font-semibold">{studentData.student.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                  <p className="text-lg font-semibold">
                    {new Date(studentData.student.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cursos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cursos Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.stats.completedCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Progreso General</p>
                  <p className="text-2xl font-bold text-gray-900">{studentData.stats.overallProgress}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlayCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Lecciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {studentData.stats.completedLessons}/{studentData.stats.totalLessons}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cursos Inscritos</CardTitle>
              </CardHeader>
              <CardContent>
                {studentData.courses.length > 0 ? (
                  <div className="space-y-4">
                    {studentData.courses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{course.title}</h4>
                            <p className="text-sm text-gray-500">
                              Inscrito: {new Date(course.enrolledAt).toLocaleDateString('es-ES')}
                            </p>
                            {course.completedAt && (
                              <p className="text-sm text-green-600">
                                Completado: {new Date(course.completedAt).toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(course.status)}
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progreso</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>

                        {/* Modules */}
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm text-gray-700">Módulos:</h5>
                          {course.modules.map((module) => (
                            <div key={module.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{module.title}</span>
                                <span className="text-xs text-gray-500">{module.progress}%</span>
                              </div>
                              
                              {/* Lessons */}
                              <div className="space-y-1">
                                {module.lessons.map((lesson) => (
                                  <div key={lesson.id} className="flex items-center text-xs text-gray-600">
                                    {getLessonIcon(lesson.type)}
                                    <span className="ml-2 flex-1">{lesson.title}</span>
                                    {lesson.completed ? (
                                      <CheckCircle className="h-3 w-3 text-green-600 ml-2" />
                                    ) : (
                                      <Clock className="h-3 w-3 text-gray-400 ml-2" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay cursos inscritos</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              {studentData.recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {studentData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        {activity.courseTitle && (
                          <p className="text-xs text-gray-500">{activity.courseTitle}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay actividad reciente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
