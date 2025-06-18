import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { enrollmentId, lessonId } = body

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: 'enrollmentId y lessonId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el enrollment pertenece al usuario actual
    const enrollment = await db.enrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId: session.user.id
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la lección existe y pertenece al curso
    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          courseId: enrollment.courseId
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    // Crear o actualizar el progreso
    const progress = await db.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      progress 
    })

  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener courseId de los parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    // Si se proporciona courseId, retornar solo la información de ese curso
    if (courseId) {
      const enrollment = await db.enrollment.findFirst({
        where: { 
          studentId: session.user.id,
          courseId: courseId
        },
        include: {
          course: {
            include: {
              modules: {
                include: {
                  lessons: true
                }
              },
              instructor: {
                select: { name: true }
              }
            }
          },
          progress: true
        }
      })

      if (!enrollment) {
        return NextResponse.json(
          { error: "Curso no encontrado o no estás inscrito" },
          { status: 404 }
        )
      }

      // Calcular progreso del curso específico
      const courseLessons = enrollment.course.modules.reduce(
        (acc, module) => acc + module.lessons.length, 0
      )
        const courseCompleted = enrollment.progress.filter(p => p.completed).length
      const progressPercentage = courseLessons > 0 
        ? Math.min(100, Math.round((courseCompleted / courseLessons) * 100))
        : 0

      return NextResponse.json({
        enrollment,
        stats: {
          totalLessons: courseLessons,
          completedLessons: courseCompleted,
          progressPercentage,
          remainingLessons: courseLessons - courseCompleted
        }
      })
    }

    // Código original para obtener todas las inscripciones
    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            },
            instructor: {
              select: { name: true }
            }
          }
        },
        progress: true
      }
    })

    // Calcular estadísticas de progreso
    let totalLessons = 0
    let completedLessons = 0
    const courses = []

    for (const enrollment of enrollments) {
      const courseLessons = enrollment.course.modules.reduce((acc, module) => 
        acc + module.lessons.length, 0
      )
      const courseCompleted = enrollment.progress.filter(p => p.completed).length
      
      totalLessons += courseLessons
      completedLessons += courseCompleted
        const progressPercentage = courseLessons > 0 
        ? Math.min(100, (courseCompleted / courseLessons) * 100)
        : 0

      // Calcular última actividad
      const lastProgress = enrollment.progress
        .filter(p => p.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
      
      const lastActivity = lastProgress?.completedAt || enrollment.enrolledAt

      // Estimar tiempo restante (aproximado)
      const remainingLessons = courseLessons - courseCompleted
      const estimatedTimeLeft = remainingLessons > 0 
        ? `${Math.ceil(remainingLessons * 0.5)} horas` // 30 min por lección
        : "Completado"

      courses.push({
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        courseLevel: enrollment.course.level,
        totalLessons: courseLessons,
        completedLessons: courseCompleted,
        progressPercentage,
        lastActivity,
        estimatedTimeLeft
      })
    }    const overallProgress = totalLessons > 0 
      ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
      : 0

    const completedCourses = courses.filter(c => c.progressPercentage === 100).length
    const inProgressCourses = courses.filter(c => 
      c.progressPercentage > 0 && c.progressPercentage < 100
    ).length

    // Calcular progreso semanal (aproximado)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weeklyCompletedLessons = await db.progress.count({
      where: {
        completed: true,
        completedAt: {
          gte: oneWeekAgo
        },        enrollment: {
          studentId: session.user.id
        }
      }
    })

    const weeklyProgress = totalLessons > 0 
      ? Math.min(100, Math.round((weeklyCompletedLessons / totalLessons) * 100))
      : 0

    return NextResponse.json({
      totalCourses: enrollments.length,
      completedCourses,
      inProgressCourses,
      totalLessons,
      completedLessons,
      overallProgress,
      weeklyProgress,
      monthlyProgress: weeklyProgress * 4, // Aproximado
      courses
    })

  } catch (error) {
    console.error("Error obteniendo progreso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
