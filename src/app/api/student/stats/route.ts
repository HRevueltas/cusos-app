import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener estadísticas del estudiante
    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        progress: true
      }
    })

    const totalCourses = enrollments.length
    const totalLessons = enrollments.reduce((acc, enrollment) => {
      return acc + enrollment.course.modules.reduce((moduleAcc, module) => {
        return moduleAcc + module.lessons.length
      }, 0)
    }, 0)

    const completedLessons = enrollments.reduce((acc, enrollment) => {
      return acc + enrollment.progress.filter(p => p.completed).length
    }, 0)

    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Obtener certificados (cursos completados al 100%)
    const completedCourses = enrollments.filter(enrollment => {
      const courseTotal = enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
      const courseCompleted = enrollment.progress.filter(p => p.completed).length
      return courseTotal > 0 && courseCompleted === courseTotal
    }).length

    return NextResponse.json({
      totalCourses,
      totalLessons,
      completedLessons,
      completionRate,
      certificates: completedCourses,
      enrollments: enrollments.map(enrollment => ({
        id: enrollment.id,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          level: enrollment.course.level,
        },
        progress: {
          completed: enrollment.progress.filter(p => p.completed).length,
          total: enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
        },
        enrolledAt: enrollment.enrolledAt
      }))
    })

  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
