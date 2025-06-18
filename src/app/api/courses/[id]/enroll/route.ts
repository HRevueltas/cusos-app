import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/courses/[id]/enroll - Inscribirse a un curso
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autorizado. Debes iniciar sesión." },
        { status: 401 }
      )
    }

    const { id: courseId } = await params

    // Verificar que el curso existe y está publicado
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado o no disponible" },
        { status: 404 }
      )
    }

    // Verificar si el usuario ya está inscrito
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: courseId
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Ya estás inscrito en este curso" },
        { status: 400 }
      )
    }

    // Crear la inscripción
    const enrollment = await db.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId: courseId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Inscripción exitosa",
      enrollment
    }, { status: 201 })

  } catch (error) {
    console.error("Error en inscripción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
