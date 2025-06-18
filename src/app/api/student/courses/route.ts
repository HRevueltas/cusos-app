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

    // Obtener todas las inscripciones del estudiante con detalles del curso
    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            },
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        progress: true
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    return NextResponse.json({
      enrollments: enrollments.map(enrollment => ({
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          level: enrollment.course.level,
          instructor: {
            name: enrollment.course.instructor.name
          }
        },
        progress: {
          completed: enrollment.progress.filter(p => p.completed).length,
          total: enrollment.course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
        }
      }))
    })

  } catch (error) {
    console.error("Error obteniendo cursos del estudiante:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
