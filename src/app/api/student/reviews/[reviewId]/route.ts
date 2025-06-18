import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema para validar los datos de actualización de la review
const updateReviewSchema = z.object({
  rating: z.number().min(1, 'La calificación mínima es 1').max(5, 'La calificación máxima es 5').optional(),
  comment: z.string().optional()
})

// PUT /api/student/reviews/[reviewId] - Actualizar review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { reviewId } = await params

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateReviewSchema.parse(body)    // Verificar que la review existe y pertenece al usuario
    const existingReview = await db.review.findUnique({
      where: {
        id: reviewId
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta reseña' },
        { status: 403 }
      )
    }

    // Verificar que el curso sigue completado
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: existingReview.courseId
        }
      },
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

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Ya no estás inscrito en este curso' },
        { status: 403 }
      )
    }

    const totalLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length, 0
    )
    const completedLessons = enrollment.progress.filter(p => p.completed).length

    if (completedLessons < totalLessons) {
      return NextResponse.json(
        { error: 'El curso ya no está completado al 100%' },
        { status: 403 }
      )
    }    // Actualizar la review
    const updatedReview = await db.review.update({
      where: {
        id: reviewId
      },
      data: {
        ...(validatedData.rating !== undefined && { rating: validatedData.rating }),
        ...(validatedData.comment !== undefined && { comment: validatedData.comment }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Reseña actualizada exitosamente'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/student/reviews/[reviewId] - Eliminar review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { reviewId } = await params

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
    // Verificar que la review existe y pertenece al usuario
    const existingReview = await db.review.findUnique({
      where: {
        id: reviewId
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Reseña no encontrada' },
        { status: 404 }
      )
    }

    if (existingReview.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta reseña' },
        { status: 403 }
      )
    }

    // Eliminar la review
    await db.review.delete({
      where: {
        id: reviewId
      }
    })

    return NextResponse.json({
      success: true,
      message: `Reseña eliminada exitosamente para el curso "${existingReview.course.title}"`
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
