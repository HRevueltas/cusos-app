import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Calendar, Clock, Mail, Download } from "lucide-react"
import { StudentSearch } from "@/components/courses/student-search"
import { ClearSearchButton } from "@/components/courses/clear-search-button"
import Link from "next/link"

interface StudentsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string }>
}

export default async function StudentsPage({ params, searchParams }: StudentsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    notFound()
  }

  const searchTerm = resolvedSearchParams.search || ""

  // Obtener el curso con estudiantes inscritos
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
              avatar: true,
              createdAt: true
            }
          },
          progress: {
            include: {
              lesson: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
        },
        where: searchTerm ? {
          student: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } }
            ]
          }
        } : undefined,
        orderBy: {
          enrolledAt: 'desc'
        }
      },
      modules: {
        include: {
          lessons: true
        }
      }
    }
  })

  if (!course) {
    notFound()
  }

  // Calcular el progreso de cada estudiante
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
  
  const studentsWithProgress = course.enrollments.map(enrollment => {
    const completedLessons = enrollment.progress.filter(p => p.completed).length
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    
    return {
      ...enrollment,
      completedLessons,
      totalLessons,
      progressPercentage
    }
  })

  const totalStudents = course.enrollments.length

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
            <h1 className="text-2xl font-bold">Estudiantes del Curso</h1>
          </div>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {totalStudents} estudiantes
          </Badge>
        </div>
      </div>      {/* Filtros y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-auto">
          <StudentSearch />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exportar Lista
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Estudiantes</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Promedio Progreso</p>
                <p className="text-2xl font-bold">
                  {studentsWithProgress.length > 0 
                    ? Math.round(studentsWithProgress.reduce((acc, s) => acc + s.progressPercentage, 0) / studentsWithProgress.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Completaron</p>
                <p className="text-2xl font-bold">
                  {studentsWithProgress.filter(s => s.progressPercentage === 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">En Progreso</p>
                <p className="text-2xl font-bold">
                  {studentsWithProgress.filter(s => s.progressPercentage > 0 && s.progressPercentage < 100).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            Estudiantes inscritos en este curso y su progreso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentsWithProgress.length > 0 ? (
            <div className="space-y-4">
              {studentsWithProgress.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {enrollment.student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {enrollment.student.name}
                        </p>
                        {enrollment.progressPercentage === 100 && (
                          <Badge variant="default" className="text-xs">
                            Completado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {enrollment.student.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Inscrito: {enrollment.enrolledAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {enrollment.completedLessons}/{enrollment.totalLessons}
                      </p>
                      <p className="text-xs text-muted-foreground">lecciones</p>
                    </div>
                    <div className="w-24">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium min-w-[3rem] text-right">
                          {enrollment.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "No se encontraron estudiantes" : "Aún no hay estudiantes"}
              </h3>              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Intenta con otros términos de búsqueda"
                  : "Los estudiantes aparecerán aquí cuando se inscriban al curso"
                }
              </p>
              <ClearSearchButton searchTerm={searchTerm} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href={`/dashboard/instructor/courses/${course.id}/analytics`}>
            Ver Analytics
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/instructor/courses/${course.id}`}>
            Volver al Curso
          </Link>
        </Button>
      </div>
    </div>
  )
}
