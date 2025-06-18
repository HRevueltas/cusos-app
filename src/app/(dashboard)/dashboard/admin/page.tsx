"use client"

import { useSession } from "next-auth/react"
import { useStats } from "@/hooks/useStats"
import { formatPrice } from "@/lib/utils"
import { Users, BookOpen, DollarSign, Activity, UserPlus, Settings, FileCheck, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { stats, loading, error } = useStats("ADMIN")

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
      title: "Total Usuarios",
      value: stats?.totalUsers || 0,
      description: `${stats?.totalStudents || 0} estudiantes • ${stats?.totalInstructors || 0} instructores`,
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Total Cursos",
      value: stats?.totalCourses || 0,
      description: `${stats?.publishedCourses || 0} publicados`,
      icon: BookOpen,
      color: "bg-green-500"
    },
    {
      title: "Ingresos Totales",
      value: formatPrice(stats?.totalRevenue || 0),
      description: "Total generado",
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      title: "Actividad Hoy",
      value: stats?.usersToday || 0,
      description: "Nuevos usuarios hoy",
      icon: Activity,
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Administrador</h1>
          <p className="text-muted-foreground">
            Gestiona la plataforma y supervisa el rendimiento
          </p>
        </div>
      </div>

      {/* Estadísticas Principales */}
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

      {/* Estadísticas Adicionales */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Inscripciones</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats?.totalEnrollments || 0}</p>
          <p className="text-sm text-gray-600">Total de inscripciones</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Estudiantes</h3>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.totalStudents || 0}</p>
          <p className="text-sm text-gray-600">Usuarios estudiantes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Instructores</h3>
            <UserPlus className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats?.totalInstructors || 0}</p>
          <p className="text-sm text-gray-600">Usuarios instructores</p>
        </div>
      </div>      {/* Gestión del Sistema */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gestión del Sistema</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/admin/users">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Gestionar Usuarios
            </button>
          </Link>
          <Link href="/dashboard/admin/courses">
            <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <FileCheck className="w-5 h-5" />
              Moderar Cursos
            </button>
          </Link>
        </div>
      </div>

      {/* Usuarios y Cursos Recientes */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Usuarios Recientes</h2>
            <Link href="/dashboard/admin/users" className="text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {stats?.recentUsers && stats.recentUsers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((user: {
                id: string;
                name: string;
                email: string;
                role: string;
                createdAt: string;
              }) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'INSTRUCTOR' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.role === 'STUDENT' ? 'Estudiante' :
                       user.role === 'INSTRUCTOR' ? 'Instructor' : 'Admin'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay usuarios recientes para mostrar.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cursos Recientes</h2>
            <Link href="/dashboard/admin/courses" className="text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {stats?.recentCourses && stats.recentCourses.length > 0 ? (
            <div className="space-y-3">
              {stats.recentCourses.map((course: {
                id: string;
                title: string;
                instructor: string;
                studentsCount: number;
                isPublished: boolean;
                createdAt: string;
              }) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-gray-600">por {course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {course.studentsCount} estudiantes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay cursos recientes para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  )
}
