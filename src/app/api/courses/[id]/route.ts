import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

interface RouteParams {
  params: {
    id: string
  }
}

// Schema para actualizar curso
const updateCourseSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.string().min(1).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  image: z.string().optional(),
  imagePublicId: z.string().optional(),
  isPublished: z.boolean().optional()
})

// GET /api/courses/[id] - Obtener curso específico
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    const course = await db.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { id: 'desc' }, // Changed from createdAt to id
          take: 5 // Solo las 5 reseñas más recientes
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    // Calcular rating promedio
    const averageRating = course.reviews.length > 0 
      ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
      : 0

    // Calcular total de lecciones
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)

    return NextResponse.json({
      ...course,
      averageRating,
      totalLessons
    })

  } catch (error) {
    console.error("Error obteniendo curso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id] - Actualizar curso
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el curso existe y pertenece al instructor (o es admin)
    const existingCourse = await db.course.findUnique({
      where: { id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    if (session.user.role === "INSTRUCTOR" && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para editar este curso" },
        { status: 403 }
      )
    }    const body = await request.json()
    console.log('Update course body:', body)
    const validatedData = updateCourseSchema.parse(body)
    console.log('Validated data:', validatedData)

    const updatedCourse = await db.course.update({
      where: { id },
      data: validatedData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: "Curso actualizado exitosamente",
      course: updatedCourse
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error actualizando curso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id] - Eliminar curso
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el curso existe y pertenece al instructor (o es admin)
    const existingCourse = await db.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    if (session.user.role === "INSTRUCTOR" && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este curso" },
        { status: 403 }
      )
    }

    // Verificar si tiene estudiantes inscritos
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un curso con estudiantes inscritos" },
        { status: 400 }
      )
    }    await db.course.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Curso eliminado exitosamente"
    })

  } catch (error) {
    console.error("Error eliminando curso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
