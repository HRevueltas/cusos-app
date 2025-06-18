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

// Schema de validación para crear módulo
const createModuleSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  description: z.string().min(1, "La descripción es obligatoria").max(300, "Máximo 300 caracteres"),
  order: z.number().min(1, "El orden debe ser mayor a 0")
})

// GET /api/courses/[id]/modules - Obtener módulos de un curso
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Await params before using its properties (Next.js 15 requirement)
    const resolvedParams = await params

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.id,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    const modules = await db.module.findMany({
      where: { courseId: resolvedParams.id },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            type: true,
            order: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ modules })

  } catch (error) {
    console.error("Error obteniendo módulos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/modules - Crear módulo
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Await params before using its properties (Next.js 15 requirement)
    const resolvedParams = await params

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.id,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createModuleSchema.parse(body)

    // Verificar que no existe otro módulo con el mismo orden
    const existingModule = await db.module.findFirst({
      where: {
        courseId: resolvedParams.id,
        order: validatedData.order
      }
    })

    if (existingModule) {
      return NextResponse.json(
        { error: "Ya existe un módulo con ese orden" },
        { status: 400 }
      )
    }

    const module = await db.module.create({
      data: {
        ...validatedData,
        courseId: resolvedParams.id
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: "Módulo creado exitosamente",
      module
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creando módulo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
