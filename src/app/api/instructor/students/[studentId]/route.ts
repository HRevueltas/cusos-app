import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el estudiante esté inscrito en al menos un curso del instructor
    const studentEnrollments = await db.enrollment.findMany({
      where: {
        studentId,
        course: {
          instructorId: session.user.id
        }
      },
      include: {
        student: true,
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        },
        progress: {
          include: {
            lesson: {
              include: {
                module: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    if (studentEnrollments.length === 0) {
      return NextResponse.json(
        { error: "Estudiante no encontrado" },
        { status: 404 }
      )
    }

    const student = studentEnrollments[0].student

    // Procesar datos de cada curso
    const courses = studentEnrollments.map(enrollment => {
      const totalLessons = enrollment.course.modules.reduce((acc, module) => 
        acc + module.lessons.length, 0
      )
      const completedLessons = enrollment.progress.filter(p => p.completed).length
      const progressPercentage = totalLessons > 0 
        ? (completedLessons / totalLessons) * 100 
        : 0

      // Agrupar progreso por módulos
      const moduleProgress = enrollment.course.modules.map(module => {
        const moduleTotal = module.lessons.length
        const moduleCompleted = enrollment.progress.filter(p => 
          p.completed && 
          module.lessons.some(lesson => lesson.id === p.lessonId)
        ).length
        
        const lessonProgress = module.lessons.map(lesson => {
          const progress = enrollment.progress.find(p => p.lessonId === lesson.id)
          return {
            id: lesson.id,
            title: lesson.title,
            type: lesson.type as 'video' | 'text' | 'quiz',
            duration: null, // Duration not available in current schema
            completed: progress?.completed || false,
            completedAt: progress?.completedAt?.toISOString() || null
          }
        })

        return {
          id: module.id,
          title: module.title,
          order: module.order,
          progress: moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0,
          lessons: lessonProgress
        }
      })

      // Obtener última actividad
      const lastProgress = enrollment.progress
        .filter(p => p.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
      
      const lastActivity = lastProgress?.completedAt || enrollment.enrolledAt

      // Determinar estado
      let status: 'active' | 'inactive' | 'completed'
      if (progressPercentage === 100) {
        status = 'completed'
      } else {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const recentActivity = enrollment.progress.some(p => 
          p.completedAt && new Date(p.completedAt) >= oneWeekAgo
        )
          status = recentActivity ? 'active' : 'inactive'
      }

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        slug: enrollment.course.id, // Use ID as slug since slug doesn't exist
        progress: Math.round(progressPercentage),
        enrolledAt: enrollment.enrolledAt.toISOString(),
        completedAt: status === 'completed' ? lastActivity.toISOString() : null,
        status: status === 'inactive' ? 'paused' : status,
        modules: moduleProgress
      }
    })    // Calcular estadísticas generales del estudiante
    const totalCoursesEnrolled = courses.length
    const completedCourses = courses.filter(c => c.status === 'completed').length
    
    // Calculate total lessons across all courses
    const allEnrollmentProgress = studentEnrollments.flatMap(e => e.progress)
    const totalLessonsAcrossAllCourses = allEnrollmentProgress.length
    const completedLessonsAcrossAllCourses = allEnrollmentProgress.filter(p => p.completed).length
    const overallProgress = totalLessonsAcrossAllCourses > 0 
      ? (completedLessonsAcrossAllCourses / totalLessonsAcrossAllCourses) * 100 
      : 0

    // Obtener actividad reciente (últimas 10 lecciones completadas)
    const recentActivity = await db.progress.findMany({
      where: {
        completed: true,
        completedAt: { not: null },
        enrollment: {
          studentId,
          course: {
            instructorId: session.user.id
          }
        }
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        createdAt: student.createdAt
      },
      stats: {
        totalCourses: totalCoursesEnrolled,
        completedCourses,
        overallProgress: Math.round(overallProgress),
        totalLessons: totalLessonsAcrossAllCourses,
        completedLessons: completedLessonsAcrossAllCourses
      },
      courses,      recentActivity: recentActivity.map(progress => ({
        id: progress.id,
        type: 'lesson_completed' as const,
        description: `Completó la lección "${progress.lesson.title}"`,
        timestamp: progress.completedAt!.toISOString(),
        courseTitle: progress.lesson.module.course.title,
        lessonTitle: progress.lesson.title,
        moduleTitle: progress.lesson.module.title
      }))
    })

  } catch (error) {
    console.error("Error obteniendo detalles del estudiante:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
