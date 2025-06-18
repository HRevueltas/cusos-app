import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener todos los cursos con información del instructor y estadísticas
    const courses = await db.course.findMany({
      include: {
        instructor: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        price: course.price,
        isFree: course.isFree,
        isPublished: course.isPublished,
        createdAt: course.createdAt,
        instructor: {
          name: course.instructor.name,
          email: course.instructor.email
        },
        _count: {
          enrollments: course._count.enrollments,
          modules: course._count.modules,
          reviews: course._count.reviews
        }
      }))
    })

  } catch (error) {
    console.error("Error obteniendo cursos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
