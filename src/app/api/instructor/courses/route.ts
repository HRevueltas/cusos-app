import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener todos los cursos del instructor con estadísticas
    const courses = await db.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        _count: {
          select: {
            enrollments: true,
            modules: true,
            reviews: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      courses: courses.map(course => {
        const averageRating = course.reviews.length > 0
          ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
          : 0

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          price: course.price,
          isFree: course.isFree,
          isPublished: course.isPublished,
          createdAt: course.createdAt,
          _count: {
            enrollments: course._count.enrollments,
            modules: course._count.modules,
            reviews: course._count.reviews
          },
          averageRating: Math.round(averageRating * 10) / 10
        }
      })
    })

  } catch (error) {
    console.error("Error obteniendo cursos del instructor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const courseId = url.pathname.split('/').pop()

    if (!courseId) {
      return NextResponse.json(
        { error: "ID de curso requerido" },
        { status: 400 }
      )
    }

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar el curso y todos sus datos relacionados
    await db.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Error eliminando curso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
