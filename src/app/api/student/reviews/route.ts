import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema para validar los datos de la review
const reviewSchema = z.object({
  courseId: z.string().min(1, 'El ID del curso es requerido'),
  rating: z.number().min(1, 'La calificación mínima es 1').max(5, 'La calificación máxima es 5'),
  comment: z.string().optional()
})

// POST /api/student/reviews - Crear una nueva review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    // Verificar que el estudiante esté inscrito en el curso
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: validatedData.courseId
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
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      )
    }

    // Verificar que el curso esté 100% completado
    const totalLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length, 0
    )
    const completedLessons = enrollment.progress.filter(p => p.completed).length

    if (completedLessons < totalLessons) {
      return NextResponse.json(
        { 
          error: 'Debes completar el curso al 100% para poder escribir una reseña',
          progress: {
            completed: completedLessons,
            total: totalLessons,
            percentage: Math.round((completedLessons / totalLessons) * 100)
          }
        },
        { status: 403 }
      )
    }

    // Verificar si ya existe una review para este curso
    const existingReview = await db.review.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: validatedData.courseId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'Ya has escrito una reseña para este curso' },
        { status: 409 }
      )
    }

    // Crear la review
    const review = await db.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        userId: session.user.id,
        courseId: validatedData.courseId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      review
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET /api/student/reviews - Obtener reviews del estudiante
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (courseId) {
      // Obtener review específica para un curso
      const review = await db.review.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId
          }
        },
        include: {
          course: {
            select: {
              title: true
            }
          }
        }
      })

      return NextResponse.json({ review })
    } else {
      // Obtener todas las reviews del estudiante
      const reviews = await db.review.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          course: {
            select: {
              title: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return NextResponse.json({ reviews })
    }

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
