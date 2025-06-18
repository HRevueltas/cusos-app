"use client"

import { useSession } from "next-auth/react"
import { useStats } from "@/hooks/useStats"
import { BookOpen, Award, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function StudentDashboard() {
  const { data: session } = useSession()
  const { stats, loading, error } = useStats("STUDENT")

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
      title: "Cursos Inscritos",
      value: stats?.totalCourses || 0,
      description: "Cursos activos",
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      title: "Lecciones Completadas",
      value: stats?.completedLessons || 0,
      description: `de ${stats?.totalLessons || 0} lecciones`,
      icon: Award,
      color: "bg-green-500"
    },
    {
      title: "Progreso General",
      value: `${stats?.completionRate || 0}%`,
      description: "Completado",
      icon: TrendingUp,
      color: "bg-purple-500"
    },
    {
      title: "Certificados",
      value: stats?.certificates || 0,
      description: "Obtenidos",
      icon: Clock,
      color: "bg-orange-500"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">¡Hola, {session?.user?.name}!</h1>
        <p className="text-muted-foreground">
          Continúa tu aprendizaje donde lo dejaste
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Cursos Recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Continuar Aprendiendo</h2>
          <Link href="/dashboard/student/courses" className="text-primary hover:underline">
            Ver todos los cursos
          </Link>
        </div>
        {stats?.enrollments && stats.enrollments.length > 0 ? (
          <div className="space-y-4">
            {stats.enrollments.slice(0, 3).map((enrollment: {
              id: string;
              course: {
                id: string;
                title: string;
                description: string;
                level: string;
              };
              progress: {
                completed: number;
                total: number;
              };
            }) => {
              const progressPercentage = enrollment.progress.total > 0 
                ? Math.round((enrollment.progress.completed / enrollment.progress.total) * 100)
                : 0

              return (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{enrollment.course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.progress.completed} de {enrollment.progress.total} lecciones completadas
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        enrollment.course.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                        enrollment.course.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {enrollment.course.level === 'BEGINNER' ? 'Principiante' :
                         enrollment.course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{progressPercentage}%</p>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                        <div 
                          className="h-2 bg-blue-500 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    <Link href={`/learn/${enrollment.course.id}`}>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                        Continuar
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes cursos inscritos
            </h3>
            <p className="text-gray-500 mb-4">
              Explora nuestro catálogo y encuentra el curso perfecto para ti
            </p>
            <Link href="/courses">
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
