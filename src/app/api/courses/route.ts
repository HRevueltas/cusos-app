import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { Level } from "@prisma/client"

// Schema de validación para crear curso
const createCourseSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().min(1, "La descripción es obligatoria").max(500, "Máximo 500 caracteres"),
  category: z.string().min(1, "La categoría es obligatoria"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  isFree: z.boolean(),
  image: z.string().optional(),
  imagePublicId: z.string().optional()
})

// GET /api/courses - Listar cursos públicos
export async function GET(request: NextRequest) {
  try {    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const price = searchParams.get('price') // free or paid
        const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: {
      isPublished: boolean
      category?: string
      level?: Level
      isFree?: boolean
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
      }>
    } = {
      isPublished: true
    }

    if (category) {
      where.category = category
    }    if (level && (level === 'BEGINNER' || level === 'INTERMEDIATE' || level === 'ADVANCED')) {
      where.level = level as Level
    }

    if (price) {
      if (price === 'free') {
        where.isFree = true
      } else if (price === 'paid') {
        where.isFree = false
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [courses, totalCount] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
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
          },
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit      }),
      db.course.count({ where })
    ])

    const coursesWithRating = courses.map(course => ({
      ...course,
      averageRating: course.reviews.length > 0 
        ? course.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / course.reviews.length
        : 0,
      reviews: undefined // No enviar las reviews completas
    }))

    return NextResponse.json({
      courses: coursesWithRating,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error("Error obteniendo cursos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/courses - Crear curso (solo instructores)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado. Solo los instructores pueden crear cursos." },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validar datos
    const validatedData = createCourseSchema.parse(body)

    // Crear el curso
    const course = await db.course.create({
      data: {
        ...validatedData,
        instructorId: session.user.id,
        isPublished: false // Por defecto en borrador
      },
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
      message: "Curso creado exitosamente",
      course
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creando curso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
