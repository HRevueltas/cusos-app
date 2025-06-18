"use client"

import { useSession } from "next-auth/react"
import { useStats } from "@/hooks/useStats"
import { formatPrice } from "@/lib/utils"
import { BookOpen, Users, DollarSign, Star, Plus, BarChart3, Eye } from "lucide-react"
import Link from "next/link"

export default function InstructorDashboard() {
  const { data: session } = useSession()
  const { stats, loading, error } = useStats("INSTRUCTOR")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: "Mis Cursos",
      value: stats?.totalCourses || 0,
      description: `${stats?.publishedCourses || 0} publicados`,
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      title: "Estudiantes",
      value: stats?.totalStudents || 0,
      description: "Total de estudiantes",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Ingresos",
      value: formatPrice(stats?.totalRevenue || 0),
      description: "Total generado",
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      title: "Valoración",
      value: stats?.averageRating || "0.0",
      description: "Promedio",
      icon: Star,
      color: "bg-yellow-500"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Instructor</h1>
          <p className="text-muted-foreground">
            ¡Hola, {session?.user?.name}! Gestiona tus cursos y ve tu progreso
          </p>
        </div>
        <Link href="/dashboard/instructor/courses/create">
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Curso
          </button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/instructor/courses/create">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Crear Nuevo Curso
            </button>
          </Link>
          <Link href="/dashboard/instructor/analytics">
            <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Ver Estadísticas
            </button>
          </Link>
          <Link href="/dashboard/instructor/courses">
            <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />
              Gestionar Cursos
            </button>
          </Link>
        </div>
      </div>

      {/* Mis Cursos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Mis Cursos</h2>
          <Link href="/dashboard/instructor/courses" className="text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {stats?.courses && stats.courses.length > 0 ? (
          <div className="space-y-4">
            {stats.courses.slice(0, 3).map((course: {
              id: string;
              title: string;
              description: string;
              level: string;
              price: number;
              isFree: boolean;
              isPublished: boolean;
              studentsCount: number;
              lessonsCount: number;
              rating: number;
            }) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.studentsCount} estudiantes • {course.lessonsCount} lecciones
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? 'Publicado' : 'Borrador'}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        course.level === 'BEGINNER' ? 'bg-blue-100 text-blue-800' :
                        course.level === 'INTERMEDIATE' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level === 'BEGINNER' ? 'Principiante' :
                         course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {course.isFree ? 'Gratis' : formatPrice(course.price)}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{course.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/instructor/courses/${course.id}`}>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                      Gestionar
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes cursos creados
            </h3>
            <p className="text-gray-500 mb-4">
              Comparte tu conocimiento creando tu primer curso
            </p>
            <Link href="/dashboard/instructor/courses/create">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Crear mi primer curso
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
