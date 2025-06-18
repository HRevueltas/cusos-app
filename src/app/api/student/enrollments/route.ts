import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/student/enrollments - Verificar inscripciones del estudiante
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
      // Verificar inscripción específica
      const enrollment = await db.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId: courseId
          }
        }
      })

      return NextResponse.json({
        isEnrolled: !!enrollment,
        enrollment
      })
    }

    // Obtener todas las inscripciones del usuario
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: session.user.id
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            category: true,
            level: true,
            price: true,
            isFree: true,
            instructor: {
              select: {
                name: true
              }
            }
          }
        },
        progress: {
          select: {
            completed: true,
            lessonId: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    return NextResponse.json({ enrollments })

  } catch (error) {
    console.error("Error obteniendo inscripciones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
