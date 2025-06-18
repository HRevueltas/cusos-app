import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Star, TrendingUp, DollarSign, Eye, BookOpen, Clock } from "lucide-react"
import Link from "next/link"

interface AnalyticsPageProps {
  params: Promise<{ id: string }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    notFound()
  }

  // Obtener el curso con datos analíticos
  const course = await db.course.findUnique({
    where: {
      id: resolvedParams.id,
      instructorId: session.user.id
    },
    include: {
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        }
      },      reviews: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      modules: {
        include: {
          lessons: true
        }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true,
          modules: true
        }
      }
    }
  })

  if (!course) {
    notFound()
  }

  // Calcular estadísticas
  const totalStudents = course._count.enrollments
  const totalReviews = course._count.reviews
  const totalModules = course._count.modules
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
  
  const averageRating = course.reviews.length > 0 
    ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
    : 0

  const revenue = course.isFree ? 0 : totalStudents * course.price

  // Estadísticas por mes (últimos 6 meses)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentEnrollments = course.enrollments.filter(
    enrollment => enrollment.enrolledAt >= sixMonthsAgo
  )

  // Agrupación por mes
  const enrollmentsByMonth = recentEnrollments.reduce((acc, enrollment) => {
    const month = enrollment.enrolledAt.toISOString().substring(0, 7) // YYYY-MM
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link 
              href={`/dashboard/instructor/courses/${course.id}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">Analytics del Curso</h1>
          </div>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <Badge variant={course.isPublished ? "default" : "secondary"}>
          {course.isPublished ? "Publicado" : "Borrador"}
        </Badge>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Total de inscripciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalReviews} reseñas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {course.isFree ? "Gratis" : `$${revenue.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {course.isFree ? "Curso gratuito" : `$${course.price.toLocaleString()} por estudiante`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenido</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              {totalModules} módulos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inscripciones recientes y Reseñas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes Recientes</CardTitle>
            <CardDescription>
              Últimas inscripciones al curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.enrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {enrollment.student.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.student.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {enrollment.enrolledAt.toLocaleDateString()}
                  </div>
                </div>
              ))}
              {course.enrollments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aún no hay estudiantes inscritos
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reseñas recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Reseñas Recientes</CardTitle>
            <CardDescription>
              Últimos comentarios de estudiantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="space-y-2">                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {review.user.name}
                    </p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-muted-foreground">
                      "{review.comment}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
              {course.reviews.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aún no hay reseñas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del curso */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Curso</CardTitle>
          <CardDescription>
            Detalles y configuración actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Detalles Básicos</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Categoría:</dt>
                  <dd>{course.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nivel:</dt>
                  <dd>{course.level}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Precio:</dt>
                  <dd>{course.isFree ? "Gratis" : `$${course.price.toLocaleString()}`}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estado:</dt>
                  <dd>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Publicado" : "Borrador"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Fechas</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Creado:</dt>
                  <dd>{course.createdAt.toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Actualizado:</dt>
                  <dd>{course.updatedAt.toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
            Editar Curso
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/instructor/courses/${course.id}`}>
            Ver Curso
          </Link>
        </Button>
      </div>
    </div>
  )
}
